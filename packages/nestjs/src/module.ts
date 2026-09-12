import type { DynamicModule, Provider } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { WellKnownConfig } from "@well-known-js/core";

import { WELL_KNOWN_CONFIG } from "./constants.js";
import { WellKnownController } from "./controller.js";
import { WellKnownService } from "./service.js";
import type { WellKnownModuleAsyncOptions } from "./types.js";

@Module({})
export class WellKnownModule {
	static forRoot(config: WellKnownConfig): DynamicModule {
		return this.createModule({
			provide: WELL_KNOWN_CONFIG,
			useValue: config,
		});
	}

	static forRootAsync(options: WellKnownModuleAsyncOptions): DynamicModule {
		return {
			...this.createModule({
				provide: WELL_KNOWN_CONFIG,
				inject: options.inject ?? [],
				useFactory: options.useFactory,
			}),
			imports: options.imports ?? [],
		};
	}

	private static createModule(configProvider: Provider): DynamicModule {
		return {
			module: WellKnownModule,
			controllers: [WellKnownController],
			providers: [configProvider, WellKnownService],
			exports: [WellKnownService],
		};
	}
}
