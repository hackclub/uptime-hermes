import { PrismaClient } from "@prisma/client";
import { admins } from "../admins";

export default async function getMyTeamsView(prisma: PrismaClient, slackUserId: string) {
    const user = await prisma.user.findUnique({
        where: { slackId: slackUserId },
        include: {
            teams: {
                include: {
                    teamCreator: true,
                    usersOnTeam: true
                }
            },
            teamsMemberOf: {
                include: {
                    teamCreator: true,
                    usersOnTeam: true
                }
            }
        }
    });

    let allTeams = user ? [
        ...user.teams,
        ...user.teamsMemberOf
    ] : [];
    // merge the array to prevent dupes
    allTeams = allTeams.filter((team, index, self) =>
        index === self.findIndex(t => t.id === team.id)
    );
    const teamBlocks = allTeams.map(team => {
        const memberList = team.usersOnTeam.map(u => `<@${u.slackId}>`).join(', ');
        const memberCount = team.usersOnTeam.length;

        return {
            type: "section" as const,
            text: {
                type: "mrkdwn" as const,
                text: `*${team.name}*\nCreator: <@${team.teamCreator.slackId}>\nMembers (${memberCount}): ${memberList || 'None'}\nCreated: <!date^${Math.floor(team.createdAt.getTime() / 1000)}^{date_short}|${team.createdAt.toLocaleDateString()}>`
            },
            accessory: admins.includes(slackUserId) ? {
                type: "button" as const,
                text: {
                    type: "plain_text" as const,
                    text: ":neocat_smug: Delete team"
                },
                action_id: `delete_team_${team.id}`,
                value: team.id.toString()
            } : undefined
        };
    });
    const headerEls = [
        admins.includes(slackUserId) ? {
            type: "button",
            text: {
                type: "plain_text",
                text: ":neocat_smug: Create team"
            },
            action_id: "create_team"
        } : null
    ].filter(Boolean)

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
            headerEls.length > 0 ? {
                type: "actions",
                elements: headerEls
            } : null,
            ...teamBlocks
        ].filter(Boolean)
    }
}