import { App } from "@slack/bolt";
import { PrismaClient } from "@prisma/client";
import buildMain from "../views/main";
export default function homeEvent(app: App, prisma: PrismaClient) {
    console.debug(`#heeomerhietuhirgiyueffib`)
    app.event("app_home_opened", async ({ event, client, logger }) => {
        console.debug(`#apphomeoepend`)
        try {
            const defaultView = buildMain(app, event);
            await client.views.publish({
                user_id: event.user,
                //@ts-ignore
                view: defaultView,
            });
        } catch (error) {
            logger.error(error);
            await client.views.publish({
                user_id: event.user,
                view: {
                    type: "home",
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "plain_text",
                                text: "An error occurred while loading the app home. Please try again later.",
                                emoji: true,
                            },
                        },
                    ],
                },
            });
        }
    });
}