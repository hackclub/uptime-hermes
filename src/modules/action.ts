import { PrismaClient } from "@prisma/client";
import { App } from "@slack/bolt";
import getAuditLogsView from "../views/auditlogs";
import getMyTeamsView from "../views/teamview";
import admins from "../admins"
import getMyTrackersView from "../views/trackers";
export default function handleActions(app: App, prisma: PrismaClient) {
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
        if (!admins.includes(body.user.id)) return;
        // prompt a model to get info from user
        await client.views.open({
            //@ts-ignore
            trigger_id: body.trigger_id,
            view: {
                type: "modal" as const,
                callback_id: "create_team",
                title: {
                    type: "plain_text",
                    text: "Create Team",
                    emoji: true
                },
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
    app.view("create_team", async ({ ack, body, view }) => {
        await ack();
        if (!admins.includes(body.user.id)) return;
        const teamName = view.state.values.team_name?.team_name_input?.value!;
        const memberIds = view.state.values.team_members?.team_members_input?.selected_users || [];

        const creator = await prisma.user.upsert({
            where: { slackId: body.user.id },
            create: { slackId: body.user.id },
            update: {}
        });

        const members = await Promise.all(
            memberIds.map(slackId =>
                prisma.user.upsert({
                    where: { slackId },
                    create: { slackId },
                    update: {}
                })
            )
        );

        const team = await prisma.team.create({
            data: {
                name: teamName!,
                teamCreatorId: creator.id,
                usersOnTeam: {
                    connect: members.map(m => ({ id: m.id }))
                }
            }
        });

        await prisma.auditLog.create({
            data: {
                author: body.user.id,
                action: "CREATE_TEAM",
                target: `name: ${team.name}, created by: ${body.user.id}  - members:  ${memberIds.join(', ')}`,
            }
        });
        for (const member of memberIds) {
            app.client.chat.postMessage({
                channel: member,
                text: `You were added to team *${team.name}* by <@${body.user.id}>`
            }).catch(e => { })
        }
    })
    app.action(/^delete_team_/, async ({ ack, body, action }) => {
        await ack();
        if (!admins.includes(body.user.id)) return;

        //@ts-ignore
        const teamId = parseInt(action.value);

        await prisma.team.delete({
            where: { id: teamId }
        });

        await prisma.auditLog.create({
            data: {
                author: body.user.id,
                action: "DELETE_TEAM",
                target: `team_id: ${teamId}`
            }
        });
    })
    app.action("open_my_trackers", async ({ body, ack, client }) => {
        await ack();
        await client.views.publish({
            user_id: body.user.id,
            //@ts-ignore
            view: await getMyTrackersView(prisma, body.user.id)
        })
    })
}
