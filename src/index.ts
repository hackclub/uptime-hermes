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
expressApp.use(express.json())
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
expressApp.post("/uptimehook/:id", async (req, res) => {
  console.log(req.body)
  const authQuery = req.query.secret_key
  if (authQuery !== process.env.SECRET_KEY) {
    return res.status(401).end()
  }
  const trackerId = req.params.id
  if (!trackerId) {
    return res.status(403).end()
  }
  if (!req.body) {
    return res.status(422).end()
  }
  const tracker = await prisma.uptimeKumaTracker.findFirst({
    where: {
      id: parseInt(trackerId)
    },
    include: {
      creator: true,
      team: true
    }
  })
  if (!tracker) {
    return res.status(404).end()
  }
  if (req.body.msg.endsWith("Testing")) {
    // send msg to author and thats ab it
    app.client.chat.postMessage({
      channel: tracker.creator.slackId,
      text: `Ack! test received for your uptime tracker on *${tracker.name}*`
    })
  }
  if (req.body.heartbeat && req.body.monitor) {
    const hb = req.body.heartbeat
    const monitor = req.body.monitor
    const team = await prisma.team.findUnique({
      where: { id: tracker.teamId },
      include: {
        usersOnTeam: true
      }
    })

    if (team) {
      for (const member of team.usersOnTeam) {
        await app.client.chat.postMessage({
          channel: member.slackId,
          text: `*${monitor.name}*: ${hb.status ? '✅ Up' : '❌ Down'}\n> ${hb.msg}`
        }).catch(e => { })
      }
    }
  }

  res.status(200).end()
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
