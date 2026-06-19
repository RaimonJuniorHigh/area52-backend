import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
    listAllBikes,
    getBikeById,
    createBike,
    updateBike,
    deleteBike,
    listBikesForGuest,
    rentBikeForGuest,
    BIKE_TYPES,
} from '../services/bikeRentalService';

function mapBikeForApi(bike: { id: number; name: string; type: string; pricePerDay: number; deposit: number; image: string; isRented: boolean }) {
    return {
        id: bike.id,
        name: bike.name,
        type: bike.type,
        pricePerDay: bike.pricePerDay,
        deposit: bike.deposit,
        imageUrl: bike.image,
        status: bike.isRented ? 'rented' : 'available',
    };
}

// --- Admin ---

export const adminListBikes = (_req: Request, res: Response): void => {
    res.json(listAllBikes().map(mapBikeForApi));
};

export const adminGetBike = (req: Request, res: Response): void => {
    const bike = getBikeById(Number(req.params.id));
    if (!bike) {
        res.status(404).json({ message: 'Fiets niet gevonden.' });
        return;
    }
    res.json(mapBikeForApi(bike));
};

export const adminCreateBike = (req: Request, res: Response): void => {
    const result = createBike({
        name: req.body.name,
        type: req.body.type,
        pricePerDay: Number(req.body.pricePerDay),
        deposit: Number(req.body.deposit ?? 0),
        image: req.body.imageUrl || req.body.image || '',
    });
    if ('error' in result) {
        res.status(400).json({ message: result.error });
        return;
    }
    res.status(201).json(mapBikeForApi(result));
};

export const adminUpdateBike = (req: Request, res: Response): void => {
    const result = updateBike(Number(req.params.id), {
        name: req.body.name,
        type: req.body.type,
        pricePerDay: Number(req.body.pricePerDay),
        deposit: Number(req.body.deposit ?? 0),
        image: req.body.imageUrl || req.body.image || '',
        isRented: req.body.status === 'rented',
    });
    if ('error' in result) {
        res.status(result.error === 'Fiets niet gevonden.' ? 404 : 400).json({ message: result.error });
        return;
    }
    res.json(mapBikeForApi(result));
};

export const adminDeleteBike = (req: Request, res: Response): void => {
    const result = deleteBike(Number(req.params.id));
    if (!result.ok) {
        res.status(404).json({ message: result.error });
        return;
    }
    res.json({ message: 'Fiets verwijderd.' });
};

export const adminGetBikeTypes = (_req: Request, res: Response): void => {
    res.json(BIKE_TYPES);
};

// --- Gast ---

export const guestListBikes = (req: AuthRequest, res: Response): void => {
    const guestId = req.user!.id;
    res.json(listBikesForGuest(guestId));
};

export const guestRentBike = (req: AuthRequest, res: Response): void => {
    const guestId = req.user!.id;
    const { bikeId, days, startDate, endDate, age } = req.body;

    let rentalDays = Number(days);
    if (!rentalDays && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            res.status(400).json({ message: 'Einddatum moet na startdatum liggen.' });
            return;
        }
        rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    const result = rentBikeForGuest(guestId, Number(bikeId), rentalDays, Number(age ?? 18));
    if (!result.ok) {
        res.status(400).json({ message: result.message });
        return;
    }
    res.status(201).json({ message: result.message });
};
