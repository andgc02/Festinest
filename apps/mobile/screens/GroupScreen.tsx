import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { Avatar, AvatarGroup, Button, FilterChip, Modal, Tabs, Toast } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useFadeInUp } from '@/hooks/useFadeInUp';
import { useAuth } from '@/providers/AuthProvider';
import {
  fetchGroupById,
  toggleGroupVote,
  GroupVoteUtils,
  deleteGroup,
  leaveGroup,
  listenToGroup,
  listenToGroupChat,
  sendGroupChatMessage,
} from '@/services/groups';
import { Group, GroupChatMessage, GroupScheduleVote } from '@/types/group';

type TabKey = 'schedule' | 'chat';

export function GroupScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const resolvedGroupId = groupId ?? 'demo-coachella-squad';

  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey>('schedule');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');
  const [voteBusy, setVoteBusy] = useState<Record<string, boolean>>({});
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);

  const [chatMessages, setChatMessages] = useState<GroupChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatListRef = useRef<FlatList<GroupChatMessage> | null>(null);

  const loadGroup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGroupById(resolvedGroupId);
      setGroup(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [resolvedGroupId]);

  useEffect(() => {
    setLoading(true);
    setChatLoading(true);
    const unsubscribeGroup = listenToGroup(
      resolvedGroupId,
      (nextGroup) => {
        setGroup(nextGroup);
        setLoading(false);
        setError(nextGroup ? null : 'Group not found or removed.');
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    const unsubscribeChat = listenToGroupChat(
      resolvedGroupId,
      (messages) => {
        setChatMessages(messages);
        setChatError(null);
        setChatLoading(false);
        requestAnimationFrame(() => chatListRef.current?.scrollToEnd({ animated: true }));
      },
      (err) => {
        setChatError(err.message);
        setChatLoading(false);
      },
      { limit: 200 },
    );

    return () => {
      unsubscribeGroup();
      unsubscribeChat();
    };
  }, [resolvedGroupId]);

  const headerChips = useMemo(() => {
    const membersCount = group?.members.length ?? 0;
    const voteCount = group ? group.scheduleVotes.filter((vote) => vote.voters.length > 0).length : 0;

    return [
      { label: `${membersCount} member${membersCount === 1 ? '' : 's'}`, selected: true },
      {
        label: voteCount > 0 ? `Votes on ${voteCount} set${voteCount === 1 ? '' : 's'}` : 'No votes yet',
        selected: voteCount > 0,
      },
    ];
  }, [group]);

  const memberMap = useMemo(() => {
    if (!group) {
      return new Map<string, Group['members'][number]>();
    }
    return new Map(group.members.map((member) => [member.id, member] as const));
  }, [group]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const handleToggleVote = useCallback(
    async (slotId: string) => {
      if (!group || !user) {
        showToast('Sign in to vote on the schedule.', 'error');
        return;
      }

      setVoteBusy((prev) => ({ ...prev, [slotId]: true }));

      const previous = group;
      const optimistic = GroupVoteUtils.applyVoteState(group, slotId, user.uid);
      setGroup(optimistic);

      try {
        const updated = await toggleGroupVote(group, slotId, user.uid);
        setGroup(updated);
      } catch (err) {
        console.warn('Failed to update vote', err);
        setGroup(previous);
        showToast('Could not update your vote. Please try again.', 'error');
      } finally {
        setVoteBusy((prev) => {
          const next = { ...prev };
          delete next[slotId];
          return next;
        });
      }
    },
    [group, user, showToast],
  );

  const handleSendChatMessage = useCallback(async () => {
    const trimmed = chatDraft.trim();
    if (!trimmed) {
      return;
    }
    if (!group || !user) {
      showToast('Sign in to chat with your group.', 'error');
      return;
    }

    setSendingChat(true);
    try {
      await sendGroupChatMessage({
        groupId: group.id,
        authorId: user.uid,
        authorName: deriveUsername(user),
        message: trimmed,
      });
      setChatDraft('');
    } catch (err) {
      console.warn('Failed to send chat message', err);
      showToast('Could not send your message. Please try again.', 'error');
    } finally {
      setSendingChat(false);
    }
  }, [chatDraft, group, user, showToast]);

  const handleCloseToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const handleDeletePress = useCallback(() => {
    if (deleteBusy) {
      return;
    }
    if (!group || !user) {
      showToast('Sign in as owner to delete this group.', 'error');
      return;
    }
    if (user.uid !== group.ownerId) {
      showToast('Only the owner can delete this group.', 'error');
      return;
    }
    Alert.alert('Delete group?', `This will remove ${group.name} for everyone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleteBusy(true);
          try {
            await deleteGroup(group.id);
            showToast('Group deleted.', 'info');
            router.replace('/(tabs)/groups');
          } catch (e) {
            showToast('Failed to delete group.', 'error');
          } finally {
            setDeleteBusy(false);
          }
        },
      },
    ]);
  }, [deleteBusy, group, user, showToast, router]);

  const handleLeavePress = useCallback(() => {
    if (leaveBusy) {
      return;
    }
    if (!group || !user) {
      showToast('Sign in to leave this group.', 'error');
      return;
    }
    if (user.uid === group.ownerId) {
      showToast('Group owners must delete the group instead.', 'error');
      return;
    }
    Alert.alert('Leave group?', 'You will lose access to the shared schedule votes.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setLeaveBusy(true);
          try {
            await leaveGroup(group.id, user.uid);
            showToast('You left the group.', 'info');
            router.replace('/(tabs)/groups');
          } catch (e) {
            showToast('Failed to leave the group.', 'error');
          } finally {
            setLeaveBusy(false);
          }
        },
      },
    ]);
  }, [leaveBusy, group, user, showToast, router]);

  const renderScheduleItem = useCallback(
    ({ item, index }: ListRenderItemInfo<GroupScheduleVote>) => (
      <ScheduleRow
        key={item.id}
        item={item}
        index={index}
        currentUserId={user?.uid}
        onToggleVote={handleToggleVote}
        busy={voteBusy[item.id]}
      />
    ),
    [handleToggleVote, user?.uid, voteBusy],
  );

  const renderChatItem = useCallback(
    ({ item }: ListRenderItemInfo<GroupChatMessage>) => {
      const isCurrentUser = item.authorId === user?.uid;
      return (
        <View
          key={item.id}
          style={[
            styles.chatBubble,
            isCurrentUser ? styles.chatBubbleOwn : styles.chatBubbleOther,
          ]}>
          <Text style={[styles.chatAuthor, isCurrentUser && styles.chatAuthorOwn]}>{item.authorName}</Text>
          <Text style={styles.chatText}>{item.message}</Text>
          <Text style={styles.chatTimestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      );
    },
    [user?.uid],
  );

  const headerFade = useFadeInUp({ distance: 12 });
  const chipFade = useFadeInUp({ delay: 120 });

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingState]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: '#475569' }}>Loading your group...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.root, styles.loadingState]}>
        <Text style={{ fontSize: 16, color: Colors.error, textAlign: 'center' }}>
          {error ?? 'Group could not be loaded.'}
        </Text>
        <Button variant="outline" style={{ marginTop: 20 }} onPress={() => void loadGroup()}>
          Retry
        </Button>
      </View>
    );
  }

  const currentUsername = deriveUsername(user);
  const ownerDisplay =
    group.ownerUsername && group.ownerUsername === currentUsername ? 'you' : group.ownerUsername || 'group owner';
  const memberNames = Array.isArray(group?.members) ? group.members : [];
  const memberAvatars = memberNames.map((member) => ({
    id: member.id,
    name: member.name,
    imageUri: member.avatarUrl,
  }));

  const scheduleContent = (
    <Animated.FlatList
      data={group.scheduleVotes}
      keyExtractor={(item) => item.id}
      renderItem={renderScheduleItem}
      contentContainerStyle={{ gap: 12 }}
      ListEmptyComponent={
        <EmptyState
          title="No schedule votes yet"
          description="Add artists while you plan and your group can vote here."
        />
      }
    />
  );

  const chatContent = (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      enabled>
      <View style={styles.chatContainer}>
        {chatLoading ? (
          <View style={styles.chatLoading}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.chatLoadingText}>Loading messages...</Text>
          </View>
        ) : chatError ? (
          <View style={styles.chatLoading}>
            <Text style={styles.chatErrorText}>{chatError}</Text>
            <Button variant="outline" onPress={() => setChatLoading(true)}>
              Retry
            </Button>
          </View>
        ) : (
          <FlatList
            ref={chatListRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.chatListContent}
            onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
        <View style={styles.chatInputRow}>
          <TextInput
            value={chatDraft}
            onChangeText={setChatDraft}
            placeholder="Share a plan or drop a link"
            placeholderTextColor="#94A3B8"
            style={styles.chatInput}
            multiline
            onFocus={() => requestAnimationFrame(() => chatListRef.current?.scrollToEnd({ animated: true }))}
          />
          <Button
            size="md"
            style={styles.chatSendButton}
            onPress={handleSendChatMessage}
            disabled={sendingChat || !chatDraft.trim().length}
            loading={sendingChat}>
            Send
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.header, headerFade]}>
        <View style={styles.titleRow}>
          <Text style={typographyRN.displaySm}>{group.name}</Text>
          <FilterChip label="Group" selected animationDelay={0} />
        </View>
        <View style={styles.metaRow}>
          <AvatarGroup avatars={memberAvatars} size={36} maxVisible={3} />
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 13, color: '#475569' }}>
              Owned by {ownerDisplay.replace(/(^\w{1})|(\s+\w{1})/g, (match) => match.toUpperCase())}
            </Text>
            <Text style={{ fontSize: 13, color: '#475569' }}>
              {memberNames.length} member{memberNames.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
        <Animated.View style={[styles.chipRow, chipFade]}>
          {headerChips.map((chip, index) => (
            <FilterChip key={chip.label} label={chip.label} selected={chip.selected} animationDelay={index * 80} />
          ))}
        </Animated.View>
        <View style={styles.actionsRow}>
          <Button
            size="md"
            style={styles.actionButton}
            variant="secondary"
            onPress={() => setQrModalVisible(true)}>
            Invite
          </Button>
          <Button
            size="md"
            style={styles.actionButton}
            variant="outline"
            onPress={handleLeavePress}
            disabled={leaveBusy}>
            Leave
          </Button>
          <Button
            size="md"
            style={styles.actionButton}
            variant="outline"
            onPress={handleDeletePress}
            disabled={deleteBusy}>
            Delete
          </Button>
        </View>
      </Animated.View>

      <Tabs
        value={selectedTab}
        onChange={(key) => setSelectedTab(key as TabKey)}
        items={[
          { key: 'schedule', label: 'Shared Schedule' },
          { key: 'chat', label: 'Chat' },
        ]}
        variant="underline"
      />

      <View style={styles.body}>{selectedTab === 'schedule' ? scheduleContent : chatContent}</View>

      <Toast visible={toastVisible} message={toastMessage} type={toastType} onHide={handleCloseToast} />

      <Modal visible={qrModalVisible} onClose={() => setQrModalVisible(false)} title="Invite to this group">
        <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
          Share this QR code or link with friends you trust. We’ll add permissions and temporary invites in an upcoming
          release.
        </Text>
        <View style={styles.qrPlaceholder}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>QR preview coming soon</Text>
        </View>
        <Button onPress={() => setQrModalVisible(false)}>Close</Button>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    gap: 16,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    minWidth: 96,
  },
  body: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  qrPlaceholder: {
    marginVertical: 24,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    padding: 32,
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    padding: 16,
    gap: 12,
  },
  chatLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  chatLoadingText: { fontSize: 13, color: '#475569' },
  chatErrorText: { fontSize: 13, color: Colors.error, textAlign: 'center' },
  chatListContent: { gap: 12, paddingBottom: 12 },
  chatBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '85%',
    backgroundColor: '#F1F5F9',
  },
  chatBubbleOwn: {
    alignSelf: 'flex-end',
    backgroundColor: '#E0E7FF',
  },
  chatBubbleOther: {
    alignSelf: 'flex-start',
  },
  chatAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  chatAuthorOwn: {
    color: '#4338CA',
  },
  chatText: {
    fontSize: 14,
    color: Colors.text,
  },
  chatTimestamp: {
    marginTop: 6,
    fontSize: 10,
    color: '#94A3B8',
  },
  chatInputRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  chatSendButton: {
    alignSelf: 'center',
  },
});

type ScheduleRowProps = {
  item: GroupScheduleVote;
  index: number;
  currentUserId?: string;
  onToggleVote: (slotId: string) => void;
  busy?: boolean;
};

function ScheduleRow({ item, index, currentUserId, onToggleVote, busy = false }: ScheduleRowProps) {
  const animatedStyle = useFadeInUp({ delay: index * 70 });
  const votesCount = item.voters.length;
  const hasVoted = currentUserId ? item.voters.includes(currentUserId) : false;
  const subtitle = [item.day, item.time, item.stage].filter(Boolean).join(' \u2022 ');

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: hasVoted, busy }}
        onPress={() => onToggleVote(item.id)}
        disabled={busy}
        style={{ opacity: busy ? 0.6 : 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 16,
            backgroundColor: hasVoted ? '#EEF2FF' : Colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: hasVoted ? 1 : 0,
            borderColor: hasVoted ? Colors.primary : 'transparent',
          }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>{item.artistName}</Text>
            <Text style={{ fontSize: 12, color: '#475569' }}>{subtitle || 'Details coming soon'}</Text>
          </View>
          <View
            style={{
              borderRadius: 9999,
              backgroundColor: hasVoted ? Colors.primary : '#E2E8F0',
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: hasVoted ? '#FFFFFF' : '#1A202C' }}>
              {votesCount} vote{votesCount === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
};

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 48, paddingHorizontal: 32 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text, textAlign: 'center' }}>{title}</Text>
      <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center' }}>{description}</Text>
    </View>
  );
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (isToday) {
    return timeFormatter.format(date);
  }
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

function deriveUsername(user?: { uid: string; displayName: string | null; email: string | null }) {
  if (!user) {
    return 'guest';
  }

  if (user.displayName) {
    return slugify(user.displayName);
  }

  if (user.email) {
    const handle = user.email.split('@')[0] ?? 'user';
    return slugify(handle);
  }

  return slugify(user.uid.slice(0, 8));
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'user'
  );
}


