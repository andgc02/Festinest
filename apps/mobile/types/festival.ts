export type FestivalLineupEntry = {
  artistId?: string;
  artist?: string;
  artistName?: string;
  stage?: string;
  day?: string;
  time?: string;
};

export type FestivalScheduleEntry = {
  day: string;
  time: string;
  stage: string;
  artistId?: string;
  artist?: string;
  artistName?: string;
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
