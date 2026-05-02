import { prisma } from './db';
import { Country, State } from 'country-state-city';

async function main() {
  console.log('Starting seed...');

  const allCountries = Country.getAllCountries();
  console.log(`Found ${allCountries.length} countries.`);

  // 1. Seed Countries
  for (const c of allCountries) {
    await prisma.country.upsert({
      where: { code: c.isoCode },
      update: { name: c.name },
      create: {
        name: c.name,
        code: c.isoCode
      }
    });
  }
  console.log('Countries seeded.');

  // 0. Clear existing cities to avoid mess
  console.log('Cleaning up existing cities...');
  await prisma.city.deleteMany({});

  // 2. Seed States as "Cities" (Turkey first)
  const turkeyStates = State.getStatesOfCountry('TR') || [];
  console.log(`Seeding ${turkeyStates.length} provinces for Turkey...`);
  
  const trCountry = await prisma.country.findUnique({ where: { code: 'TR' } });
  if (trCountry && turkeyStates.length > 0) {
    await prisma.city.createMany({
      data: turkeyStates.map(state => ({
        name: state.name,
        countryId: trCountry.id
      })),
      skipDuplicates: true
    });
  }

  // 3. Seed states for other major countries
  const otherCountries = allCountries.filter(c => c.isoCode !== 'TR');
  
  console.log('Seeding provinces/states for other countries...');
  for (const country of otherCountries) {
    const states = State.getStatesOfCountry(country.isoCode) || [];
    if (states.length === 0) continue;

    const countryRecord = await prisma.country.findUnique({ where: { code: country.isoCode } });
    if (!countryRecord) continue;

    // Use states instead of cities to keep it clean
    const statesToSeed = states.slice(0, 10); // Top 10 states per country
    
    await prisma.city.createMany({
      data: statesToSeed.map(state => ({
        name: state.name,
        countryId: countryRecord.id
      })),
      skipDuplicates: true
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    // @ts-ignore
    if (typeof process !== 'undefined') process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
