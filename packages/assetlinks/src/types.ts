/** Configuration accepted by the Digital Asset Links provider. */
export interface AssetLinks {
	statements: AssetLinkStatement[];
}

export type AssetLinkStatement = AssetLinkTargetStatement | AssetLinkIncludeStatement;

export interface AssetLinkTargetStatement {
	relation: string[];
	target: AssetLinkTarget;
}

export interface AssetLinkIncludeStatement {
	include: string;
}

export type AssetLinkTarget = AndroidAppTarget | WebTarget;

export interface AndroidAppTarget {
	namespace: "android_app";
	package_name: string;
	sha256_cert_fingerprints: string[];
}

export interface WebTarget {
	namespace: "web";
	site: string;
}
