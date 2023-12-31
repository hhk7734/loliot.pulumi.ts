// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "../../utilities";

// Export members:
export { WasmPluginArgs } from "./wasmPlugin";
export type WasmPlugin = import("./wasmPlugin").WasmPlugin;
export const WasmPlugin: typeof import("./wasmPlugin").WasmPlugin = null as any;
utilities.lazyLoad(exports, ["WasmPlugin"], () => require("./wasmPlugin"));


const _module = {
    version: utilities.getVersion(),
    construct: (name: string, type: string, urn: string): pulumi.Resource => {
        switch (type) {
            case "kubernetes:extensions.istio.io/v1alpha1:WasmPlugin":
                return new WasmPlugin(name, <any>undefined, { urn })
            default:
                throw new Error(`unknown resource type ${type}`);
        }
    },
};
pulumi.runtime.registerResourceModule("istio", "extensions.istio.io/v1alpha1", _module)
