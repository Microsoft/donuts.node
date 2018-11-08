//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
'use strict';

const remote = require("donuts.node-remote");
const { DiContainer } = require("donuts.node/di");
const fs = require("fs");
const utils = require("donuts.node/utils");

/**
 * @class
 * @implements {Donuts.Modularity.IComponentCollection}
 */
class ComponentCollection {
    constructor() {
        /**
         * @public
         * @readonly
         * @type {Object.<string, Donuts.Modularity.IComponentInfo<*>>}
         */
        this.components = Object.create(null);
    }

    /**
     * @public
     * @param {Donuts.Modularity.IComponentInfo<*>} componentInfo 
     * @returns {this}
     */
    register(componentInfo) {
        if (!utils.isObject(componentInfo)) {
            throw new Error("componentInfo must be an object");
        }

        if (!utils.isString(componentInfo.name)) {
            throw new Error("componentInfo.name must be supplied.");
        }

        if (!utils.isFunction(componentInfo.descriptor)) {
            throw new Error("componentInfo.descriptor must be a function.");
        }

        if (!utils.isNullOrUndefined(componentInfo.deps)
            && !Array.isArray(componentInfo.deps)) {
            throw new Error(`The deps of component "${componentInfo.name}" should be an array of string.`);
        }

        if (Array.isArray(componentInfo.deps)) {
            for (const depName of componentInfo.deps) {
                if (!utils.isString(depName)) {
                    throw new Error(`The deps of component "${componentInfo.name}" should be an array of string.`);
                }
            }
        }

        if (componentInfo.name in this.components) {
            throw new Error(`The component is already taken: ${componentInfo.name}`)
        }

        this.components[componentInfo.name] = componentInfo;

        return this;
    }
}

/**
 * @class
 * @implements {Donuts.Modularity.IModuleManager}
 * @implements {Donuts.Modularity.IObjectRemotingRouter}
 */
class ModuleManager {
    /**
     * 
     * @param {Donuts.Remote.ICommunicationHost | Donuts.Remote.ICommunicator} communication
     */
    constructor(communication) {
        /**
         * @private
         * @type {Donuts.Modularity.IObjectRemotingRouter}
         */
        this.router = undefined;

        if (remote.isCommunicator(communication)) {
            const { ObjectRemotingRouter } = require("./object-remoting-router");

            this.router = new ObjectRemotingRouter(communication, this);

        } else if (remote.isCommunicationHost(communication)) {
            const { ObjectRemotingHostRouter } = require("./object-remoting-host-router");

            this.router = new ObjectRemotingHostRouter(communication, this);

        } else {
            throw new Error("communication must be a valid Donuts.Remote.ICommunicationHost or Donuts.Remote.ICommunicator.");
        }

        /**
         * @private
         * @readonly
         * @type {Object.<string, string>}
         */
        this.loadedModules = Object.create(null);

        /**
         * @private
         * @readonly
         * @type {Object.<string, Donuts.Modularity.IComponentInfo<*>>}
         */
        this.components = Object.create(null);

        /**
         * @private
         * @readonly
         * @type {Donuts.DI.IDiContainer}
         */
        this.componentsContainer = new DiContainer();

        this.componentsContainer.set("module-manager", () => this);
    }

    /**
     * @public
     * @param {Array.<string>} modulePaths
     * @return {Promise.<this>}
     */
    async loadModulesAsync(modulePaths) {
        this.validateDisposal();

        if (!Array.isArray(modulePaths)) {
            throw new Error("modulePaths must be an array of string.");
        }

        await this.initializeModulesAync(this.loadModuleInfos(modulePaths));

        return this;
    }

    /**
     * @public
     * @template T
     * @param {string} componentIdentity,
     * @param {...*} extraArgs
     * @returns {Promise<Donuts.Modularity.Component<T>>}
     */
    async getComponentAsync(componentIdentity, ...extraArgs) {
        this.validateDisposal();

        if (!utils.isString(componentIdentity)) {
            throw new Error("componentIdentity must be string");
        }

        /** @type {Donuts.Modularity.Component<T>} */
        let component = await this.componentsContainer.getDep(componentIdentity, ...extraArgs);

        if (component !== undefined) {
            return component;
        }

        return await this.router.requestAsync(componentIdentity, ...extraArgs);
    }

    /**
     * @public
     * @template T
     * @param {string} identifier 
     * @param  {...any} extraArgs 
     * @returns {Promise<T>}
     */
    requestAsync(identifier, ...extraArgs) {
        this.validateDisposal();

        const component = this.components[identifier];

        if (component && component.type === "local") {
            return Promise.resolve(undefined);
        }

        return this.componentsContainer.getDep(identifier, ...extraArgs);
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async disposeAsync() {
        if (this.router) {
            await this.router.disposeAsync();

            this.router = undefined;
        }
    }

    /**
     * @private
     * @return {void}
     */
    validateDisposal() {
        if (this.router === undefined) {
            throw new Error("ModuleManager already disposed.");
        }
    }

    /**
     * @private
     * @param {Array.<string>} modulePaths
     * @returns {Object.<string, Donuts.Modularity.ILoadedModuleInfo>}
     */
    loadModuleInfos(modulePaths) {
        /** @type {Object.<string, Donuts.Modularity.ILoadedModuleInfo>} */
        const moduleInfos = Object.create(null);

        for (const modulePath of modulePaths) {
            if (!fs.existsSync(modulePath)) {
                throw new Error(`The path points to non-existing location: ${modulePath}`);
            }

            /** @type {Donuts.Modularity.IModule} */
            const loadedModule = require(modulePath);

            if (!utils.isFunction(loadedModule.getModuleMetadata)) {
                throw new Error(`Invalid module: ${modulePath}`);
            }

            /** @type {ComponentCollection} */
            const componentCollection = new ComponentCollection();
            const moduleInfo = loadedModule.getModuleMetadata(componentCollection);

            if (!utils.isObject(moduleInfo)) {
                throw new Error(`moduleInfo must be an object: ${modulePath}`);
            }

            if (!utils.isString(moduleInfo.name)) {
                throw new Error(`moduleInfo.name must be a string: ${modulePath}`);
            }

            if (!utils.isString(moduleInfo.version)) {
                throw new Error(`moduleInfo.version must be a string: ${modulePath}`);
            }

            if (moduleInfo.name in moduleInfos
                || moduleInfo.name in this.loadedModules) {
                throw new Error(`module with name "${moduleInfo.name}" is already registered.`);
            }

            // @ts-ignore
            moduleInfos[moduleInfo.name] = moduleInfo;
            moduleInfos[moduleInfo.name].module = loadedModule;
            moduleInfos[moduleInfo.name].components = Object.values(componentCollection.components);
        }

        return moduleInfos;
    }

    /**
     * @private
     * @param {Donuts.Modularity.ComponentDescriptor<*>} componentDescriptor 
     * @param {Array.<string>} deps 
     * @returns {Donuts.DI.IDiDescriptor.<*>}
     */
    createDedicationDiDescriptor(componentDescriptor, deps) {
        return async (container, ...extraArgs) => {
            /** @type {Array.<*>} */
            const args = [];

            if (Array.isArray(deps)) {
                for (const depName of deps) {
                    args.push(await this.getComponentAsync(depName));
                }
            }

            args.push(...extraArgs);

            return await componentDescriptor(...args);
        };
    }

    /**
     * @private
     * @param {Donuts.Modularity.ComponentDescriptor<*>} componentDescriptor 
     * @param {Array.<string>} deps 
     * @returns {Donuts.DI.IDiDescriptor.<*>}
     */
    createSingletonDiDescriptor(componentDescriptor, deps) {
        let dedicationDescriptor = this.createDedicationDiDescriptor(componentDescriptor, deps);

        /** @type {Promise<*>} */
        let singleton = undefined;

        return async (container, ...extraArgs) => {
            if (singleton === undefined) {
                singleton = dedicationDescriptor(container, ...extraArgs);
                dedicationDescriptor = undefined;
            }

            return singleton;
        };
    }

    /**
     * @public
     * @param {string} namespace
     * @param {Array.<Donuts.Modularity.IComponentInfo<*>>} componentInfos 
     * @param {boolean} [force=false]
     * @returns {Promise<this>}
     */
    async registerComponentsAsync(namespace, componentInfos, force) {
        for (const componentInfo of componentInfos) {
            const componentName = `${namespace}.${componentInfo.name}`;

            if (force !== true && this.componentsContainer.get(componentName)) {
                throw new Error(`Component name, "${componentName}", has already been registered.`);
            }

            if (componentInfo.singleton === true) {
                this.componentsContainer.set(
                    componentName,
                    this.createSingletonDiDescriptor(componentInfo.descriptor, componentInfo.deps));

            } else {
                this.componentsContainer.set(
                    componentName,
                    this.createDedicationDiDescriptor(componentInfo.descriptor, componentInfo.deps));
            }
        }

        return this;
    }

    /**
     * @private
     * @param {Object.<string, Donuts.Modularity.ILoadedModuleInfo>} toInitializedModules
     * @returns {Promise<void>}
     */
    async initializeModulesAync(toInitializedModules) {
        const moduleInfos = Object.values(toInitializedModules);

        /** @type {number} */
        let previousCount = moduleInfos.length;

        /** @type {number} */
        let triedCount = 0;

        /** @type {Donuts.Modularity.ILoadedModuleInfo} */
        let moduleInfo;

        for (moduleInfo of moduleInfos) {
            if (this.loadedModules[moduleInfo.name]) {
                if (this.loadedModules[moduleInfo.name] === moduleInfo.version) {
                    continue;
                }

                throw new Error(`A different version of module ${moduleInfo.name}@${this.loadedModules[moduleInfo.name]} already registered. (Module to register: ${moduleInfo.name}@${moduleInfo.version}).`);
            }

            await this.registerComponentsAsync(moduleInfo.namespace || moduleInfo.name, moduleInfo.components);
        }

        moduleLoop:
        while (moduleInfo = moduleInfos.shift()) {
            for (const depName in moduleInfo.dependencies) {
                if (!(depName in this.loadedModules)) {

                    if (!(depName in toInitializedModules)) {
                        throw new Error(`Required dependent module "${depName}" by module "${moduleInfo.name}" cannot be found.`);
                    }

                    moduleInfos.push(moduleInfo);

                    // circular references check.
                    if (previousCount === moduleInfos.length) {
                        triedCount++;

                        if (triedCount >= moduleInfos.length) {
                            throw new Error(
                                "There are circular references among the following modules: "
                                + moduleInfos.map((moduleInfo) => moduleInfo.name).join(", "));
                        }

                    } else {
                        previousCount = moduleInfos.length;
                        triedCount = 0;
                    }

                    continue moduleLoop;
                }
            }

            if (utils.isFunction(moduleInfo.module.initializeAsync)) {
                await moduleInfo.module.initializeAsync(this);
            }

            this.loadedModules[moduleInfo.name] = moduleInfo.version;
        }
    }
}
exports.ModuleManager = ModuleManager;