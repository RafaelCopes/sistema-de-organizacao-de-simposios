import { Request, Response } from "express";
import prisma from "../../prismaClient";
import bcrypt from "bcrypt";
import { createUserSchema } from '../zodSchemas';

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        organizedSymposiums: true,  // Fetch the symposiums the user organizes
        organizedEvents: true,      // Fetch the events the user organizes
        participantSymposiums: {    // Fetch the symposiums where the user is a participant
          include: {
            symposium: true,        // Include symposium details
          },
        },
        participantEvents: {        // Fetch the events where the user is a participant
          include: {
            event: true,            // Include event details
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const parsedData = createUserSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.errors });
  }

  const { name, email, password, type } = parsedData.data;
  
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, type },
    });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "This email is already in use." });
    } else {
      res.status(500).json({ message: "Error creating user." });
    }
  }
};

export const listUserSymposiums = async (req: Request, res: Response) => {
  const userId = req.user.id;  // Assuming userId is available through authentication

  try {
      const symposiums = await prisma.symposium.findMany({
          where: { organizerId: userId }, // Fetch symposiums where the user is the organizer
          include: {
            events: true, // Include related events
            participants: {  // Include participant details
              include: {
                user: true, // Include user details of participants
              },
            },
          },
      });

      if (symposiums.length === 0) {
          return res.status(404).json({ message: 'No symposiums found for this user.' });
      }

      res.json(symposiums);
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving symposiums for user.' });
  }
};
