export function friendlyFacebookError(error, fallback = "Failed to post to Facebook") {
  const code = error?.code;
  const subcode = error?.error_subcode;

  if (code === 368 || subcode === 1390008) {
    return "Facebook has temporarily paused posting from this Page because too many posts went out in a short time. It usually clears by itself within a few hours - try again later.";
  }
  if (code === 506) {
    return "Facebook rejected this as a duplicate of a recent post. Change the caption or media and try again.";
  }
  if (code === 190) {
    return "Your Facebook connection has expired. Reconnect Facebook in Settings.";
  }
  if (code === 200 || code === 10 || code === 3) {
    return "This Facebook Page is missing publishing permission. Reconnect Facebook and allow posting to the Page.";
  }
  if (code === 4 || code === 17 || code === 32 || code === 613) {
    return "Facebook's posting rate limit has been reached. Wait a while and try again.";
  }
  if (code === 1609005) {
    return "Facebook could not load the link or media in this post.";
  }

  return error?.message || fallback;
}
