import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding PROGRAM 2 Memberships...");

    const items = [
        {
            title: "One-to-One Coaching With Nesrina - Single Session",
            label: "Private Coaching · Direct Access to Nesrina",
            type: "PROGRAM",
            offerPrice: 1000,
            realPrice: null,
            description: `Work privately with Nesrina — focused entirely on you, your goals, and your results. This is the most direct investment you can make in yourself and your business.

**Option A — Single Session**
1 Private Session With Nesrina
• Deep-dive 1:1 session focused entirely on you
• Tackle your most urgent business or mindset challenge
• Personalized action plan delivered after the session
• Ideal for fast clarity and immediate direction`,
            benefits: `Deep-dive 1:1 session focused entirely on you\nTackle your most urgent business or mindset challenge\nPersonalized action plan delivered after the session\nIdeal for fast clarity and immediate direction`,
        },
        {
            title: "One-to-One Coaching With Nesrina - Triple Session Package",
            label: "Private Coaching · Direct Access to Nesrina",
            type: "PROGRAM",
            offerPrice: 2000,
            realPrice: 3000,
            description: `Work privately with Nesrina — focused entirely on you, your goals, and your results. This is the most direct investment you can make in yourself and your business.

**Option B — Triple Session Package**
3 Private Sessions With Nesrina
• Three in-depth sessions that build on each other progressively
• A growing strategy and roadmap developed across all three sessions
• Accountability and support between each session
• Ideal for real, committed momentum and visible results`,
            benefits: `Three in-depth sessions that build on each other progressively\nA growing strategy and roadmap developed across all three sessions\nAccountability and support between each session\nIdeal for real, committed momentum and visible results`,
        },
        {
            title: "One-to-One Coaching With Nesrina - Mastery Package",
            label: "Private Coaching · Direct Access to Nesrina",
            type: "PROGRAM",
            offerPrice: 4000,
            realPrice: 6000,
            description: `Work privately with Nesrina — focused entirely on you, your goals, and your results. This is the most direct investment you can make in yourself and your business.

**Option C — Mastery Package ★ Best Value**
6 Private Sessions · Full Transformation Journey
• Six powerful 1:1 sessions with Nesrina
• Complete business and mindset transformation journey
• Full accountability and personal support throughout
• Custom roadmap built entirely around your specific goals
• Designed for lasting, measurable, life-changing results
• Priority scheduling and direct access to Nesrina`,
            benefits: `Six powerful 1:1 sessions with Nesrina\nComplete business and mindset transformation journey\nFull accountability and personal support throughout\nCustom roadmap built entirely around your specific goals\nDesigned for lasting, measurable, life-changing results\nPriority scheduling and direct access to Nesrina`,
        }
    ];

    for (const item of items) {
        const mem = await prisma.membership.create({
            data: {
                type: item.type,
                label: item.label,
                offerPrice: item.offerPrice,
                realPrice: item.realPrice,
                contents: {
                    create: {
                        language: "en",
                        title: item.title,
                        description: item.description,
                        benefits: item.benefits
                    }
                }
            }
        });
        console.log("Created: ", mem.id);
    }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
