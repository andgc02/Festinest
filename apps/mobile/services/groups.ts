import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Timestamp,
  Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { getMockGroup } from '@/data/mockGroups';
import { Group, GroupChatMessage, GroupScheduleVote } from '@/types/group';

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

    const groups = snapshot.docs.map(mapGroup);

    const hydrated = await Promise.all(
      groups.map(async (group) => {
        if (group.chatPreview.length > 0) {
          return group;
        }

        try {
          const chatSnapshot = await getDocs(
            query(collection(db, COLLECTION_NAME, group.id, 'chat'), orderBy('timestamp', 'desc'), limit(3)),
          );

          if (chatSnapshot.empty) {
            return group;
          }

          const preview = chatSnapshot.docs
            .map((docSnapshot) => mapChatMessage(docSnapshot))
            .filter((message): message is GroupChatMessage => Boolean(message))
            .reverse();

          if (preview.length === 0) {
            return group;
          }

          return {
            ...group,
            chatPreview: preview,
          };
        } catch (error) {
          console.warn(`Unable to hydrate chat preview for group ${group.id}`, error);
          return group;
        }
      }),
    );

    return hydrated;
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
  const baseId = `${ownerId}-${slug || 'group'}`;
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

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  try {
    const reference = doc(db, COLLECTION_NAME, groupId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference);

      if (!snapshot.exists()) {
        throw new Error(`Group ${groupId} not found`);
      }

      const group = mapGroup(snapshot);

      if (group.ownerId === userId) {
        throw new Error('Group owners must delete the group instead of leaving it.');
      }

      if (!group.memberIds.includes(userId)) {
        throw new Error('You are not a member of this group.');
      }

      const nextMembers = group.members.filter((member) => member.id !== userId);
      const nextMemberIds = group.memberIds.filter((id) => id !== userId);
      const nextVotes = group.scheduleVotes.map((vote) => ({
        ...vote,
        voters: vote.voters.filter((id) => id !== userId),
      }));

      const nextGroup: Group = {
        ...group,
        members: nextMembers,
        memberIds: nextMemberIds,
        scheduleVotes: nextVotes,
        updatedAt: new Date().toISOString(),
      };

      transaction.set(reference, serializeGroup(nextGroup), { merge: false });
    });
  } catch (error) {
    console.warn(`Failed to leave group ${groupId}`, error);
    throw error;
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  try {
    const reference = doc(db, COLLECTION_NAME, groupId);
    await deleteDoc(reference);
  } catch (error) {
    console.warn(`Failed to delete group ${groupId}`, error);
    throw error;
  }
}

export function listenToGroup(groupId: string, onChange: (group: Group | null) => void, onError?: (error: Error) => void): Unsubscribe {
  const reference = doc(db, COLLECTION_NAME, groupId);
  return onSnapshot(
    reference,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      onChange(mapGroup(snapshot));
    },
    (error) => {
      console.warn(`Realtime group listener error for ${groupId}`, error);
      onError?.(error);
    },
  );
}

function mapChatMessage(snapshot: QueryDocumentSnapshot<DocumentData>): GroupChatMessage | null {
  const data = snapshot.data();
  const authorId = typeof data.authorId === 'string' ? data.authorId : null;
  const authorName = typeof data.authorName === 'string' ? data.authorName : null;
  const message = typeof data.message === 'string' ? data.message : null;
  const timestampValue = data.timestamp as Timestamp | undefined;

  if (!authorId || !authorName || !message) {
    return null;
  }

  let timestamp = new Date().toISOString();
  if (timestampValue?.toDate) {
    timestamp = timestampValue.toDate().toISOString();
  } else if (typeof data.timestamp === 'string') {
    timestamp = data.timestamp;
  }

  return {
    id: snapshot.id,
    authorId,
    authorName,
    message,
    timestamp,
  };
}

export function listenToGroupChat(
  groupId: string,
  onChange: (messages: GroupChatMessage[]) => void,
  onError?: (error: Error) => void,
  options: { limit?: number } = {},
): Unsubscribe {
  const { limit: messageLimit = 100 } = options;
  const chatQuery = query(
    collection(db, COLLECTION_NAME, groupId, 'chat'),
    orderBy('timestamp', 'asc'),
    limit(messageLimit),
  );

  return onSnapshot(
    chatQuery,
    (snapshot) => {
      const messages = snapshot.docs
        .map((docSnapshot) => mapChatMessage(docSnapshot))
        .filter((item): item is GroupChatMessage => Boolean(item));
      onChange(messages);
    },
    (error) => {
      console.warn(`Realtime chat listener error for ${groupId}`, error);
      onError?.(error);
    },
  );
}

export async function sendGroupChatMessage(params: {
  groupId: string;
  authorId: string;
  authorName: string;
  message: string;
}): Promise<void> {
  const trimmed = params.message.trim();
  if (!trimmed.length) {
    throw new Error('Cannot send an empty message.');
  }

  try {
    const createdAt = new Date().toISOString();
    const reference = await addDoc(collection(db, COLLECTION_NAME, params.groupId, 'chat'), {
      authorId: params.authorId,
      authorName: params.authorName,
      message: trimmed,
      timestamp: serverTimestamp(),
    });

    const previewMessage: GroupChatMessage = {
      id: reference.id,
      authorId: params.authorId,
      authorName: params.authorName,
      message: trimmed,
      timestamp: createdAt,
    };

    try {
      await runTransaction(db, async (transaction) => {
        const groupRef = doc(db, COLLECTION_NAME, params.groupId);
        const snapshot = await transaction.get(groupRef);
        const existingPreview = snapshot.exists() ? mapChatPreview(snapshot.data()?.chatPreview) : [];

        const nextPreview = [...existingPreview, previewMessage].slice(-4);
        transaction.set(
          groupRef,
          {
            chatPreview: nextPreview.map((message) => ({
              id: message.id,
              authorId: message.authorId,
              authorName: message.authorName,
              message: message.message,
              timestamp: message.timestamp,
            })),
            updatedAt: createdAt,
          },
          { merge: true },
        );
      });
    } catch (previewError) {
      console.warn(`Unable to refresh chat preview for group ${params.groupId}`, previewError);
    }
  } catch (error) {
    console.warn(`Failed to send chat message for group ${params.groupId}`, error);
    throw error;
  }
}
