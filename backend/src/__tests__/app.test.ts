import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('API Routes', () => {

  // Limpa o banco de dados antes de cada teste
  beforeEach(async () => {
    await prisma.registration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.symposium.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password',
        type: 'participant',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should login a user', async () => {
    // First, create a user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: await bcrypt.hash('password', 10),
        type: 'participant',
      },
    });

    // Then, attempt to log in
    const response = await request(app)
      .post('/login')
      .send({
        email: 'testuser@example.com',
        password: 'password',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should list all users', async () => {
    const token = await generateTokenForTestUser();

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Adicione mais testes para outras rotas, como criação de symposium, eventos, registros, etc.

});

// Função auxiliar para gerar um token de usuário para os testes
async function generateTokenForTestUser() {
  const user = await prisma.user.create({
    data: {
      name: 'Test Organizer',
      email: 'organizer@example.com',
      password: await bcrypt.hash('password', 10),
      type: 'organizer',
    },
  });

  return jwt.sign({ id: user.id, email: user.email, type: user.type }, 'supersecretkey', { expiresIn: '1h' });
}
