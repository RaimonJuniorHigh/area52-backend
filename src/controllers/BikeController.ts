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

export const adminListBikes = async (_req: Request, res: Response): Promise<void> => {
    try {
        const bikes = await listAllBikes();
        res.json(bikes.map(mapBikeForApi));
    } catch (error) {
        console.error('Fout bij ophalen fietsen:', error);
        res.status(500).json({ message: 'Fietsen konden niet worden opgehaald.' });
    }
};

export const adminGetBike = async (req: Request, res: Response): Promise<void> => {
    try {
        const bike = await getBikeById(Number(req.params.id));
        if (!bike) {
            res.status(404).json({ message: 'Fiets niet gevonden.' });
            return;
        }
        res.json(mapBikeForApi(bike));
    } catch (error) {
        console.error('Fout bij ophalen fiets:', error);
        res.status(500).json({ message: 'Fiets kon niet worden opgehaald.' });
    }
};

export const adminCreateBike = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await createBike({
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
    } catch (error) {
        console.error('Fout bij aanmaken fiets:', error);
        res.status(500).json({ message: 'Fiets kon niet worden aangemaakt.' });
    }
};

export const adminUpdateBike = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await updateBike(Number(req.params.id), {
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
    } catch (error) {
        console.error('Fout bij bijwerken fiets:', error);
        res.status(500).json({ message: 'Fiets kon niet worden bijgewerkt.' });
    }
};

export const adminDeleteBike = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await deleteBike(Number(req.params.id));
        if (!result.ok) {
            res.status(result.error === 'Fiets niet gevonden.' ? 404 : 400).json({ message: result.error });
            return;
        }
        res.json({ message: 'Fiets verwijderd.' });
    } catch (error) {
        console.error('Fout bij verwijderen fiets:', error);
        res.status(500).json({ message: 'Fiets kon niet worden verwijderd.' });
    }
};

export const adminGetBikeTypes = (_req: Request, res: Response): void => {
    res.json(BIKE_TYPES);
};

// --- Gast ---

export const guestListBikes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const guestId = req.user!.id;
        res.json(await listBikesForGuest(guestId));
    } catch (error) {
        console.error('Fout bij ophalen gast-fietsen:', error);
        res.status(500).json({ message: 'Fietsen konden niet worden opgehaald.' });
    }
};

export const guestRentBike = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const guestId = req.user!.id;
        const { bikeId, days, startDate, endDate, age } = req.body;

        let rentalDays = Number(days);
        let rentalStart = startDate;
        let rentalEnd = endDate;

        if (!rentalDays && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) {
                res.status(400).json({ message: 'Einddatum moet na startdatum liggen.' });
                return;
            }
            rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            rentalStart = startDate;
            rentalEnd = endDate;
        }

        const result = await rentBikeForGuest(
            guestId,
            Number(bikeId),
            rentalDays,
            Number(age ?? 18),
            rentalStart,
            rentalEnd
        );
        if (!result.ok) {
            res.status(400).json({ message: result.message });
            return;
        }
        res.status(201).json({ message: result.message });
    } catch (error) {
        console.error('Fout bij huren fiets:', error);
        res.status(500).json({ message: 'Verhuring kon niet worden verwerkt.' });
    }
};
