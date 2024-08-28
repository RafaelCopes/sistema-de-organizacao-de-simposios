import { z } from 'zod';

export const idSchema = z.object({
    id: z.string().uuid(),
});

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    type: z.enum(['participant', 'organizer']),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const createSymposiumSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
    location: z.string(),
    //organizerId: z.string().uuid('Invalid UUID for organizerId'),
});

export const updateSymposiumSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
    location: z.string().optional(),
});

const timeValidation = (time: string) => {
    // Regex to match HH:MM format
    return /^([01]\d|2[0-3]):?([0-5]\d)$/.test(time);
  };

export const createEventSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string(),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
    startTime: z.string().refine(timeValidation, 'Formato de hora inválido'),
    endTime: z.string().refine(timeValidation, 'Formato de hora inválido'),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    location: z.string(),
    symposiumId: z.string().uuid('Invalid UUID for symposiumId'),
});

export const updateEventSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
    startTime: z.string().refine((time) => !isNaN(Date.parse(time)), 'Invalid time format').optional(),
    endTime: z.string().refine((time) => !isNaN(Date.parse(time)), 'Invalid time format').optional(),
    capacity: z.number().int().positive('Capacity must be a positive integer').optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export const approveOrRejectSymposiumRegistrationParamsSchema = z.object({
    symposiumId: z.string().uuid("Invalid symposium ID format."), // Assuming the event ID is a UUID
    registrationId: z.string().uuid("Invalid registration ID format."), // Assuming the registration ID is a UUID
  });

export const approveOrRejectEventRegistrationParamsSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format."), // Assuming the event ID is a UUID
  registrationId: z.string().uuid("Invalid registration ID format."), // Assuming the registration ID is a UUID
});

export const statusSchema = z.object({
    status: z.enum(['accepted', 'rejected']),
});

export const getParticipantsSchema = z.object({
    id: z.string().uuid('Invalid UUID for symposium or event id'),
});
