import posthog from "posthog-js";

const token = (process.env.REACT_APP_POSTHOG_PROJECT_TOKEN || "").trim();
const host = (process.env.REACT_APP_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");

export const analyticsEnabled = Boolean(token);

if (analyticsEnabled) {
  posthog.init(token, {
    api_host: host,
    capture_pageview: false,
    autocapture: true,
    person_profiles: "identified_only",
    before_send: (event) => {
      if (event?.properties) {
        delete event.properties.email;
        delete event.properties.password;
        delete event.properties.token;
      }
      return event;
    },
  });
}

export const track = (event, properties = {}) => {
  if (analyticsEnabled) posthog.capture(event, properties);
};
