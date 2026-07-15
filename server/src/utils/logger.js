function ts() {
  return new Date().toISOString();
}

function serialize(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function fmt(data = {}) {
  return Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${JSON.stringify(serialize(v))}`)
    .join(" ");
}

function line(tag, data) {
  return `[${ts()}] [${tag}] ${fmt(data)}`;
}

export const logger = {
  publish(event, data) {
    console.log(line(`PUBLISH:${event}`, data));
  },
  connect(event, data) {
    console.log(line(`CONNECT:${event}`, data));
  },
  token(event, data) {
    console.log(line(`TOKEN:${event}`, data));
  },
  apiError(platform, data) {
    console.error(line(`API_ERROR:${platform}`, data));
  },
  info(tag, data) {
    console.log(line(tag, data));
  },
};

export function safeBody(body, max = 600) {
  const text = typeof body === "string" ? body : serialize(body);
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
