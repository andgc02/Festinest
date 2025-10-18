export type GroupMember = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type GroupScheduleVote = {
  id: string;
  artistId?: string;
  artistName: string;
  day?: string;
  time?: string;
  stage?: string;
  voters: string[];
};

export type GroupChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  timestamp: string;
};

export type Group = {
  id: string;
  name: string;
  festivalId?: string;
  ownerId: string;
  ownerName?: string;
  ownerUsername: string;
  members: GroupMember[];
  memberIds: string[];
  scheduleVotes: GroupScheduleVote[];
  chatPreview: GroupChatMessage[];
  updatedAt?: string;
};

export function getVoteCount(vote: GroupScheduleVote) {
  return vote.voters.length;
}
