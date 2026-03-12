import prisma from '@/lib/prisma';
import HomePageClient from '@/components/HomePageClient';

export default async function Home() {
  const featuredEssentials = await prisma.product.findMany({
    where: {
      category: {
        name: {
          contains: "Essential"
        }
      }
    },
    take: 8,
    include: {
      category: true
    }
  });

  return <HomePageClient featuredEssentials={featuredEssentials} />;
}
