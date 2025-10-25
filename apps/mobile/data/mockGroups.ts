import { Group } from '@/types/group';

const baseGroup: Group = {
  id: 'demo-coachella-squad',
  name: 'Coachella Squad',
  festivalId: 'coachella-2026',
  ownerId: 'demo-user',
  ownerName: 'Demo User',
  ownerUsername: 'demo',
  members: [
    { id: 'demo-user', name: 'Demo User' },
    { id: 'alex', name: 'Alex' },
    { id: 'sam', name: 'Sam' },
    { id: 'riley', name: 'Riley' },
    { id: 'casey', name: 'Casey' },
  ],
  memberIds: ['demo-user', 'alex', 'sam', 'riley', 'casey'],
  scheduleVotes: [
    {
      id: 'fred',
      artistId: 'fred-again',
      artistName: 'Fred again..',
      day: 'Friday',
      time: '1:00 PM',
      stage: 'Main',
      voters: ['demo-user', 'alex', 'sam'],
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
  lightningPolls: [
    {
      id: 'demo-poll',
      prompt: 'Sunset set: Fisher or RÜFÜS?',
      leftLabel: 'Fisher',
      rightLabel: 'RÜFÜS DU SOL',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      createdBy: 'demo-user',
      active: true,
      votes: {
        'demo-user': 'right',
        alex: 'left',
        sam: 'right',
      },
    },
  ],
  leaderControls: {
    lockedScheduleVoteIds: ['fred'],
    highlightedVoteIds: ['peggy'],
    lastNudgeAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  updatedAt: new Date().toISOString(),
};

export function getMockGroup(groupId?: string, overrides?: Partial<Group>): Group {
  return {
    ...baseGroup,
    ...overrides,
    id: groupId ?? overrides?.id ?? baseGroup.id,
    memberIds: overrides?.memberIds ?? overrides?.members?.map((member) => member.id) ?? baseGroup.memberIds,
  };
}
