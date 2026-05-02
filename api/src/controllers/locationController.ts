import { Request, Response } from 'express';
import { prisma } from '../db';

export class LocationController {
  async getCountries(req: Request, res: Response) {
    try {
      const countries = await prisma.country.findMany({
        orderBy: { name: 'asc' }
      });
      
      // Move Turkey to the top
      const enriched = countries.map((c: any) => ({
        id: c.id,
        name: c.name,
        code: c.code
      }));
      const trIndex = countries.findIndex(c => c.code === 'TR');
      if (trIndex > -1) {
        const tr = countries.splice(trIndex, 1)[0];
        if (tr) countries.unshift(tr);
      }
      
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch countries' });
    }
  }

  async getCities(req: Request, res: Response) {
    try {
      const { countryId } = req.query;
      const cities = await prisma.city.findMany({
        where: countryId ? { countryId: String(countryId) } : {},
        orderBy: { name: 'asc' }
      });
      res.json(cities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cities' });
    }
  }
}
