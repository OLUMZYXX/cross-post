const USE_LOCAL_SERVER = false;

const LOCAL_SERVER_URL = "http://localhost:4000/api";
const PRODUCTION_SERVER_URL = "https://cross-post-d75v.onrender.com/api";

export const API_BASE_URL = USE_LOCAL_SERVER
  ? LOCAL_SERVER_URL
  : PRODUCTION_SERVER_URL;

export const SERVER_ROOT_URL = USE_LOCAL_SERVER
  ? "http://localhost:4000"
  : "https://cross-post-d75v.onrender.com";
