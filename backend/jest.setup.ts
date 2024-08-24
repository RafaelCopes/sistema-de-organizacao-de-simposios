require('dotenv').config();

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  execSync('npx prisma migrate deploy'); // Ou a migração que você desejar
});

beforeEach(async () => {
  // Limpar o banco de dados antes de cada teste
  const deleteUsers = prisma.user.deleteMany();
  const deleteSymposiums = prisma.symposium.deleteMany();
  const deleteEvents = prisma.event.deleteMany();
  const deleteRegistrations = prisma.registration.deleteMany();
  const deleteCertificates = prisma.certificate.deleteMany();
  
  await prisma.$transaction([deleteUsers, deleteSymposiums, deleteEvents, deleteRegistrations, deleteCertificates]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
