import { PrismaClient } from "@prisma/client";
import { App } from "@slack/bolt";
import getAuditLogsView from "../views/auditlogs";

export default function handleActions(app: App, prisma: PrismaClient)
{
    app.action("open_audit_logs", async ({ body, ack, client }) => {
        await ack();
        await client.views.publish({
            user_id: body.user.id,  
            view: await getAuditLogsView(prisma)
        })
    })

    app.action("refresh_audit_logs", async ({ body, ack, client }) => {
        await ack();
        await client.views.publish({
            user_id: body.user.id,
            view: await getAuditLogsView(prisma)
        })
    })

    app.action("view_more_audit_logs", async ({ body, ack, client }) => {
        await ack();
    })
}
