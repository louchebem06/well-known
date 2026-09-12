/** RFC 9116 security.txt configuration. */
export interface SecurityTxt {
	/** Reporting methods in preference order. At least one is required. */
	contacts: string[];
	/** RFC 3339 timestamp after which this file is considered stale. */
	expires: string | Date;
	/** Optional comments emitted before the fields, without the leading `#`. */
	comments?: string[];
	acknowledgments?: string[];
	canonical?: string[];
	encryption?: string[];
	hiring?: string[];
	policy?: string[];
	preferredLanguages?: string[];
	/** Registered extension fields. Names are emitted as provided. */
	extensions?: Record<string, string[]>;
}

/** Validated and normalized security.txt configuration. */
export interface NormalizedSecurityTxt extends Omit<SecurityTxt, "expires"> {
	expires: string;
}
