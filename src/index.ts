import "dotenv/config"
import { App, ExpressReceiver } from "@slack/bolt"
import { PrismaClient } from "@prisma/client"
import express from "express"
import homeEvent from "./modules/home"
import handleActions from "./modules/action"
// import handle
const prisma = new PrismaClient()

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
})
//@ts-ignore STFU
const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  receiver: process.env.SLACK_APP_TOKEN ? undefined : receiver,
  socketMode: true,
})

const expressApp = process.env.SLACK_APP_TOKEN ? express() : receiver.app

expressApp.get("/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok" })
})
homeEvent(app, prisma)
handleActions(app, prisma)
  // load home module
  ; (async () => {
    const port = process.env.PORT || 3000
    await app.start(port)
    app.logger.info(`⚡️ Bolt app is running on port ${port}!`)
  })()
