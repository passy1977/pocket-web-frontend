'use strict';


const BACKEND_URL = 'http://localhost:8080';

export const TITLE = 'Pocket 5';

export const FORCE_SEARCH = 'force_search=';

export const PASSWD_MIN_LEN = 8;

export const MAX_INPUT_LEN = 256;

export const MAX_TEXT_AREA_LEN = 2_048;

export const MAX_FILE_SIZE = 5 * 1_024 * 1_024; // 5 MB

export const ALLOWED_MIME_TYPES = [
  'application/json',
  'application/xml',
  'text/xml'
];

export const HEARTBEAT_INTERVAL = 5 * 1_000; // 5 seconds

export const HEARTBEAT_DISABLE = true;

export default BACKEND_URL;