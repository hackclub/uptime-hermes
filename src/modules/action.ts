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
    //@ts-ignore SHUT UP
    app.action("create_tracker", async ({ body, ack, client }) => {
        await ack()
        if (!admins.includes(body.user.id)) return;
        const allTeams = await prisma.team.findMany({
            include: {
                teamCreator: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        const teams = allTeams.sort((a, b) => {
            const aIsCreator = a.teamCreator.slackId === body.user.id;
            const bIsCreator = b.teamCreator.slackId === body.user.id;
            if (aIsCreator && !bIsCreator) return -1;
            if (!aIsCreator && bIsCreator) return 1;
            return 0;
        })
        if (teams.length == 0) {
            return app.client.chat.postMessage({
                channel: body.user.id,
                text: "You dont have any teams rn! please create a team or be invited to one"
            })
        }
        app.client.views.open({
            //@ts-ignore slack fix your stuff please
            trigger_id: body.trigger_id,
            view: {
                type: "modal" as const,
                callback_id: "create_tracker_view",
                title: {
                    type: "plain_text",
                    text: "Create Tracker",
                    emoji: true
                },
                submit: {
                    type: "plain_text",
                    text: "Create"
                },
                blocks: [
                    {
                        type: "input",
                        block_id: "tracker_name",
                        label: {
                            type: "plain_text",
                            text: "Tracker Name"
                        },
                        element: {
                            type: "plain_text_input",
                            action_id: "tracker_name_input"
                        }
                    },
                    {
                        type: "input",
                        block_id: "tracker_teams",
                        label: {
                            type: "plain_text",
                            text: "Teams"
                        },
                        element: {
                            type: "static_select",
                            action_id: "tracker_teams_input",
                            options: teams.map((d) => {
                                return {
                                    text: {
                                        type: "plain_text",
                                        text: `${d.name} by <@${d.teamCreator.slackId}>`
                                    },
                                    value: `team_${d.id}`
                                }
                            }),
                        }
                    }
                ]
            }
        })
    })
    app.view("create_tracker_view", async ({ ack, body, view }) => {
        await ack();
        if (!admins.includes(body.user.id)) return;
        const trackerName = view.state.values.tracker_name?.tracker_name_input?.value!;
        const teamId = view.state.values.tracker_teams?.tracker_teams_input?.selected_option?.value;
        console.log(trackerName, teamId)
        let url = `${process.env.SITE_DOMAIN}/uptimehook/`
        const data = await prisma.uptimeKumaTracker.create({
            data: {
                url,
                team: {
                    connect: {
                        id: parseInt(teamId?.split(`team_`)[1]!)
                    }
                },
                creator: {
                    connect: {
                        slackId: body.user.id
                    }
                },
                name: trackerName
            }
        })
        url = url + data.id + `?secret_key=${process.env.SECRET_KEY}`
        await prisma.uptimeKumaTracker.update({
            where: {
                id: data.id
            },
            data: {
                url: url
            }
        })
        await prisma.auditLog.create({
            data: {
                target: `name: and s${trackerName}, teamid: ${teamId}`,
                action: "CREATE_TRACKER",
                author: body.user.id
            }
        })
        // dm author
        app.client.chat.postMessage({
            channel: body.user.id,
            text: `Tracker *${trackerName}* created!, make sure to set it up on uptime kuma as a notifcation under the name \`[urnamehere] ${trackerName}\` and then set the "Post URL" to this: ${url} and then please select application/json for body type!`
        })
    })
}
