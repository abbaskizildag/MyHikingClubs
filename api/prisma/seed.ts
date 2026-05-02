import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // Clean existing data
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.club.deleteMany();

  // Create a club
  const club = await prisma.club.create({
    data: {
      name: 'Yedi Göller Gezginleri',
      description: 'Doğa ve huzur arayanların buluşma noktası.',
    }
  });

  // Create some events
  await prisma.event.create({
    data: {
      title: 'Bolu Yedigöller Sonbahar Yürüyüşü',
      description: 'Eşsiz manzaralar eşliğinde orta zorlukta bir doğa yürüyüşü. Sonbaharın tüm renklerini birlikte keşfedeceğiz.',
      date: new Date('2026-10-15T09:00:00Z'),
      leaderId: 'leader_1',
      clubId: club.id,
      capacity: 15,
      difficultyLevel: 'MODERATE',
      priceDetails: {
        "Ulaşım": "300 TL",
        "Kamp": "200 TL",
        "Öğle Yemeği": "Dahil"
      }
    }
  });

  await prisma.event.create({
    data: {
      title: 'Aladağlar Zirve Tırmanışı',
      description: 'Deneyimli dağcılar için zorlu ve heyecan verici bir parkur. Profesyonel ekipman zorunludur.',
      date: new Date('2026-06-20T05:00:00Z'),
      leaderId: 'leader_2',
      clubId: club.id,
      capacity: 8,
      difficultyLevel: 'HARD',
      priceDetails: {
        "Ekipman Kira": "500 TL",
        "Sigorta": "150 TL",
        "Zirve Belgesi": "Dahil"
      }
    }
  });

  await prisma.event.create({
    data: {
      title: 'Belgrad Ormanı Sabah Yürüyüşü',
      description: 'Güne taze bir başlangıç yapmak isteyenler için kolay ve keyifli bir orman yürüyüşü.',
      date: new Date('2026-05-10T08:30:00Z'),
      leaderId: 'leader_3',
      clubId: club.id,
      capacity: 30,
      difficultyLevel: 'EASY',
      priceDetails: {
        "Katılım": "Ücretsiz",
        "Çay/Simit": "İkram"
      }
    }
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
