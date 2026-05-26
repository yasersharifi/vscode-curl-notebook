/** Notebook type id registered with VS Code. */
export const NOTEBOOK_TYPE = 'curl-notebook';

/** Language id for executable curl cells. */
export const CURL_LANGUAGE_ID = 'shell';

/** Language id for markdown documentation cells. */
export const MARKDOWN_LANGUAGE_ID = 'markdown';

/** Configuration namespace prefix. */
export const CONFIG_SECTION = 'curlNotebook';

/** MIME type for markdown cell output. */
export const OUTPUT_MIME_MARKDOWN = 'text/markdown';

/** MIME type for plain error output. */
export const OUTPUT_MIME_TEXT = 'text/plain';

/** Sentinel written by curl --write-out to parse metadata. */
export const CURL_META_SENTINEL = '__CURL_NOTEBOOK_META__';
