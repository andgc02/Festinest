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
      { artist: 'Billie Eilish', stage: 'Coachella Stage', time: '21:00' },
      { artist: 'Fred again..', stage: 'Sahara Tent', time: '19:30' },
      { artist: 'Tame Impala', stage: 'Outdoor Theatre', time: '20:15' },
    ],
    schedule: [
      { day: 'Friday', artist: 'Fred again..', time: '19:30', stage: 'Sahara Tent' },
      { day: 'Saturday', artist: 'Billie Eilish', time: '21:00', stage: 'Coachella Stage' },
      { day: 'Sunday', artist: 'Tame Impala', time: '20:15', stage: 'Outdoor Theatre' },
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
      { artist: 'Kendrick Lamar', stage: 'Grant Park Stage', time: '21:30' },
      { artist: 'Phoebe Bridgers', stage: 'Lake Shore Stage', time: '19:00' },
      { artist: 'ODESZA', stage: 'Perry’s Stage', time: '22:15' },
    ],
    schedule: [
      { day: 'Friday', artist: 'Phoebe Bridgers', time: '19:00', stage: 'Lake Shore Stage' },
      { day: 'Saturday', artist: 'Kendrick Lamar', time: '21:30', stage: 'Grant Park Stage' },
      { day: 'Sunday', artist: 'ODESZA', time: '22:15', stage: 'Perry’s Stage' },
    ],
  },
];
