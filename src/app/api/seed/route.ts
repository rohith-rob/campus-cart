/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable prefer-const */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const productsData = [
    // Snacks
    { name: "Chips Pack", category: "Snacks", price: 20, image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400" },
    { name: "Biscuits", category: "Snacks", price: 20, image: "https://images.unsplash.com/photo-1589987607627-2f39d5b38f1d?w=400" },
    { name: "Chocolates", category: "Snacks", price: 40, image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400" },
    { name: "Instant Noodles", category: "Snacks", price: 15, image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400" },
    { name: "Cup Noodles", category: "Snacks", price: 50, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400" },
    { name: "Popcorn", category: "Snacks", price: 30, image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400" },
    { name: "Energy Bars", category: "Snacks", price: 40, query: "energy+bar" },

    // Cool Drinks
    { name: "Soft Drinks", category: "Cool Drinks", price: 40, image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400" },
    { name: "Juice Pack", category: "Cool Drinks", price: 20, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400" },
    { name: "Energy Drinks", category: "Cool Drinks", price: 110, image: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=400" },
    { name: "Flavored Milk", category: "Cool Drinks", price: 30, query: "flavored+milk" },
    { name: "Cold Coffee", category: "Cool Drinks", price: 50, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
    { name: "Drinking Water", category: "Cool Drinks", price: 20, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400" },

    // Instant Food
    { name: "Ready-to-eat Meals", category: "Instant Food", price: 80, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
    { name: "Oats", category: "Instant Food", price: 40, image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400" },
    { name: "Bread Loaf", category: "Instant Food", price: 40, image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400" },
    { name: "Fruit Jam", category: "Instant Food", price: 60, image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400" },
    { name: "Peanut Butter", category: "Instant Food", price: 150, image: "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=400" },
    { name: "Soup Packs", category: "Instant Food", price: 15, query: "instant+soup" },

    // Stationery
    { name: "Pens Pack", category: "Stationery", price: 50, image: "https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?w=400" },
    { name: "Notebook", category: "Stationery", price: 50, image: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=400" },
    { name: "Record Book", category: "Stationery", price: 80, query: "ledger+book" },
    { name: "Exam Pad", category: "Stationery", price: 60, image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400" },
    { name: "Highlighters", category: "Stationery", price: 50, image: "https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?w=400" },
    { name: "A4 Sheets Bundle", category: "Stationery", price: 200, query: "a4+paper" },
    { name: "Sticky Notes", category: "Stationery", price: 30, query: "sticky+notes" },
    { name: "File Folder", category: "Stationery", price: 20, image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400" },

    // Personal Care
    { name: "Soap", category: "Personal Care", price: 35, image: "https://images.unsplash.com/photo-1607006344380-b6775a0824c1?w=400" },
    { name: "Shampoo", category: "Personal Care", price: 120, image: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400" },
    { name: "Conditioner", category: "Personal Care", price: 120, query: "hair+conditioner" },
    { name: "Toothpaste", category: "Personal Care", price: 50, image: "https://images.unsplash.com/photo-1559591937-abc3d1a1e56f?w=400" },
    { name: "Toothbrush", category: "Personal Care", price: 20, image: "https://images.unsplash.com/photo-1559591937-abc3d1a1e56f?w=400" },
    { name: "Deodorant", category: "Personal Care", price: 150, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400" },
    { name: "Facewash", category: "Personal Care", price: 90, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Hand Sanitizer", category: "Personal Care", price: 50, query: "hand+sanitizer" },
    { name: "Wet Wipes", category: "Personal Care", price: 60, query: "wet+wipes" },
    { name: "Face Tissues", category: "Personal Care", price: 40, query: "tissue+box" },
    { name: "Hair Comb", category: "Personal Care", price: 20, query: "hair+comb" },
    { name: "Hair Oil", category: "Personal Care", price: 60, query: "hair+oil" },

    // Girls Essentials
    { name: "Sanitary Pads", category: "Girls Essentials", price: 80, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400" },
    { name: "Hair Accessories", category: "Girls Essentials", price: 50, query: "hair+clips" },
    { name: "Skincare Kit", category: "Girls Essentials", price: 200, query: "skincare" },

    // Boys Essentials
    { name: "Body Spray Men", category: "Boys Essentials", price: 200, query: "body+spray" },
    { name: "Shaving Cream", category: "Boys Essentials", price: 70, query: "shaving+cream" },
    { name: "Razor Pack", category: "Boys Essentials", price: 100, query: "shaving+razor" },

    // Daily Essentials
    { name: "Laundry Detergent", category: "Daily Essentials", price: 150, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400" },
    { name: "Garbage Bags", category: "Daily Essentials", price: 60, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400" },
    { name: "Room Freshener", category: "Daily Essentials", price: 120, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400" },
    { name: "Mosquito Repellent", category: "Daily Essentials", price: 90, query: "mosquito+repellent" },
    { name: "Cleaning Supplies", category: "Daily Essentials", price: 150, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400" },

    // Student Utilities
    { name: "Phone Charger", category: "Student Utilities", price: 300, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400" },
    { name: "Earphones", category: "Student Utilities", price: 250, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "USB Flash Drive", category: "Student Utilities", price: 400, image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400" },
    { name: "Extension Board", category: "Student Utilities", price: 350, image: "https://images.unsplash.com/photo-1580894908361-967195033215?w=400" },
    { name: "Water Bottle", category: "Student Utilities", price: 150, query: "reusable+water+bottle" },
    { name: "Lunch Box", category: "Student Utilities", price: 200, query: "lunch+box" },
    { name: "Study Lamp", category: "Student Utilities", price: 450, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400" }
];

export async function POST(req: Request) {
    try {
        // Create Admin User
        const adminEmail = "campuscart@gmail.com";
        const adminExist = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!adminExist) {
            const passwordHash = await bcrypt.hash("1234567890", 10);
            await prisma.user.create({
                data: {
                    name: "Admin",
                    email: adminEmail,
                    passwordHash,
                    role: "ADMIN"
                }
            });
        }
        for (const item of productsData) {
            const imageUrl = item.image ? item.image : `https://source.unsplash.com/400x400/?${item.query}`;

            const category = await prisma.category.upsert({
                where: { name: item.category },
                update: {},
                create: { name: item.category }
            });

            // Avoid creating duplicates if already seeded
            const exist = await prisma.product.findFirst({ where: { name: item.name } });
            if (!exist) {
                await prisma.product.create({
                    data: {
                        name: item.name,
                        price: item.price,
                        stock: 100,
                        description: `Essential ${item.name} for your campus needs.`,
                        categoryId: category.id,
                        imageUrl: imageUrl,
                    }
                });
            } else {
                await prisma.product.update({
                    where: { id: exist.id },
                    data: { stock: 100, imageUrl: imageUrl }
                });
            }
        }

        return NextResponse.json({ message: "Expanded seed data inserted successfully." });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Failed to seed", message: error.message, stack: error.stack }, { status: 500 });
    }
}

