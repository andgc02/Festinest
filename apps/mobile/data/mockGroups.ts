import { Group } from '@/types/group';

const baseGroup: Group = {
  id: 'coachella-squad',
  name: 'Coachella Squad',
  festivalId: 'coachella-2026',
  members: [
    { id: 'self', name: 'You' },
    { id: 'alex', name: 'Alex' },
    { id: 'sam', name: 'Sam' },
    { id: 'riley', name: 'Riley' },
    { id: 'casey', name: 'Casey' },
  ],
  scheduleVotes: [
    {
      id: 'fred',
      artistId: 'fred-again',
      artistName: 'Fred again..',
      day: 'Friday',
      time: '1:00 PM',
      stage: 'Main',
      voters: ['self', 'alex', 'sam'],
    },
    {
      id: 'peggy',
      artistId: 'peggy-gou',
      artistName: 'Peggy Gou',
      day: 'Friday',
      time: '2:30 PM',
      stage: 'Sahara',
      voters: ['alex'],
    },
  ],
  chatPreview: [
    { id: '1', authorId: 'alex', authorName: 'Alex', message: 'Meet at the main gate at noon?', timestamp: '11:45 AM' },
    { id: '2', authorId: 'sam', authorName: 'Sam', message: 'Bring water and sunscreen!', timestamp: '11:47 AM' },
  ],
  updatedAt: new Date().toISOString(),
};

export function getMockGroup(groupId?: string): Group {
  return {
    ...baseGroup,
    id: groupId ?? baseGroup.id,
  };
}

