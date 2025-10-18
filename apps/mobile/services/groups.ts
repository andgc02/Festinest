import {
  doc,
  getDoc,
  runTransaction,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { getMockGroup } from '@/data/mockGroups';
import { Group, GroupScheduleVote } from '@/types/group';

const COLLECTION_NAME = 'groups';

function mapScheduleVotes(values: unknown): GroupScheduleVote[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (!value || typeof value !== 'object') {
        return null;
      }

      const vote = value as Record<string, unknown>;
      const id = typeof vote.id === 'string' ? vote.id : typeof vote.slotId === 'string' ? vote.slotId : undefined;
      const artistName =
        typeof vote.artistName === 'string'
          ? vote.artistName
          : typeof vote.artist === 'string'
          ? vote.artist
          : undefined;

      if (!id || !artistName) {
        return null;
      }

      const voters =
        Array.isArray(vote.voters) && vote.voters.every((item) => typeof item === 'string')
          ? (vote.voters as string[])
          : [];

      return {
        id,
        artistId: typeof vote.artistId === 'string' ? vote.artistId : undefined,
        artistName,
        day: typeof vote.day === 'string' ? vote.day : undefined,
        time: typeof vote.time === 'string' ? vote.time : undefined,
        stage: typeof vote.stage === 'string' ? vote.stage : undefined,
        voters,
      } satisfies GroupScheduleVote;
    })
    .filter((item): item is GroupScheduleVote => Boolean(item));
}

function mapGroup(snapshot: DocumentSnapshot<DocumentData>): Group {
  const data = snapshot.data() ?? {};

  const members = Array.isArray(data.members)
    ? data.members
        .map((value) => {
          if (!value || typeof value !== 'object') {
            return null;
          }
          const member = value as Record<string, unknown>;
          const id = typeof member.id === 'string' ? member.id : undefined;
          const name = typeof member.name === 'string' ? member.name : undefined;
          if (!id || !name) {
            return null;
          }
          return {
            id,
            name,
            avatarUrl: typeof member.avatarUrl === 'string' ? member.avatarUrl : undefined,
          };
        })
        .filter((item): item is Group['members'][number] => Boolean(item))
    : [];

  const chatPreview = Array.isArray(data.chatPreview)
    ? data.chatPreview
        .map((value) => {
          if (!value || typeof value !== 'object') {
            return null;
          }
          const message = value as Record<string, unknown>;
          const id = typeof message.id === 'string' ? message.id : undefined;
          const authorId = typeof message.authorId === 'string' ? message.authorId : undefined;
          const authorName = typeof message.authorName === 'string' ? message.authorName : undefined;
          const text = typeof message.message === 'string' ? message.message : undefined;
          const timestamp = typeof message.timestamp === 'string' ? message.timestamp : undefined;
          if (!id || !authorId || !authorName || !text || !timestamp) {
            return null;
          }
          return {
            id,
            authorId,
            authorName,
            message: text,
            timestamp,
          };
        })
        .filter((item): item is Group['chatPreview'][number] => Boolean(item))
    : [];

  return {
    id: snapshot.id,
    name: typeof data.name === 'string' ? data.name : 'Friends Group',
    festivalId: typeof data.festivalId === 'string' ? data.festivalId : undefined,
    members,
    scheduleVotes: mapScheduleVotes(data.scheduleVotes),
    chatPreview,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  };
}

export async function fetchGroupById(groupId?: string): Promise<Group> {
  if (!groupId) {
    return getMockGroup();
  }

  try {
    const reference = doc(db, COLLECTION_NAME, groupId);
    const snapshot = await getDoc(reference);

    if (!snapshot.exists()) {
      return getMockGroup(groupId);
    }

    return mapGroup(snapshot);
  } catch (error) {
    console.warn(`Failed to fetch group ${groupId}, falling back to mock data`, error);
    return getMockGroup(groupId);
  }
}

function applyVoteState(group: Group, slotId: string, userId: string): Group {
  const nextVotes = group.scheduleVotes.map((vote) => {
    if (vote.id !== slotId) {
      return vote;
    }

    const hasVoted = vote.voters.includes(userId);
    return {
      ...vote,
      voters: hasVoted ? vote.voters.filter((id) => id !== userId) : [...vote.voters, userId],
    };
  });

  return {
    ...group,
    scheduleVotes: nextVotes,
  };
}

export async function toggleGroupVote(group: Group, slotId: string, userId: string): Promise<Group> {
  try {
    const reference = doc(db, COLLECTION_NAME, group.id);
    const updatedGroup = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference);

      if (!snapshot.exists()) {
        throw new Error(`Group ${group.id} not found`);
      }

      const data = snapshot.data() ?? {};
      const existingVotes = mapScheduleVotes(data.scheduleVotes);
      const nextGroup = applyVoteState(
        {
          ...group,
          scheduleVotes: existingVotes,
        },
        slotId,
        userId,
      );

      transaction.update(reference, {
        scheduleVotes: nextGroup.scheduleVotes.map((vote) => ({
          id: vote.id,
          artistId: vote.artistId,
          artistName: vote.artistName,
          day: vote.day,
          stage: vote.stage,
          time: vote.time,
          voters: vote.voters,
        })),
        updatedAt: new Date().toISOString(),
      });

      return nextGroup;
    });

    return updatedGroup;
  } catch (error) {
    console.warn(`Failed to persist vote for group ${group.id}, applying local fallback`, error);
    return applyVoteState(group, slotId, userId);
  }
}

export const GroupVoteUtils = {
  applyVoteState,
};

