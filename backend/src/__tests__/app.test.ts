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
    const token = await generateOrganizer();

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a symposium', async () => {
    const {token, id} = await generateOrganizer();

    const response = await request(app)
      .post('/symposiums')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: id, // Alterado para string
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
});

it('should not create a symposium if user not a organizer', async () => {
  const { token, id } = await generateParticipant();

  const response = await request(app)
    .post('/symposiums')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Symposium',
      description: 'A test symposium',
      startDate: new Date(),
      endDate: new Date(),
      location: 'Test Location',
      organizerId: id, // Alterado para string
    });

  console.log(response.body);

  expect(response.body.message).toBe('Access denied. Only organizers can perform this action.');
});


  it('should list all symposiums', async () => {
    const { token, id } = await generateOrganizer();

    await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: id, // Alterado para string
      },
    });

    const response = await request(app)
      .get('/symposiums')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should update a symposium', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    const response = await request(app)
      .put(`/symposiums/${symposium.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Symposium',
        description: 'Updated description',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Updated Location',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Updated Symposium');
  });

  it('should delete a symposium', async () => {
    const { token, id } = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: id, // Alterado para string
      },
    });

    const response = await request(app)
      .delete(`/symposiums/${symposium.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
  });

  it('should create an event', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    const response = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Event',
        description: 'A test event',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        capacity: 100,
        level: 'beginner',
        symposiumId: symposium.id,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should list all events for a symposium', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    await prisma.event.create({
      data: {
        name: 'Test Event',
        description: 'A test event',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        capacity: 100,
        level: 'beginner',
        symposiumId: symposium.id,
      },
    });

    const response = await request(app)
      .get(`/symposiums/${symposium.id}/events`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should update an event', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    const event = await prisma.event.create({
      data: {
        name: 'Test Event',
        description: 'A test event',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        capacity: 100,
        level: 'beginner',
        symposiumId: symposium.id,
      },
    });

    const response = await request(app)
      .put(`/events/${event.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Event',
        description: 'Updated description',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        capacity: 150,
        level: 'intermediate',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Updated Event');
  });

  it('should delete an event', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    const event = await prisma.event.create({
      data: {
        name: 'Test Event',
        description: 'A test event',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        capacity: 100,
        level: 'beginner',
        symposiumId: symposium.id,
      },
    });

    const response = await request(app)
      .delete(`/events/${event.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
  });

  it('should request registration for a symposium', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    const response = await request(app)
      .post(`/symposiums/${symposium.id}/registration`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Registration request sent successfully.');
  });

  it('should request registration for an event', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    const event = await prisma.event.create({
      data: {
        name: 'Test Event',
        description: 'A test event',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        capacity: 100,
        level: 'beginner',
        symposiumId: symposium.id,
      },
    });

    const response = await request(app)
      .post(`/events/${event.id}/registration`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Registration request sent successfully.');
  });

  it('should list all pending registrations for an organizer', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    const registration = await prisma.registration.create({
      data: {
        userId: '2', // Alterado para string
        symposiumId: symposium.id,
        status: 'pending',
      },
    });

    const response = await request(app)
      .get('/registrations/pending')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should approve or reject a symposium registration', async () => {
    const token = await generateOrganizer();

    const symposium = await prisma.symposium.create({
      data: {
        name: 'Test Symposium',
        description: 'A test symposium',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        organizerId: '1', // Alterado para string
      },
    });

    const registration = await prisma.registration.create({
      data: {
        userId: '2', // Alterado para string
        symposiumId: symposium.id,
        status: 'pending',
      },
    });

    const response = await request(app)
      .put(`/symposiums/${symposium.id}/registrations/${registration.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'accepted' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Registration accepted successfully.');
  });
});

// Função auxiliar para gerar um token de usuário para os testes
async function generateOrganizer() {
  const user = await prisma.user.create({
    data: {
      name: 'Test Organizer',
      email: 'organizer@example.com',
      password: await bcrypt.hash('password', 10),
      type: 'organizer',
    },
  });

  return {token: jwt.sign({ id: user.id, email: user.email, type: user.type }, 'supersecretkey', { expiresIn: '1h' }), id: user.id};
}

async function generateParticipant() {
  const user = await prisma.user.create({
    data: {
      name: 'Test Participant',
      email: 'participant@example.com',
      password: await bcrypt.hash('password', 10),
      type: 'participant',
    },
  });

  return {token: jwt.sign({ id: user.id, email: user.email, type: user.type }, 'supersecretkey', { expiresIn: '1h' }), id: user.id};
}
