import { App } from "@slack/bolt";
import { PrismaClient } from "@prisma/client";
import buildMain from "../views/main";
import { admins } from "../admins";
export default function homeEvent(app: App, prisma: PrismaClient) {
    app.event("app_home_opened", async ({ event, client, logger }) => {
        //@ts-ignore
        event.is_admin = admins.includes(event.user);
        await prisma.auditLog.create({
            data: {
                author: event.user,
                action: "ACCESS_HOMEPAGE"
            }
        })

        try {
            const defaultView = await buildMain(app, prisma, event);
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
