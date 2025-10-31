import { PrismaClient } from "@prisma/client";
import { App } from "@slack/bolt";
import getAuditLogsView from "../views/auditlogs";
import getMyTeamsView from "../views/teamview";
import admins from "../admins"
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
    app.action("create_team", async ({ body, ack, client }) => {
        await ack();
        if(!admins.includes(body.user.id)) return;
       // prompt a model to get info from user
       await client.views.open({
        //@ts-ignore
    trigger_id: body.trigger_id,
        view: {
            title: {
                type: "plain_text",
                text: "Create Team",
                emoji: true
            },
            type: "modal" as const,
            submit: {
                type: "plain_text",
                text: "Create"
            },
            blocks: [
                {
                    type: "input",
                    block_id: "team_name",
                    label: {
                        type: "plain_text",
                        text: "Team Name"
                    },
                    element: {
                        type: "plain_text_input",
                        action_id: "team_name_input"
                    }
                },
                {
                    type: "input",
                    block_id: "team_members",
                    label: {
                        type: "plain_text",
                        text: "Team Members"
                    },
                    element: {
                        type: "multi_users_select",
                        action_id: "team_members_input"
                    }
                }
            ]
        }
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
