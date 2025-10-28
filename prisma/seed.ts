import { PrismaClient } from "@prisma/client"
import { admins } from "../src/admins"
const prisma = new PrismaClient()
async function main() {
    await prisma.user.createMany({
        data: admins.map(id => ({ slackId: id })),
        skipDuplicates: true
    })
    console.log(`Seeded ${admins.length} admin users.`)
    await prisma.team.create({
        data: {
            name: "Seeded team",
            usersOnTeam: {
                connect: admins.map(id => ({ slackId: id }))
            },
            teamCreator: { connect: { slackId: admins[0] } }
        }
    })
    console.log(`Seeded ${admins.length} admin users and a team.`)
    await prisma.auditLog.create({
        data: {
            action: "SEED",
            author: "system",
        }
    })
    console.log(`Db seeded!`)
    await prisma.$disconnect()
}
main()