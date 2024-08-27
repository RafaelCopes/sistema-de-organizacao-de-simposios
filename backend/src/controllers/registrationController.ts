import { Request, Response } from 'express';
import prisma from '../../prismaClient';
import { 
    idSchema,
    approveOrRejectSymposiumRegistrationParamsSchema,
    approveOrRejectEventRegistrationParamsSchema,
    statusSchema,
} from '../zodSchemas';

export const requestSymposiumRegistration = async (req: Request, res: Response) => {
    const parsedParams = idSchema.safeParse(req.params);

    if (!parsedParams.success) {
        return res.status(400).json({ message: 'Invalid data', errors: parsedParams.error.errors });
    }

    const { id } = parsedParams.data;  // ID do simpósio
    const userId = req.user.id;

    try {
        // Verificar se o usuário já está registrado para este simpósio
        const existingRegistration = await prisma.registration.findFirst({
            where: {
                userId,
                symposiumId: id,
            },
        });

        if (existingRegistration) {
            if (existingRegistration.status === 'accepted') {
                return res.status(400).json({ message: 'Você já está registrado para este simpósio.' });
            }

            if (existingRegistration.status === 'pending') {
                return res.status(400).json({ message: 'Você já tem uma solicitação de registro pendente para este simpósio.' });
            }

            if (existingRegistration.status === 'rejected') {
                return res.status(400).json({ message: 'Sua solicitação de registro para este simpósio já foi rejeitada.' });
            }
        }

        // Criar a solicitação de registro
        const registration = await prisma.registration.create({
            data: {
                userId,
                symposiumId: id,
                status: 'pending',  // Define o status do registro como "pendente"
            },
        });

        res.status(201).json({ message: 'Solicitação de registro enviada com sucesso.', registration });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao solicitar registro para o simpósio.' });
    }
};

export const requestEventRegistration = async (req: Request, res: Response) => {
    const parsedParams = idSchema.safeParse(req.params);

    if (!parsedParams.success) {
        return res.status(400).json({ message: 'Invalid data', errors: parsedParams.error.errors });
    }

    const { id } = parsedParams.data;  // ID do evento
    const userId = req.user.id;

    try {
        // Verificar se o evento existe
        const event = await prisma.event.findUnique({
            where: { id },
            include: { symposium: true },  // Incluir o simpósio relacionado
        });

        if (!event) {
            return res.status(404).json({ message: 'Evento não encontrado.' });
        }

        // Verificar se o usuário já está registrado para este evento
        const existingRegistration = await prisma.registration.findFirst({
            where: {
                userId,
                eventId: id,
            },
        });

        if (existingRegistration) {
            if (existingRegistration.status === 'accepted') {
                return res.status(400).json({ message: 'Você já está registrado para este evento.' });
            }

            if (existingRegistration.status === 'pending') {
                return res.status(400).json({ message: 'Você já tem uma solicitação de registro pendente para este evento.' });
            }

            if (existingRegistration.status === 'rejected') {
                return res.status(400).json({ message: 'Sua solicitação de registro para este evento já foi rejeitada.' });
            }
        }

        // Verificar se o usuário está registrado para o simpósio do evento
        const userRegistration = await prisma.registration.findFirst({
            where: {
                userId: userId,
                symposiumId: event.symposiumId,
                status: 'accepted',  // Certifique-se de que o usuário foi aceito no simpósio
            },
        });

        if (!userRegistration) {
            return res.status(403).json({ message: 'Você deve ser aceito no simpósio para solicitar registro para este evento.' });
        }

        // Criar solicitação de registro para o evento
        const registration = await prisma.registration.create({
            data: {
                userId,
                eventId: id,
                status: 'pending',  // Define o status do registro como "pendente"
            },
        });

        res.status(201).json({ message: 'Solicitação de registro enviada com sucesso.', registration });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao solicitar registro para o evento.' });
    }
};

export const approveOrRejectSymposiumRegistration = async (req: Request, res: Response) => {
    const parsedParams = approveOrRejectSymposiumRegistrationParamsSchema.safeParse(req.params);
    const parsedBody = statusSchema.safeParse(req.body);

    if (!parsedParams.success) {
        return res.status(400).json({ message: 'Invalid parameters', errors: parsedParams.error.errors });
    }

    if (!parsedBody.success) {
        return res.status(400).json({ message: 'Invalid body data', errors: parsedBody.error.errors });
    }

    const { symposiumId, registrationId } = parsedParams.data;
    const { status } = parsedBody.data;  // "accepted" ou "rejected"

    try {
        // Certifique-se de que o organizador está aprovando um registro para o seu próprio simpósio
        const symposium = await prisma.symposium.findUnique({
            where: { id: symposiumId },
        });

        if (!symposium || symposium.organizerId !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Apenas o organizador pode aprovar/rejeitar este registro.' });
        }

        // Certifique-se de que o registro pertence ao simpósio
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
        });

        if (!registration || registration.symposiumId !== symposiumId) {
            return res.status(404).json({ message: 'Registro não encontrado para este simpósio.' });
        }

        // Atualizar o status do registro
        const updatedRegistration = await prisma.registration.update({
            where: { id: registrationId },
            data: { status },
        });

        // Se o registro for aceito, associe o usuário ao simpósio
        if (status === 'accepted') {
            await prisma.participantSymposium.create({
                data: {
                    userId: updatedRegistration.userId,
                    symposiumId: symposiumId,
                },
            });
        }

        res.json({ message: `Registro ${status} com sucesso.`, registration: updatedRegistration });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o status do registro.' });
    }
};

export const approveOrRejectEventRegistration = async (req: Request, res: Response) => {
    const parsedParams = approveOrRejectEventRegistrationParamsSchema.safeParse(req.params);
    const parsedBody = statusSchema.safeParse(req.body);

    if (!parsedParams.success) {
        return res.status(400).json({ message: 'Invalid parameters', errors: parsedParams.error.errors });
    }

    if (!parsedBody.success) {
        return res.status(400).json({ message: 'Invalid body data', errors: parsedBody.error.errors });
    }

    const { eventId, registrationId } = parsedParams.data;
    const { status } = parsedBody.data;  // "accepted" ou "rejected"

    try {
        // Certifique-se de que o organizador está aprovando um registro para o seu próprio evento
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { symposium: true },
        });

        if (!event || event.symposium.organizerId !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Apenas o organizador pode aprovar/rejeitar este registro.' });
        }

        // Certifique-se de que o registro pertence ao evento
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
        });

        if (!registration || registration.eventId !== eventId) {
            return res.status(404).json({ message: 'Registro não encontrado para este evento.' });
        }

        // Atualizar o status do registro
        const updatedRegistration = await prisma.registration.update({
            where: { id: registrationId },
            data: { status },
        });

        // Se o registro for aceito, associe o usuário ao evento
        if (status === 'accepted') {
            await prisma.participantEvent.create({
                data: {
                    userId: updatedRegistration.userId,
                    eventId: eventId,
                },
            });
        }

        res.json({ message: `Registro ${status} com sucesso.`, registration: updatedRegistration });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o status do registro.' });
    }
};
