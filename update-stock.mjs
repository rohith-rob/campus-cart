import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.product.updateMany({
        data: {
            stock: 100
        }
    });
    console.log(`Updated ${result.count} products to have 100 stock!`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
