import { onRequestPost as __api_email_js_onRequestPost } from "C:\\Users\\CCCCAOYING\\fit5032\\MindHeaven\\functions\\api\\email.js"

export const routes = [
    {
      routePath: "/api/email",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_email_js_onRequestPost],
    },
  ]