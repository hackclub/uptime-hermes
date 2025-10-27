import { App } from "@slack/bolt"
import dotenv from "dotenv"
dotenv.config()
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true
})

  // load home module
  
;(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  app.logger.info('⚡️ Bolt app is running!');
})();