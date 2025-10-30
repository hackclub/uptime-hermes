import { PrismaClient } from "@prisma/client";
import { App } from "@slack/bolt";
import getAuditLogsView from "../views/auditlogs";
import getMyTeamsView from "../views/teamview";

export default function handleActions(app: App, prisma: PrismaClient)
{
    app.action("open_audit_logs", async ({ body, ack, client }) => {
        await ack();
        await client.views.publish({
            user_id: body.user.id,  
            //@ts-ignore
            view: await getAuditLogsView(prisma, app.keyholder.createKey())
        })
    })
    app.action("open_my_teams", async ({ body, ack, client }) => {
        await ack();
        await client.views.publish({
            user_id: body.user.id,
            //@ts-ignore
            view: await getMyTeamsView(prisma, body.user.id)
        })
    })

    app.action("refresh_audit_logs", async ({ body, ack, client }) => {
        await ack();
        await client.views.publish({
            user_id: body.user.id,
            //@ts-ignore
            view: await getAuditLogsView(prisma, app.keyholder.createKey())
        })
    })
    const usersWhoClickedViewMore = new Map<string, number>();
    app.action("view_more_audit_logs", async ({ body, ack, client }) => {
        await ack();
        usersWhoClickedViewMore.set(body.user.id, (usersWhoClickedViewMore.get(body.user.id) || 0) + 1);
        await client.views.publish({
            user_id: body.user.id,
            //@ts-ignore
            view: await getAuditLogsView(prisma, app.keyholder.createKey(), true)
        })
    })
}
