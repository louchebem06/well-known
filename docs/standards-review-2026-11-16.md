# Standards review — 2026-11-16

This review covers all 42 open standards-watch issues, grouped by their ten upstream sources.
The provider schemas, generated paths, media types, serializers, tests, and package documentation
were inspected against the current sources. Fingerprints were refreshed with `pnpm standards:refresh`.

## RFC sources

The alerts tracked `/info/rfcNNNN` pages rather than the published documents. These pages now include
an interactive reader, navigation, references, and errata metadata. Changes to their extracted text
do not establish a change to the normative RFC. The watcher now reads `/rfc/rfcNNNN.txt` instead.
This monitors the published RFC text; it does not monitor subsequent errata or replacement RFCs.
The fingerprint change caused by switching formats is intentional.

| Source                                                 | Issues reviewed                   | Provider review and outcome                                                                                                                                                                                             |
| ------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [RFC 9264](https://www.rfc-editor.org/rfc/rfc9264.txt) | #26, #42, #50, #58                | Linkset contexts, relation arrays, URI references, and extension attribute arrays remain represented by the API Catalog schema and JSON serializer. No provider change required by these alerts.                        |
| [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.txt) | #27, #37, #39, #43, #51, #59      | API Catalog continues to use `/.well-known/api-catalog` and the Linkset JSON media type with the RFC 9727 profile. No provider change required by these alerts.                                                         |
| [RFC 8461](https://www.rfc-editor.org/rfc/rfc8461.txt) | #28, #44, #52, #60                | MTA-STS retains `STSv1`, the three policy modes, MX patterns, `max_age`, and CRLF policy serialization. No provider change required by these alerts.                                                                    |
| [RFC 9472](https://www.rfc-editor.org/rfc/rfc9472.txt) | #29, #45, #53, #61                | SBOM continues to emit the caller-supplied representation and media type at `/.well-known/sbom`. It does not implement SBOM format validation or HTTP content negotiation. No provider change required by these alerts. |
| [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414.txt) | #24, #30, #34, #40, #46, #54, #62 | Authorization Server Metadata retains its issuer checks, JWT client-authentication algorithm requirements, extensible JSON fields, and issuer-path discovery placement. No provider change required by these alerts.    |
| [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.txt) | #31, #38, #47, #55, #63           | Protected Resource Metadata retains its resource identifier, authorization server identifiers, extensible metadata, and resource-path discovery placement. No provider change required by these alerts.                 |
| [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.txt) | #32, #35, #41, #48, #56, #64      | security.txt retains Contact and Expires validation, URI and language fields, extension handling, and newline-delimited text at `/.well-known/security.txt`. No provider change required by these alerts.               |

## A2A Agent Cards — #25, #33, #57

Compared the [specification](https://raw.githubusercontent.com/a2aproject/A2A/main/docs/specification.md)
with its revision at the original September 12 baseline. Changes comprise link updates, diagram
styling, and the corrected signing example in
[upstream PR #2319](https://github.com/a2aproject/A2A/pull/2319).
The example now contains all required fields and a nonempty skills array. Section 5.7 already
requires nonempty required arrays; this review found that our `skills` and skill `tags` arrays
did not enforce that requirement. Both now reject empty arrays, with regression coverage.
Optional arrays and explicit false capability values remain supported; serialization and the
Agent Card discovery path are unchanged.

The prose uses generated `proto_to_table` placeholders for field definitions. The watcher now also
tracks [a2a.proto](https://raw.githubusercontent.com/a2aproject/A2A/main/specification/a2a.proto),
so data-model changes can trigger a review even when the prose file stays unchanged.

## GPC — #23

The [WebDriver return-value change](https://github.com/w3c/gpc/commit/1291cb4f0915aa9ca70917c7c52466b91a80a69e)
and [wording clarification](https://github.com/w3c/gpc/commit/955777d749dfd503fe43a8ef20147c1798a38c22)
make the WebDriver command return an object containing the updated `gpc` setting instead of `null`. It does not change the GPC
Support Representation. The provider still accepts boolean `gpc`, RFC 3339 full-date or date-time
`lastUpdate`, and extension members, and emits JSON at `/.well-known/gpc.json`. No implementation
change is needed for this alert.

## Apple Associated Domains — #22, #36

Reviewed the current [Apple documentation](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
and its JSON examples against the AASA schema and generator. The documented `appIDs`, URL path,
query and fragment components, exclusions, comments, `webcredentials.apps`, and `appclips.apps`
are supported. The generated filename has no extension and uses the documented `.well-known`
location. HTTPS, certificate validity, redirects, entitlements, and Apple CDN refresh timing are
deployment concerns rather than changes to the generated JSON. No provider change is needed.
The old document payload is not stored in the repository, so the two historical Apple payload
changes cannot be reconstructed from their fingerprints alone.

## Preventing repeated alerts

The watcher previously deduplicated only exact fingerprints, allowing every revision of an
unreviewed source to create another issue. It now suppresses new alerts while an issue for the
same source is open. Closed issues suppress only the exact recorded revision, allowing later
changes to be reviewed. Workflow concurrency serializes scheduled and manual checks. Tests cover
open issues with newer revisions, already-reviewed revisions, and changes after a closed issue.
