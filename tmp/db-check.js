const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const productCount = await prisma.product.count();
        const userCount = await prisma.user.count();
        const orderCount = await prisma.order.count();
        const recentProducts = await prisma.product.findMany({
            take: 3,
            include: { category: true }
        });

        console.log("--- Database Statistics ---");
        console.log(`Total Products: ${productCount}`);
        console.log(`Total Users: ${userCount}`);
        console.log(`Total Orders: ${orderCount}`);
        console.log("\n--- Sample Products ---");
        recentProducts.forEach(p => {
            console.log(`${p.name} ($${p.price}) - Category: ${p.category.name}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
