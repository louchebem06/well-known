/** WebAuthn related origins discovery configuration. */
export interface WebAuthn {
	/** HTTPS origins allowed to share credentials with the relying party ID. */
	origins: string[];
}

export interface WebAuthnJsonOptions {
	/** Indent JSON with tabs by default. */
	pretty?: boolean;
}
