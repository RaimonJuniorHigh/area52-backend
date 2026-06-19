import { Request, Response } from 'express';
import {
    listFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility,
    reorderFacilities,
    FACILITY_CATEGORIES,
    FacilityCategory,
    WeeklyHours,
} from '../services/facilityService';

export const adminListFacilities = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.json(await listFacilities());
    } catch (error) {
        console.error('Fout bij ophalen locaties:', error);
        res.status(500).json({ message: 'Locaties konden niet worden opgehaald.' });
    }
};

export const adminGetFacility = async (req: Request, res: Response): Promise<void> => {
    try {
        const facility = await getFacilityById(Number(req.params.id));
        if (!facility) {
            res.status(404).json({ message: 'Locatie niet gevonden.' });
            return;
        }
        res.json(facility);
    } catch (error) {
        console.error('Fout bij ophalen locatie:', error);
        res.status(500).json({ message: 'Locatie kon niet worden opgehaald.' });
    }
};

export const adminCreateFacility = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await createFacility({
            name: req.body.name,
            category: req.body.category as FacilityCategory,
            description: req.body.description,
            icon: req.body.icon,
            weeklyHours: req.body.weeklyHours as WeeklyHours,
        });
        if ('error' in result) {
            res.status(400).json({ message: result.error });
            return;
        }
        res.status(201).json(result);
    } catch (error) {
        console.error('Fout bij aanmaken locatie:', error);
        res.status(500).json({ message: 'Locatie kon niet worden aangemaakt.' });
    }
};

export const adminUpdateFacility = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await updateFacility(Number(req.params.id), {
            name: req.body.name,
            category: req.body.category as FacilityCategory,
            description: req.body.description,
            icon: req.body.icon,
            weeklyHours: req.body.weeklyHours as WeeklyHours,
        });
        if ('error' in result) {
            res.status(result.error === 'Locatie niet gevonden.' ? 404 : 400).json({ message: result.error });
            return;
        }
        res.json(result);
    } catch (error) {
        console.error('Fout bij bijwerken locatie:', error);
        res.status(500).json({ message: 'Locatie kon niet worden bijgewerkt.' });
    }
};

export const adminDeleteFacility = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await deleteFacility(Number(req.params.id));
        if (!result.ok) {
            res.status(404).json({ message: result.error });
            return;
        }
        res.json({ message: 'Locatie verwijderd.' });
    } catch (error) {
        console.error('Fout bij verwijderen locatie:', error);
        res.status(500).json({ message: 'Locatie kon niet worden verwijderd.' });
    }
};

export const adminReorderFacilities = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = req.body.order as number[];
        const result = await reorderFacilities(order);
        if (!result.ok) {
            res.status(400).json({ message: result.error });
            return;
        }
        res.json({ message: 'Volgorde opgeslagen.' });
    } catch (error) {
        console.error('Fout bij opslaan volgorde:', error);
        res.status(500).json({ message: 'Volgorde kon niet worden opgeslagen.' });
    }
};

export const adminGetFacilityCategories = (_req: Request, res: Response): void => {
    res.json(FACILITY_CATEGORIES);
};

export const guestListFacilities = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.json(await listFacilities());
    } catch (error) {
        console.error('Fout bij ophalen openingstijden:', error);
        res.status(500).json({ message: 'Openingstijden konden niet worden geladen.' });
    }
};
