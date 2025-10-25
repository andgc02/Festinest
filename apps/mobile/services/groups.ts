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
import {
  Group,
  GroupChatMessage,
  GroupLeaderControls,
  GroupLightningPoll,
  GroupScheduleVote,
  LightningPollChoice,
} from '@/types/group';

const COLLECTION_NAME = 'groups';
const MAX_GROUPS_PER_USER = 5;
const MAX_ACTIVE_LIGHTNING_POLLS = 3;

const DEFAULT_LEADER_CONTROLS: GroupLeaderControls = {
  lockedScheduleVoteIds: [],
  highlightedVoteIds: [],
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

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

function mapLightningPolls(values: unknown): GroupLightningPoll[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (!value || typeof value !== 'object') {
        return null;
      }

      const poll = value as Record<string, unknown>;
      const id = typeof poll.id === 'string' ? poll.id : undefined;
      const prompt = typeof poll.prompt === 'string' ? poll.prompt : undefined;
      const leftLabel = typeof poll.leftLabel === 'string' ? poll.leftLabel : undefined;
      const rightLabel = typeof poll.rightLabel === 'string' ? poll.rightLabel : undefined;
      const createdBy = typeof poll.createdBy === 'string' ? poll.createdBy : undefined;
      const createdAt = typeof poll.createdAt === 'string' ? poll.createdAt : new Date().toISOString();
      const active = typeof poll.active === 'boolean' ? poll.active : true;

      if (!id || !prompt || !leftLabel || !rightLabel || !createdBy) {
        return null;
      }

      const votes: Record<string, LightningPollChoice> = {};
      if (poll.votes && typeof poll.votes === 'object') {
        Object.entries(poll.votes as Record<string, unknown>).forEach(([key, value]) => {
          if (value === 'left' || value === 'right') {
            votes[key] = value;
          }
        });
      }

      return {
        id,
        prompt,
        leftLabel,
        rightLabel,
        createdBy,
        createdAt,
        active,
        votes,
      };
    })
    .filter((item): item is GroupLightningPoll => Boolean(item));
}

function mapLeaderControls(values: unknown): GroupLeaderControls {
  if (!values || typeof values !== 'object') {
    return { ...DEFAULT_LEADER_CONTROLS };
  }

  const data = values as Record<string, unknown>;
  const locked =
    Array.isArray(data.lockedScheduleVoteIds) && data.lockedScheduleVoteIds.every((value) => typeof value === 'string')
      ? (data.lockedScheduleVoteIds as string[])
      : [];
  const highlighted =
    Array.isArray(data.highlightedVoteIds) && data.highlightedVoteIds.every((value) => typeof value === 'string')
      ? (data.highlightedVoteIds as string[])
      : [];

  return {
    lockedScheduleVoteIds: locked,
    highlightedVoteIds: highlighted,
    lastNudgeAt: typeof data.lastNudgeAt === 'string' ? data.lastNudgeAt : undefined,
  };
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
    lightningPolls: mapLightningPolls(data.lightningPolls),
    leaderControls: mapLeaderControls(data.leaderControls),
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
    lightningPolls: group.lightningPolls.map(serializeLightningPoll),
    leaderControls: serializeLeaderControls(group.leaderControls),
    updatedAt: group.updatedAt ?? new Date().toISOString(),
  };
}

function serializeLightningPoll(poll: GroupLightningPoll) {
  return {
    id: poll.id,
    prompt: poll.prompt,
    leftLabel: poll.leftLabel,
    rightLabel: poll.rightLabel,
    createdAt: poll.createdAt,
    createdBy: poll.createdBy,
    active: poll.active,
    votes: poll.votes,
  };
}

function serializeLeaderControls(controls: GroupLeaderControls) {
  return {
    lockedScheduleVoteIds: controls.lockedScheduleVoteIds,
    highlightedVoteIds: controls.highlightedVoteIds,
    lastNudgeAt: controls.lastNudgeAt ?? null,
  };
}

function ensureLeaderControls(controls?: GroupLeaderControls): GroupLeaderControls {
  if (!controls) {
    return { ...DEFAULT_LEADER_CONTROLS };
  }

  return {
    lockedScheduleVoteIds: Array.from(new Set(controls.lockedScheduleVoteIds)),
    highlightedVoteIds: Array.from(new Set(controls.highlightedVoteIds)),
    lastNudgeAt: controls.lastNudgeAt,
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
    lightningPolls: [],
    leaderControls: { ...DEFAULT_LEADER_CONTROLS },
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
  isVoteLocked(controls: GroupLeaderControls | undefined, voteId: string) {
    if (!controls) {
      return false;
    }
    return controls.lockedScheduleVoteIds.includes(voteId);
  },
  isVoteHighlighted(controls: GroupLeaderControls | undefined, voteId: string) {
    if (!controls) {
      return false;
    }
    return controls.highlightedVoteIds.includes(voteId);
  },
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

type CreateLightningPollParams = {
  groupId: string;
  userId: string;
  prompt: string;
  leftLabel: string;
  rightLabel: string;
};

export async function createLightningPoll(params: CreateLightningPollParams): Promise<GroupLightningPoll> {
  const prompt = params.prompt.trim();
  const left = params.leftLabel.trim();
  const right = params.rightLabel.trim();
  if (!prompt || !left || !right) {
    throw new Error('Provide a prompt and both choices to create a poll.');
  }

  const reference = doc(db, COLLECTION_NAME, params.groupId);
  const poll = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) {
      throw new Error('Group not found.');
    }

    const group = mapGroup(snapshot);
    if (group.ownerId !== params.userId) {
      throw new Error('Only group owners with premium can launch a lightning poll.');
    }

    const activePolls = group.lightningPolls.filter((item) => item.active);
    if (activePolls.length >= MAX_ACTIVE_LIGHTNING_POLLS) {
      throw new Error('Close an active poll before starting another.');
    }

    const newPoll: GroupLightningPoll = {
      id: createId('poll'),
      prompt,
      leftLabel: left,
      rightLabel: right,
      createdBy: params.userId,
      createdAt: new Date().toISOString(),
      active: true,
      votes: {},
    };

    const nextPolls = [...group.lightningPolls, newPoll];
    transaction.set(
      reference,
      {
        lightningPolls: nextPolls.map(serializeLightningPoll),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return newPoll;
  });

  return poll;
}

type VoteOnLightningPollParams = {
  groupId: string;
  pollId: string;
  userId: string;
  choice: LightningPollChoice;
};

export async function voteOnLightningPoll(params: VoteOnLightningPollParams): Promise<GroupLightningPoll> {
  const reference = doc(db, COLLECTION_NAME, params.groupId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) {
      throw new Error('Group not found.');
    }

    const polls = mapLightningPolls(snapshot.data()?.lightningPolls);
    const pollIndex = polls.findIndex((poll) => poll.id === params.pollId);
    if (pollIndex === -1) {
      throw new Error('Poll not found.');
    }

    const poll = polls[pollIndex];
    if (!poll.active) {
      throw new Error('This poll is closed.');
    }

    const updatedPoll: GroupLightningPoll = {
      ...poll,
      votes: {
        ...poll.votes,
        [params.userId]: params.choice,
      },
    };

    polls[pollIndex] = updatedPoll;

    transaction.set(
      reference,
      {
        lightningPolls: polls.map(serializeLightningPoll),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return updatedPoll;
  });
}

export async function closeLightningPoll(params: { groupId: string; pollId: string; userId: string }): Promise<GroupLightningPoll> {
  const reference = doc(db, COLLECTION_NAME, params.groupId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) {
      throw new Error('Group not found.');
    }

    const group = mapGroup(snapshot);
    if (group.ownerId !== params.userId) {
      throw new Error('Only group owners can close polls.');
    }

    const pollIndex = group.lightningPolls.findIndex((poll) => poll.id === params.pollId);
    if (pollIndex === -1) {
      throw new Error('Poll not found.');
    }

    const poll = group.lightningPolls[pollIndex];
    const updatedPoll: GroupLightningPoll = {
      ...poll,
      active: false,
    };

    const nextPolls = [...group.lightningPolls];
    nextPolls[pollIndex] = updatedPoll;

    transaction.set(
      reference,
      {
        lightningPolls: nextPolls.map(serializeLightningPoll),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return updatedPoll;
  });
}

export async function recordGroupNudge(params: { groupId: string; userId: string }): Promise<GroupLeaderControls> {
  const reference = doc(db, COLLECTION_NAME, params.groupId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) {
      throw new Error('Group not found.');
    }

    const group = mapGroup(snapshot);
    if (group.ownerId !== params.userId) {
      throw new Error('Only group owners can nudge members.');
    }

    const nextControls: GroupLeaderControls = {
      ...ensureLeaderControls(group.leaderControls),
      lastNudgeAt: new Date().toISOString(),
    };

    transaction.set(
      reference,
      {
        leaderControls: serializeLeaderControls(nextControls),
        updatedAt: nextControls.lastNudgeAt,
      },
      { merge: true },
    );

    return nextControls;
  });
}

type ToggleLeaderVoteParams = {
  groupId: string;
  userId: string;
  voteId: string;
  lock?: boolean;
};

export async function toggleScheduleVoteLock(params: ToggleLeaderVoteParams): Promise<GroupLeaderControls> {
  const reference = doc(db, COLLECTION_NAME, params.groupId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) {
      throw new Error('Group not found.');
    }

    const group = mapGroup(snapshot);
    if (group.ownerId !== params.userId) {
      throw new Error('Only group owners can lock votes.');
    }

    const controls = ensureLeaderControls(group.leaderControls);
    const lockedSet = new Set(controls.lockedScheduleVoteIds);
    const isLocked = lockedSet.has(params.voteId);
    const nextShouldLock = typeof params.lock === 'boolean' ? params.lock : !isLocked;

    if (nextShouldLock) {
      lockedSet.add(params.voteId);
    } else {
      lockedSet.delete(params.voteId);
    }

    const nextControls: GroupLeaderControls = {
      ...controls,
      lockedScheduleVoteIds: Array.from(lockedSet),
    };

    transaction.set(
      reference,
      {
        leaderControls: serializeLeaderControls(nextControls),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return nextControls;
  });
}

type ToggleHighlightParams = {
  groupId: string;
  userId: string;
  voteId: string;
  highlight?: boolean;
};

export async function toggleScheduleVoteHighlight(params: ToggleHighlightParams): Promise<GroupLeaderControls> {
  const reference = doc(db, COLLECTION_NAME, params.groupId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) {
      throw new Error('Group not found.');
    }

    const group = mapGroup(snapshot);
    if (group.ownerId !== params.userId) {
      throw new Error('Only group owners can highlight slots.');
    }

    const controls = ensureLeaderControls(group.leaderControls);
    const highlightedSet = new Set(controls.highlightedVoteIds);
    const isHighlighted = highlightedSet.has(params.voteId);
    const nextShouldHighlight = typeof params.highlight === 'boolean' ? params.highlight : !isHighlighted;

    if (nextShouldHighlight) {
      highlightedSet.add(params.voteId);
    } else {
      highlightedSet.delete(params.voteId);
    }

    const nextControls: GroupLeaderControls = {
      ...controls,
      highlightedVoteIds: Array.from(highlightedSet),
    };

    transaction.set(
      reference,
      {
        leaderControls: serializeLeaderControls(nextControls),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return nextControls;
  });
}
