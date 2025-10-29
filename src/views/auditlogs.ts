import { PrismaClient } from "@prisma/client";

export default async function getAuditLogsView(prisma: PrismaClient)
{
    const logs = await prisma.auditLog.findMany({
        orderBy: {
            createdAt: "desc"
        },
        take: 10
    })
return {
        type: "home",
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
                        // link
                        url: "https://siteorsmt.hackclub.com/export?key=tempkey&page=x",
                        action_id: "export_audit_logs"
                    }
                ],
                
            },
// todo display audit logs here
        ]
}

}
