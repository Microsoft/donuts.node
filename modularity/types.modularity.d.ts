//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

namespace Donuts.Modularity {
    type ComponentType = "local" | "remote";

    interface IModuleInfo {
        name: string;
        /**
         * The namespace for the components in the module to register under.
         * If the namespace is not provided, module name will be used.
         */
        namespace?: string;
        version: string;
        hostVersion?: string;
        dependencies?: {
            [moduleName: string]: string
        };
    }

    interface IModule {
        getModuleMetadata(components: IComponentCollection): IModuleInfo;
        initializeAsync?(moduleManager: IModuleManager): Promise<void>;
    }

    type NonPromiseReturnType<T extends FunctionType> = ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>;

    type FunctionComponent<T extends FunctionType> = (...args: Array<any>) => Promise<Component<NonPromiseReturnType<T>>>;

    type PrimitiveType = void | String | Number | Boolean | Date | Buffer | null | undefined;

    type SerializableArray<TItem> = {
        [index: number]:
        TItem extends PrimitiveType ? TItem :
        TItem extends FunctionType ? never :
        TItem extends SerializableObject<TItem> ? TItem :
        TItem extends Array<infer TSubItem> ? SerializableArray<TSubItem> :
        never;
    };

    type SerializableObject<T> = {
        [Property in keyof T]:
        T[Property] extends SerializableType<T[Property]> ? T[Property] :
        never;
    };

    type SerializableType<T> =
        T extends PrimitiveType ? T :
        T extends FunctionType ? never :
        T extends SerializableArray<infer TItem> ? T :
        T extends SerializableObject<T> ? T : never;

    interface ArrayComponent<TItem>
        extends Array<Component<TItem>> {
    }

    type ObjectComponent<T> = {
        [Property in keyof T]:
        T[Property] extends FunctionType ? FunctionComponent<T[Property]> :
        T[Property] extends Promise<infer R> ? Promise<Component<R>> :
        Promise<Component<T[Property]>>;
    };

    type Component<T> =
        T extends void ? T :
        T extends String ? T :
        T extends Number ? T :
        T extends Boolean ? T :
        T extends Date ? T :
        T extends Buffer ? T :
        T extends FunctionType ? FunctionComponent<T> :
        T extends Array<infer TItem> ? (TItem extends SerializableType<TItem> ? Array<TItem> : ArrayComponent<TItem>) :
        T extends Object ? (
            keyof T extends never ? never :
            T extends SerializableObject<T> ? T :
            ObjectComponent<T>)
        : never;

    interface ComponentDescriptor<T> {
        (...args: Array<any>): Promise<Component<T>>;
    }

    interface IComponentInfo<T> {
        name: string;
        version?: string;
        descriptor: ComponentDescriptor<T>;
        singleton?: boolean;
        type?: ComponentType;
        deps?: Array<string>;
    }

    interface IComponentCollection {
        register<T>(componentInfo: IComponentInfo<T>): this;
    }

    interface IModuleManager extends IDisposable {
        loadModulesAsync(modulePaths: Array<string>): Promise<this>;

        registerComponentsAsync(namespace: string, componentInfos: Array<Donuts.Modularity.IComponentInfo<any>>, force?: boolean): Promise<this>;
        
        getComponentAsync<T>(componentIdentity: string, ...extraArgs: Array<any>): Promise<Component<T>>;
    }
}