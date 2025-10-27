import { App } from "@slack/bolt";
import { PrismaClient } from "@prisma/client";
export default function homeEvent(app: App, prisma: PrismaClient) {
    app.event("app_home_opened", async ({ event, client, logger }) => { 
        // render default view
        
    })
}