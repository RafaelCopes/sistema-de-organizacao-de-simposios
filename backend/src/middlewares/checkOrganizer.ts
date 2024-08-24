import { Request, Response, NextFunction } from 'express';

export const checkOrganizer = (req: Request, res: Response, next: NextFunction) => {
    if (req.user.type !== 'organizer') {
        return res.status(403).json({ message: 'Access denied. Only organizers can perform this action.' });
    }
    next();
};
