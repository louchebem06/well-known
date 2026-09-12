import type { FactoryProvider, ModuleMetadata } from "@nestjs/common";
import type { WellKnownConfig } from "@well-known-js/core";

export interface WellKnownModuleAsyncOptions
	extends
		Pick<ModuleMetadata, "imports">,
		Pick<FactoryProvider<WellKnownConfig>, "inject" | "useFactory"> {}
