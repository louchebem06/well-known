import { Module } from "@nestjs/common";
import { WellKnownModule } from "@well-known-js/nestjs";

import wellKnownConfig from "../well-known.config.js";

@Module({
	imports: [WellKnownModule.forRoot(wellKnownConfig)],
})
export class AppModule {}
