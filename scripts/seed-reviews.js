const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding reviews...");
    const products = await prisma.product.findMany();
    const users = await prisma.user.findMany();

    if (products.length === 0 || users.length === 0) {
        console.log("No products or users found to seed reviews.");
        return;
    }

    const reviews = [
        { rating: 5, comment: "Amazing quality, definitely buying this again! The delivery was also super quick to my dorm." },
        { rating: 4, comment: "Good product, matches the description perfectly. A little pricey but worth it." },
        { rating: 5, comment: "I use this every day now. Highly recommend!" },
        { rating: 3, comment: "It's decent, does the job. Might try a different brand next time." },
        { rating: 4, comment: "Solid purchase. Very convenient to just order through Campus Cart." }
    ];

    let seededCount = 0;

    for (const product of products) {
        // Randomly decide to add 0 to 3 reviews for each product
        const numReviews = Math.floor(Math.random() * 4);

        for (let i = 0; i < numReviews; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomReviewData = reviews[Math.floor(Math.random() * reviews.length)];

            await prisma.review.create({
                data: {
                    productId: product.id,
                    userId: randomUser.id,
                    rating: randomReviewData.rating,
                    comment: randomReviewData.comment,
                }
            });
            seededCount++;
        }
    }

    console.log(`Successfully seeded ${seededCount} reviews.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
