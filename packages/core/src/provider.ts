export interface WellKnownGeneratedFile {
	path: `/.well-known/${string}`;
	filename: string;
	contentType: string;
	body: string;
}

export interface WellKnownProvider<TConfig = unknown> {
	name: string;
	path: `/.well-known/${string}`;

	generate(config: TConfig): WellKnownGeneratedFile;
}

export interface WellKnownProviderInstance {
	name: string;
	path: `/.well-known/${string}`;

	generate(): WellKnownGeneratedFile;
}
