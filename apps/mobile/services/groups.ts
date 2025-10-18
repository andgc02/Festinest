import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  setDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { getMockGroup } from '@/data/mockGroups';
import { Group, GroupScheduleVote } from '@/types/group';

const COLLECTION_NAME = 'groups';
const MAX_GROUPS_PER_USER = 5;

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

function mapMembers(values: unknown): Group['members'] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
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
    .filter((item): item is Group['members'][number] => Boolean(item));
}

function mapChatPreview(values: unknown): Group['chatPreview'] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
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
    .filter((item): item is Group['chatPreview'][number] => Boolean(item));
}

function mapGroup(snapshot: DocumentSnapshot<DocumentData>): Group {
  const data = snapshot.data() ?? {};

  const members = mapMembers(data.members);
  const memberIds =
    Array.isArray(data.memberIds) && data.memberIds.every((value) => typeof value === 'string')
      ? (data.memberIds as string[])
      : members.map((member) => member.id);

  return {
    id: snapshot.id,
    name: typeof data.name === 'string' ? data.name : 'Friends Group',
    festivalId: typeof data.festivalId === 'string' ? data.festivalId : undefined,
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
    ownerName: typeof data.ownerName === 'string' ? data.ownerName : undefined,
    ownerUsername: typeof data.ownerUsername === 'string' ? data.ownerUsername : '',
    members,
    memberIds,
    scheduleVotes: mapScheduleVotes(data.scheduleVotes),
    chatPreview: mapChatPreview(data.chatPreview),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  };
}

function serializeGroup(group: Group) {
  return {
    name: group.name,
    festivalId: group.festivalId ?? null,
    ownerId: group.ownerId,
    ownerName: group.ownerName ?? null,
    ownerUsername: group.ownerUsername,
    members: group.members.map((member) => ({
      id: member.id,
      name: member.name,
      avatarUrl: member.avatarUrl ?? null,
    })),
    memberIds: group.memberIds,
    scheduleVotes: group.scheduleVotes.map((vote) => ({
      id: vote.id,
      artistId: vote.artistId ?? null,
      artistName: vote.artistName,
      day: vote.day ?? null,
      time: vote.time ?? null,
      stage: vote.stage ?? null,
      voters: vote.voters,
    })),
    chatPreview: group.chatPreview.map((message) => ({
      id: message.id,
      authorId: message.authorId,
      authorName: message.authorName,
      message: message.message,
      timestamp: message.timestamp,
    })),
    updatedAt: group.updatedAt ?? new Date().toISOString(),
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
      const fallback = getMockGroup(groupId);
      try {
        await setDoc(reference, serializeGroup(fallback), { merge: false });
      } catch (setError) {
        console.warn(`Unable to seed fallback group ${groupId}`, setError);
      }
      return fallback;
    }

    const group = mapGroup(snapshot);
    const needsMemberIdsPersisted = (snapshot.data()?.memberIds?.length ?? 0) === 0;
    if (needsMemberIdsPersisted) {
      await setDoc(reference, { memberIds: group.memberIds }, { merge: true });
    }
    return group;
  } catch (error) {
    console.warn(`Failed to fetch group ${groupId}, falling back to mock data`, error);
    return getMockGroup(groupId);
  }
}

export async function fetchUserGroups(userId: string): Promise<Group[]> {
  if (!userId) {
    return [getMockGroup()];
  }

  try {
    const groupsQuery = query(collection(db, COLLECTION_NAME), where('memberIds', 'array-contains', userId));
    const snapshot = await getDocs(groupsQuery);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(mapGroup);
  } catch (error) {
    console.warn(`Failed to fetch groups for user ${userId}, returning mock fallback`, error);
    return [getMockGroup(undefined, { ownerId: userId, memberIds: [userId] })];
  }
}

type CreateGroupOptions = {
  name: string;
  ownerId: string;
  ownerName?: string;
  ownerUsername: string;
  festivalId?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export async function createGroup({
  name,
  ownerId,
  ownerName,
  ownerUsername,
  festivalId,
}: CreateGroupOptions): Promise<Group> {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new Error('Group name is required.');
  }

  const slug = slugify(normalizedName);
  const baseId = `${ownerUsername}-${slug || 'group'}`;
  const groupId = baseId.toLowerCase();
  const reference = doc(db, COLLECTION_NAME, groupId);

  const existingMembershipQuery = query(
    collection(db, COLLECTION_NAME),
    where('memberIds', 'array-contains', ownerId),
    limit(MAX_GROUPS_PER_USER),
  );
  const membershipSnapshot = await getDocs(existingMembershipQuery);
  if (membershipSnapshot.size >= MAX_GROUPS_PER_USER) {
    throw new Error('You already have 5 active groups. Archive one before creating another.');
  }

  const existing = await getDoc(reference);
  if (existing.exists()) {
    throw new Error('A group with this name already exists. Try a different name.');
  }

  const ownerDisplayName = ownerName || ownerUsername;

  const group: Group = {
    id: groupId,
    name: normalizedName,
    festivalId,
    ownerId,
    ownerName: ownerName ?? ownerDisplayName,
    ownerUsername,
    members: [
      {
        id: ownerId,
        name: ownerDisplayName,
      },
    ],
    memberIds: [ownerId],
    scheduleVotes: [],
    chatPreview: [],
    updatedAt: new Date().toISOString(),
  };

  await setDoc(reference, serializeGroup(group), { merge: false });

  return group;
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

      let currentGroup = group;
      if (!snapshot.exists()) {
        const seededGroup = serializeGroup(group);
        transaction.set(reference, seededGroup);
        currentGroup = group;
      } else {
        const data = snapshot.data() ?? {};
        const existingVotes = mapScheduleVotes(data.scheduleVotes);
        currentGroup = {
          ...group,
          scheduleVotes: existingVotes,
        };
      }

      const nextGroup = applyVoteState(currentGroup, slotId, userId);

      transaction.set(reference, serializeGroup({ ...currentGroup, scheduleVotes: nextGroup.scheduleVotes }), {
        merge: true,
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
  MAX_GROUPS_PER_USER,
};

export async function deleteGroup(groupId: string): Promise<void> {
  try {
    const reference = doc(db, COLLECTION_NAME, groupId);
    await deleteDoc(reference);
  } catch (error) {
    console.warn(`Failed to delete group ${groupId}`, error);
    throw error;
  }
}
