import "dotenv/config"
import { App, ExpressReceiver } from "@slack/bolt"
import { PrismaClient } from "@prisma/client"
import express from "express"
import homeEvent from "./modules/home"
import handleActions from "./modules/action"
import { TempAuthSystem } from "./modules/tempauthkey"
// import handle
const prisma = new PrismaClient()
const keyHolder = new TempAuthSystem()
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
//@ts-ignore
app.keyholder = keyHolder;
const expressApp = process.env.SLACK_APP_TOKEN ? express() : receiver.app

expressApp.get("/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok" })
})
// express.get("/ex")
expressApp.get('/export', async (req, res) => {
  const a = req.query.key
  if (keyHolder.validateAndUseKey(a as string)) {
    const auditLogs = await prisma.auditLog.findMany({})
    const content = auditLogs.map(a => `${a.id} | ${a.action} by ${a.author} ${a.target ? "to " + a.target : ""} at ${a.createdAt.toString()}`).join('\n')

    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.txt"')
    res.send(content)
  } else {
    res.status(403).end("no")
  }
})


homeEvent(app, prisma)
handleActions(app, prisma)
  // load home module
  ; (async () => {
    const port = process.env.PORT || 3000
    await app.start(port)
    if (process.env.SLACK_APP_TOKEN) {
      expressApp.listen(port, () => console.log(`Webserver up`))
    }
    await prisma.auditLog.create({
      data: {
        action: "STARTUP",
        author: "SYSTEM"
      }
    })
    app.logger.info(`⚡️ Bolt app is running on port ${port}!`)
  })()
