import { App, ExpressReceiver } from "@slack/bolt"
import dotenv from "dotenv"
dotenv.config()
import { PrismaClient } from "@prisma/client"
import express from "express"

const prisma = new PrismaClient()

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
})

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
})

const expressApp = receiver.app

expressApp.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

  // load home module

  ; (async () => {
    const port = process.env.PORT || 3000
    await app.start(port)
    app.logger.info(`⚡️ Bolt app is running on port ${port}!`)
  })()