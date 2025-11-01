import { PrismaClient } from "@prisma/client";

export default async function getAuditLogsView(prisma: PrismaClient, tempKey: string) {
    const logs = await prisma.auditLog.findMany({
        orderBy: {
            createdAt: "desc",
        },
        where: {
            action: {
                not: "ACCESS_HOMEPAGE"
            }
        },
        take: 10
    })
    return {
        type: "home" as const,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "Audit logs",
                    emoji: true
                }
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Refresh"
                        },
                        action_id: "refresh_audit_logs"
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "View more"
                        },
                        action_id: "view_more_audit_logs"
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Export"
                        },
                        url: `https://siteorsmt.hackclub.com/export?key=${tempKey}&page=x`
                    }
                ]
            },
            // todo display audit logs here
            ...logs.map(log => ({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${log.action}* by ${log.author.startsWith("U") ? `<@${log.author}>` : log.author} on ${new Date(log.createdAt).toLocaleString()}`
                }
            })).slice(0, 9)
        ]
    }
}
