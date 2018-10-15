//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { IModuleInfo, IModule } from "donut.node/module-manager";
import { IHttpClient, HttpRequestHandler, HttpResponseHandler } from "donut.node/http";
import { IPkiCertificateService } from "donut.node/cert";
import { ILog } from "donut.node/logging";

(<IModule>exports).getModuleMetadata = (components): IModuleInfo => {
    const appUtils = require("../../utilities/appUtils");

    components
        .register<IHttpClient>({
            name: "http.http-client",
            version: appUtils.getAppVersion(),
            descriptor: (log: ILog, requestHandlers?: Array<HttpRequestHandler>, responseHandlers?: Array<HttpResponseHandler>): Promise<IHttpClient> =>
                Promise.resolve(new (require("./http-client").default)(log, requestHandlers, responseHandlers)),
            deps: ["logging"]
        })

        .register<IHttpClient>({
            name: "http.http-client.service-fabric",
            version: appUtils.getAppVersion(),
            descriptor: (log: ILog, pkiSvc: IPkiCertificateService): Promise<IHttpClient> =>
                Promise.resolve(new (require("./http-client.sf").default)(log, pkiSvc)),
            deps: ["logging", "cert.pki-service"]
        });

    return {
        name: "http",
        version: appUtils.getAppVersion()
    };
};
