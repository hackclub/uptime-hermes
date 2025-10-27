import { PrismaClient } from "@prisma/client"
import { admins } from "../src/admins"
const prisma = new PrismaClient()
async function main() {
    await prisma.user.createMany({
       data: admins.map(id => ({ slackId: id })),
       skipDuplicates: true
    })
    await prisma.team.create({
        data: {    
            name: "Seeded team",
            usersOnTeam: {
                connect: admins.map(id => ({ slackId: id }))
            },
            teamCreator: { connect: { slackId: admins[0] } }
         }
    })
    
   await prisma.$disconnect()
}
main()