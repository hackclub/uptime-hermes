import { App } from "@slack/bolt";
import { PrismaClient } from "@prisma/client";

export default async function buildMain(app: App, prisma: PrismaClient, event: any) {
    const [userCount, teamCount, trackerCount, auditLogCount] = await Promise.all([
        prisma.user.count(),
        prisma.team.count(),
        prisma.uptimeKumaTracker.count(),
        prisma.auditLog.count()
    ]);

    return {
        type: "home",
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "Uptime Hermes",
                    emoji: true
                }
            },
            // buttons tab
            {
                type: "actions",
                elements: [
                    event.is_admin?{
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: ":neocat_smug: Audit logs",
                            emoji: true
                        },
                        action_id: "open_audit_logs"
                    }   :null,
                    {
                        type:"button",
                        text: {
                            type: "plain_text", 
                            text: "My Teams"
                        },
                        action_id: "open_my_teams"
                    }, 
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "My trackers"
                        },
                        action_id: "open_my_trackers"
                    }
                ].filter(Boolean)
            },
            // statistics
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Statistics*\n• Users: ${userCount}\n• Teams: ${teamCount}\n• Trackers: ${trackerCount}\n• Audit Logs: ${auditLogCount}`
                }
            },
            {
                type: "divider"
            }
        ]
    };
}