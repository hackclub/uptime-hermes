import "dotenv/config"
import { App, ExpressReceiver } from "@slack/bolt"
import { PrismaClient } from "@prisma/client"
import homeEvent from "./modules/home"
// import handle
const prisma = new PrismaClient()

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
})

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  receiver: process.env.SLACK_APP_TOKEN ? undefined : receiver,
  socketMode: true,
})

const expressApp = receiver.app

expressApp.get("/health", (req, res) => {
  res.json({ status: "ok" })
})
homeEvent(app, prisma)
  // load home module

  ; (async () => {
    const port = process.env.PORT || 3000
    await app.start(port)
    app.logger.info(`⚡️ Bolt app is running on port ${port}!`)
  })()