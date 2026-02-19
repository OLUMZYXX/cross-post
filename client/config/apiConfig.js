/**
 * API Configuration
 *
 * Toggle USE_LOCAL_SERVER to switch between local and production servers.
 * - true  → uses your local dev server (LOCAL_SERVER_URL)
 * - false → uses the deployed Render server (PRODUCTION_SERVER_URL)
 */

const USE_LOCAL_SERVER = true;

const LOCAL_SERVER_URL = "http://192.168.1.40:4000/api";
const PRODUCTION_SERVER_URL = "https://cross-post-d75v.onrender.com/api";

export const API_BASE_URL = USE_LOCAL_SERVER
  ? LOCAL_SERVER_URL
  : PRODUCTION_SERVER_URL;

export const SERVER_ROOT_URL = USE_LOCAL_SERVER
  ? "http://192.168.1.40:4000"
  : "https://cross-post-d75v.onrender.com";
