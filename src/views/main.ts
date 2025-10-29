import { App } from "@slack/bolt";

export default function buildMain(app: App, event: any) {
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
            }
        ]
    };
}