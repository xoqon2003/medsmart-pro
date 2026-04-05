import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ──
  const users = await Promise.all([
    prisma.user.upsert({
      where: { phone: '+998901234567' },
      update: {},
      create: {
        phone: '+998901234567', pin: '0000', fullName: 'Aziz Karimov',
        role: 'PATIENT', gender: 'MALE', birthDate: '1990-05-15', city: 'Toshkent',
        language: 'UZ', telegramId: 100001, username: 'aziz_karimov',
      },
    }),
    prisma.user.upsert({
      where: { phone: '+998901111111' },
      update: {},
      create: {
        phone: '+998901111111', pin: '123456', fullName: 'Jasur Yusupov',
        role: 'RADIOLOG', gender: 'MALE', birthDate: '1980-03-20', city: 'Toshkent',
        language: 'UZ', specialty: 'MRT/MSKT', experience: 20, rating: 4.9,
        totalConclusions: 1247, license: 'RAD-2005-001', telegramId: 100002,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+998902222222' },
      update: {},
      create: {
        phone: '+998902222222', pin: '654321', fullName: 'Madina Karimova',
        role: 'OPERATOR', gender: 'FEMALE', city: 'Toshkent', language: 'UZ',
        telegramId: 100003,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+998903333333' },
      update: {},
      create: {
        phone: '+998903333333', pin: '000000', fullName: 'Dilshod Rahimov',
        role: 'ADMIN', gender: 'MALE', city: 'Toshkent', language: 'UZ',
        telegramId: 100004,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+998904444444' },
      update: {},
      create: {
        phone: '+998904444444', pin: '111111', fullName: 'Nigora Nazarova',
        role: 'PATIENT', gender: 'FEMALE', birthDate: '1985-11-22', city: 'Samarqand',
        language: 'UZ', telegramId: 100005,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+998905555555' },
      update: {},
      create: {
        phone: '+998905555555', pin: '222222', fullName: 'Malika Holiqova',
        role: 'RADIOLOG', gender: 'FEMALE', city: 'Toshkent', language: 'UZ',
        specialty: 'Rentgen/USG', experience: 12, rating: 4.7, totalConclusions: 856,
        license: 'RAD-2012-045', telegramId: 100006,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+998906666666' },
      update: {},
      create: {
        phone: '+998906666666', pin: '111111', fullName: 'Sarvar Umarov',
        role: 'SPECIALIST', gender: 'MALE', city: 'Toshkent', language: 'UZ',
        specialty: 'Nevrolog', experience: 22, rating: 4.8, telegramId: 100007,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+998907777777' },
      update: {},
      create: {
        phone: '+998907777777', pin: '777777', fullName: 'Eldor Mamatov',
        role: 'DOCTOR', gender: 'MALE', city: 'Toshkent', language: 'UZ',
        specialty: 'Terapevt', experience: 15, rating: 4.6, telegramId: 100008,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+998908888888' },
      update: {},
      create: {
        phone: '+998908888888', pin: '222222', fullName: 'Gulnora Toshmatova',
        role: 'KASSIR', gender: 'FEMALE', city: 'Toshkent', language: 'UZ',
        telegramId: 100009,
      },
    }),
  ]);

  console.log(`${users.length} users seeded`);

  // ── Applications ──
  const apps = await Promise.all([
    prisma.application.create({
      data: {
        arizaNumber: 'MSP-2026-00001', patientId: users[0].id, radiologId: users[1].id,
        status: 'DONE', serviceType: 'AI_RADIOLOG', urgency: 'NORMAL',
        scanType: 'MRT', organ: 'Bosh miya', price: 150000,
        scanDate: '2026-03-20', acceptedAt: new Date('2026-03-20T10:00:00'),
        completedAt: new Date('2026-03-21T14:00:00'),
      },
    }),
    prisma.application.create({
      data: {
        arizaNumber: 'MSP-2026-00002', patientId: users[0].id, radiologId: users[1].id,
        status: 'ACCEPTED', serviceType: 'RADIOLOG_SPECIALIST', urgency: 'URGENT',
        scanType: 'MSKT', organ: "Ko'krak qafasi", price: 525000,
        scanDate: '2026-03-22', acceptedAt: new Date('2026-03-22T09:00:00'),
      },
    }),
    prisma.application.create({
      data: {
        arizaNumber: 'MSP-2026-00003', patientId: users[4].id,
        status: 'NEW', serviceType: 'RADIOLOG_ONLY', urgency: 'NORMAL',
        scanType: 'Rentgen', organ: "O'pka", price: 200000,
        scanDate: '2026-03-24',
      },
    }),
  ]);

  console.log(`${apps.length} applications seeded`);

  // ── Conclusions ──
  await prisma.conclusion.create({
    data: {
      applicationId: apps[0].id, authorId: users[1].id,
      conclusionType: 'RADIOLOG',
      description: 'MRT bosh miya tekshiruvi o\'tkazildi',
      findings: 'Patologik o\'zgarishlar aniqlanmadi. Bosh miya tuzilishi normal.',
      impression: 'Norma. Patologiya yo\'q.',
      recommendations: '6 oydan keyin nazorat MRT tavsiya etiladi.',
    },
  });

  // ── Notifications ──
  await prisma.notification.createMany({
    data: [
      { userId: users[0].id, title: 'Ariza qabul qilindi', message: 'MSP-2026-00001 arizangiz radiolog tomonidan qabul qilindi.', type: 'success', applicationId: apps[0].id },
      { userId: users[0].id, title: 'Xulosa tayyor', message: 'MSP-2026-00001 arizangiz uchun xulosa tayyor.', type: 'info', applicationId: apps[0].id },
      { userId: users[1].id, title: 'Yangi ariza', message: 'Yangi ariza MSP-2026-00002 sizga tayinlandi.', type: 'info', applicationId: apps[1].id },
    ],
  });

  // ── Examination Centers ──
  await prisma.examinationCenter.createMany({
    data: [
      { name: 'MedLine Diagnostika', region: 'Toshkent', district: 'Chilonzor', rating: 4.8, price: 120000, distanceKm: 2.5 },
      { name: 'City Med Lab', region: 'Toshkent', district: 'Yunusobod', rating: 4.5, price: 80000, distanceKm: 5.1 },
      { name: 'Premium Diagnostics', region: 'Toshkent', district: 'Mirzo Ulug\'bek', rating: 4.9, price: 200000, distanceKm: 8.3 },
      { name: 'Samarqand Med Center', region: 'Samarqand', district: 'Samarqand shahar', rating: 4.3, price: 90000, distanceKm: 1.2 },
    ],
  });

  // ── Audit Log ──
  await prisma.auditEvent.create({
    data: {
      applicationId: apps[0].id, action: 'APPLICATION_CREATED',
      actorId: users[0].id, actorRole: 'PATIENT', actorName: 'Aziz Karimov',
    },
  });

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
