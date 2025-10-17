import { Festival } from '@/types/festival';

export const mockFestivals: Festival[] = [
  {
    id: 'coachella-2025',
    name: 'Coachella 2025',
    location: 'Indio, CA',
    startDate: '2025-04-11',
    endDate: '2025-04-13',
    genre: 'EDM, Pop, Indie',
    artistsCount: 180,
    lineup: [
      { artistId: 'billie-eilish', artistName: 'Billie Eilish', stage: 'Coachella Stage', day: 'Friday', time: '21:00' },
      { artistId: 'fred-again', artistName: 'Fred again..', stage: 'Sahara Tent', day: 'Friday', time: '19:30' },
      { artistId: 'tame-impala', artistName: 'Tame Impala', stage: 'Outdoor Theatre', day: 'Sunday', time: '20:15' },
    ],
    schedule: [
      { day: 'Friday', time: '19:30', stage: 'Sahara Tent', artistId: 'fred-again', artistName: 'Fred again..' },
      { day: 'Saturday', time: '21:00', stage: 'Coachella Stage', artistId: 'billie-eilish', artistName: 'Billie Eilish' },
      { day: 'Sunday', time: '20:15', stage: 'Outdoor Theatre', artistId: 'tame-impala', artistName: 'Tame Impala' },
    ],
  },
  {
    id: 'lollapalooza-2025',
    name: 'Lollapalooza 2025',
    location: 'Chicago, IL',
    startDate: '2025-08-01',
    endDate: '2025-08-04',
    genre: 'Rock, Pop, Hip-Hop',
    artistsCount: 120,
    lineup: [
      { artistId: 'kendrick-lamar', artistName: 'Kendrick Lamar', stage: 'Grant Park Stage', day: 'Saturday', time: '21:30' },
      { artistId: 'phoebe-bridgers', artistName: 'Phoebe Bridgers', stage: 'Lake Shore Stage', day: 'Friday', time: '19:00' },
      { artistId: 'odesza', artistName: 'ODESZA', stage: "Perry's Stage", day: 'Sunday', time: '22:15' },
    ],
    schedule: [
      { day: 'Friday', time: '19:00', stage: 'Lake Shore Stage', artistId: 'phoebe-bridgers', artistName: 'Phoebe Bridgers' },
      { day: 'Saturday', time: '21:30', stage: 'Grant Park Stage', artistId: 'kendrick-lamar', artistName: 'Kendrick Lamar' },
      { day: 'Sunday', time: '22:15', stage: "Perry's Stage", artistId: 'odesza', artistName: 'ODESZA' },
    ],
  },
];

