export type FestivalLineupEntry = {
  artist: string;
  time?: string;
  stage?: string;
};

export type FestivalScheduleEntry = {
  day: string;
  artist: string;
  time: string;
  stage: string;
};

export type Festival = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  genre?: string;
  genres?: string[];
  status?: string;
  website?: string;
  ticketUrl?: string;
  lastUpdated?: string;
  artistsCount?: number;
  lineup?: FestivalLineupEntry[];
  schedule?: FestivalScheduleEntry[];
};
