import { Controller, Get, Inject, NotFoundException, Param, StreamableFile } from "@nestjs/common";

import { WellKnownService } from "./service.js";

@Controller(".well-known")
export class WellKnownController {
	constructor(@Inject(WellKnownService) private readonly wellKnownService: WellKnownService) {}

	@Get("*path")
	serve(@Param("path") path: string | string[]): StreamableFile {
		const relativePath = Array.isArray(path) ? path.join("/") : path;
		const file = this.wellKnownService.get(`/.well-known/${relativePath}`);

		if (!file) {
			throw new NotFoundException();
		}

		return new StreamableFile(Buffer.from(file.body), {
			type: file.contentType,
		});
	}
}
