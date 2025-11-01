import { PrismaClient } from "@prisma/client";
import { admins } from "../admins";

export default async function getMyTrackersView(prisma: PrismaClient, slackUserId: string) {
    const trackers = await prisma.uptimeKumaTracker.findMany({
        where: {
            team: {
                OR: [
                    {
                        teamCreator: { slackId: slackUserId }
                    },
                    {
                        usersOnTeam: {
                            some: { slackId: slackUserId }
                        }
                    }
                ]
            }
        },
        include: {
            team: {
                include: {
                    teamCreator: true,
                    usersOnTeam: true
                }
            }
        }
    });

    const trackerBlocks = trackers.map(tracker => ({
        type: "section" as const,
        text: {
            type: "mrkdwn" as const,
            text: `*${tracker.name}*\nURL: ${tracker.url}\nTeam: ${tracker.team.name}\nCreated: <!date^${Math.floor(tracker.createdAt.getTime() / 1000)}^{date_short}|${tracker.createdAt.toLocaleDateString()}>`
        },
        accessory: {
            type: "button" as const,
            text: {
                type: "plain_text" as const,
                text: "View"
            },
            action_id: `view_tracker_${tracker.id}`,
            value: tracker.id.toString()
        }
    }));

    const headerEls = [
        admins.includes(slackUserId) ? {
            type: "button",
            text: {
                type: "plain_text",
                text: ":neocat_smug: Create tracker"
            },
            action_id: "create_tracker"
        } : null
    ].filter(Boolean)

    return {
        type: "home" as const,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "My trackers",
                    emoji: true
                }
            },
            headerEls.length > 0 ? {
                type: "actions",
                elements: headerEls
            } : null,
            ...trackerBlocks
        ].filter(Boolean)
    }
}
