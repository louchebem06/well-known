export interface GeneratedFile {
	path: `/.well-known/${string}`;
	filename: string;
	contentType: string;
	body: string;
}

export interface ProviderInstance {
	name: string;
	path: `/.well-known/${string}`;
	generate(): GeneratedFile;
}

export interface IntegrationConfig {
	providers: ProviderInstance[];
}

export type FeatureStatus = "development" | "ready";

export interface FeatureDefinition {
	id: string;
	package: string;
	export: string;
	filename: string;
	path: `/.well-known/${string}`;
	contentType: string;
	status: FeatureStatus;
}

export interface IntegrationDefinition {
	id: string;
	package: string;
	example: string;
}

export interface CoverageManifest {
	technicalPackages: string[];
	integrations: IntegrationDefinition[];
	features: FeatureDefinition[];
}

export interface LoadedIntegration {
	id: string;
	packageName: string;
	dependencies: Set<string>;
	config?: IntegrationConfig;
	loadError?: string;
}

export interface CoverageInput {
	manifest: CoverageManifest;
	workspacePackages: Set<string>;
	integrations: LoadedIntegration[];
	featureExports: Map<string, Set<string>>;
}

export interface CoverageIssue {
	severity: "error" | "warning";
	feature?: string;
	integration?: string;
	message: string;
}

export interface CoverageCell {
	feature: string;
	integration: string;
	status: "pass" | "warning" | "error";
	detail: string;
}

export interface CoverageResult {
	issues: CoverageIssue[];
	cells: CoverageCell[];
	hasErrors: boolean;
}

function severityFor(feature: FeatureDefinition): CoverageIssue["severity"] {
	return feature.status === "ready" ? "error" : "warning";
}

function validateFile(feature: FeatureDefinition, file: GeneratedFile): string[] {
	const errors: string[] = [];
	if (file.filename !== feature.filename) errors.push(`filename is ${file.filename}`);
	if (file.path !== feature.path) errors.push(`path is ${file.path}`);
	if (file.contentType !== feature.contentType)
		errors.push(`Content-Type is ${file.contentType}`);
	if (feature.contentType === "application/json") {
		try {
			JSON.parse(file.body);
		} catch {
			errors.push("body is not valid JSON");
		}
	}
	return errors;
}

export function validateIntegrationCoverage(input: CoverageInput): CoverageResult {
	const issues: CoverageIssue[] = [];
	const cells: CoverageCell[] = [];
	const classifiedPackages = new Set([
		...input.manifest.technicalPackages,
		...input.manifest.integrations.map((integration) => integration.package),
		...input.manifest.features.map((feature) => feature.package),
	]);

	for (const packageName of input.workspacePackages) {
		if (!classifiedPackages.has(packageName)) {
			issues.push({
				severity: "error",
				message: `Unclassified workspace package: ${packageName}`,
			});
		}
	}
	for (const packageName of classifiedPackages) {
		if (!input.workspacePackages.has(packageName)) {
			issues.push({
				severity: "error",
				message: `Manifest package does not exist: ${packageName}`,
			});
		}
	}

	const loadedById = new Map(
		input.integrations.map((integration) => [integration.id, integration]),
	);
	for (const definition of input.manifest.integrations) {
		if (!loadedById.has(definition.id)) {
			issues.push({
				severity: "error",
				integration: definition.id,
				message: `Missing example: examples/${definition.example}`,
			});
		}
	}
	for (const integration of input.integrations) {
		if (!input.manifest.integrations.some((definition) => definition.id === integration.id)) {
			issues.push({
				severity: "error",
				integration: integration.id,
				message: `Unclassified integration example: ${integration.id}`,
			});
		}
	}

	for (const feature of input.manifest.features) {
		if (!input.featureExports.get(feature.package)?.has(feature.export)) {
			issues.push({
				severity: severityFor(feature),
				feature: feature.id,
				message: `${feature.package} does not export ${feature.export}`,
			});
		}

		for (const definition of input.manifest.integrations) {
			const integration = loadedById.get(definition.id);
			let detail = "ok";
			const failures: string[] = [];

			if (!integration) failures.push("example is missing");
			else {
				if (!integration.dependencies.has(feature.package)) {
					failures.push(`missing dependency ${feature.package}`);
				}
				if (integration.loadError)
					failures.push(`config failed to load: ${integration.loadError}`);
				else if (integration.config) {
					const provider = integration.config.providers.find(
						(item) => item.name === feature.id,
					);
					if (!provider) failures.push("provider is missing from well-known.config.ts");
					else {
						try {
							failures.push(...validateFile(feature, provider.generate()));
						} catch (error) {
							failures.push(
								`provider generation failed: ${error instanceof Error ? error.message : String(error)}`,
							);
						}
					}
				} else failures.push("well-known.config.ts is missing");
			}

			const severity = severityFor(feature);
			if (failures.length > 0) {
				detail = failures.join("; ");
				issues.push({
					severity,
					feature: feature.id,
					integration: definition.id,
					message: detail,
				});
			}
			cells.push({
				feature: feature.id,
				integration: definition.id,
				status: failures.length === 0 ? "pass" : severity,
				detail,
			});
		}
	}

	return { issues, cells, hasErrors: issues.some((issue) => issue.severity === "error") };
}
