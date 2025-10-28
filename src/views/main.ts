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
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "Welcome to Uptime Hermes! Monitor your services and get notified when they go down."
                }
            }
        ]
    };
}