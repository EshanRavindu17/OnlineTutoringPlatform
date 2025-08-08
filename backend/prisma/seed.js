// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

import prisma from './prismaClient.js';

async function main() {
    // Seed users
    await prisma.user.createMany({
        data: [
            {
                firebase_uid: "l0GqatIOw5MyvRDgolWvp4EW3aX2",
                email: "jane@gmail.com",
                name: "Jane Student",
                role: "student",
                id: "e834102b-47b9-4811-abf3-d1918a32dcf9",
                created_at: new Date(),
                photo_url: "https://example.com/user1.jpg",
                bio: "New student account ",

            }
        ]
    })
}


main().then(() => console.log("Seeding completed successfully"))
.catch(e => {
    console.error("Error during seeding:", e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});