import { onRequestPost as __api_email_js_onRequestPost } from "C:\\Users\\CCCCAOYING\\fit5032\\MindHeaven\\functions\\api\\email.js"
import { onRequestGet as __api_health_js_onRequestGet } from "C:\\Users\\CCCCAOYING\\fit5032\\MindHeaven\\functions\\api\\health.js"

export const routes = [
    {
      routePath: "/api/email",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_email_js_onRequestPost],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_health_js_onRequestGet],
    },
  ]