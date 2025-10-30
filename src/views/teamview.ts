import { PrismaClient } from "@prisma/client";

export default async function getMyTeamsView(prisma: PrismaClient, slackUserId: string) {
    const user = await prisma.user.findUnique({
        where: { slackId: slackUserId },
        include: {
            teams: true,
            teamsMemberOf: true
        }
    });

    const allTeams = user ? [
        ...user.teams,
        ...user.teamsMemberOf
    ] : [];

    const teamBlocks = allTeams.map(team => ({
        type: "section" as const,
        text: {
            type: "mrkdwn" as const,
            text: `*${team.name}*\nCreated: <!date^${Math.floor(team.createdAt.getTime() / 1000)}^{date_short}|${team.createdAt.toLocaleDateString()}>`
        }
    }));

    return {
        type: "home" as const,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "My teams",
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
                            text: ":neocat_smug: Create team"
                        },
                        action_id: "create_team"
                    }
                ]
            },
            ...teamBlocks
        ]
    }
}