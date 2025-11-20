import { app } from "./app.js";

import serverlessExpress from "@codegenie/serverless-express"

export const handler = serverlessExpress.configure({
  app
});
