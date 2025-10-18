import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar, AvatarGroup, Button, FilterChip, Modal, Tabs, Toast } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useFadeInUp } from '@/hooks/useFadeInUp';
import { useAuth } from '@/providers/AuthProvider';
import { fetchGroupById, toggleGroupVote, GroupVoteUtils } from '@/services/groups';
import { Group, GroupChatMessage, GroupScheduleVote } from '@/types/group';

type TabKey = 'schedule' | 'chat';

export function GroupScreen() {
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
    void loadGroup();
  }, [loadGroup]);

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

  const handleOpenChat = useCallback(() => {
    showToast('Group chat launch is coming soon.');
  }, [showToast]);

  const handleCloseToast = useCallback(() => {
    setToastVisible(false);
  }, []);

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

  return (
    <View style={styles.root}>
      <View style={{ gap: 16 }}>
        <Text style={typographyRN.display}>{group.name}</Text>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 14, color: '#475569' }}>Owned by {ownerDisplay}</Text>
          <Text style={{ fontSize: 12, color: '#64748B' }}>
            {group.members.length} member{group.members.length === 1 ? '' : 's'}
          </Text>
        </View>
        <AvatarGroup avatars={group.members} maxVisible={4} size={40} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {headerChips.map((chip, index) => (
            <FilterChip key={`${chip.label}-${index}`} label={chip.label} selected={chip.selected} animationDelay={index * 80} />
          ))}
        </View>
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>Members</Text>
          <View style={{ gap: 8 }}>
            {group.members.map((member) => (
              <Text key={member.id} style={{ fontSize: 13, color: '#475569' }}>
                {member.name}
                {member.id === group.ownerId ? ' (owner)' : ''}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <Tabs
        value={selectedTab}
        onChange={(key) => setSelectedTab(key as TabKey)}
        items={[
          { key: 'schedule', label: 'Schedule Votes', count: group.scheduleVotes.length },
          { key: 'chat', label: 'Group Chat', count: group.chatPreview.length },
        ]}
      />

      {selectedTab === 'schedule' ? (
        <FlatList
          data={group.scheduleVotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 20, gap: 12, flexGrow: 1 }}
          renderItem={({ item, index }) => (
            <ScheduleRow
              item={item}
              index={index}
              currentUserId={user?.uid}
              onToggleVote={handleToggleVote}
              busy={Boolean(voteBusy[item.id])}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No votes yet"
              description="Once your crew starts voting on sets, the top picks will land here."
            />
          }
        />
      ) : (
        <View style={{ flex: 1, gap: 12, paddingVertical: 24 }}>
          {group.chatPreview.length === 0 ? (
            <EmptyState
              title="Chat is quiet"
              description="Share the QR invite to get friends talking. Chat history will appear here."
            />
          ) : (
            group.chatPreview.map((message, index) => (
              <ChatPreview key={message.id} message={message} member={memberMap.get(message.authorId)} index={index} />
            ))
          )}
        </View>
      )}

      <View style={{ marginTop: 'auto', flexDirection: 'row', gap: 12, paddingBottom: 40 }}>
        <Button variant="secondary" style={{ flex: 1 }} onPress={handleOpenChat}>
          Open Chat
        </Button>
        <Button variant="outline" style={{ flex: 1 }} onPress={() => setQrModalVisible(true)}>
          Share QR
        </Button>
      </View>

      <Toast visible={toastVisible} message={toastMessage} type={toastType} onHide={handleCloseToast} />

      <Modal
        visible={qrModalVisible}
        onDismiss={() => setQrModalVisible(false)}
        title="Share Group QR"
        description="Show this QR code to invite new friends to the squad."
        primaryAction={{
          label: 'Copy Link',
          onPress: () => {
            setQrModalVisible(false);
            showToast('Invite link copied (coming soon).', 'info');
          },
        }}
        secondaryAction={{
          label: 'Close',
          variant: 'outline',
          onPress: () => setQrModalVisible(false),
        }}>
        <View
          style={{
            height: 160,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: '#334155',
          }}>
          <Text style={{ fontSize: 14, color: '#94A3B8' }}>QR preview placeholder</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 14,
  },
  loadingState: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  chatCard: {
    borderRadius: 16,
    backgroundColor: Colors.surface,
    padding: 16,
    gap: 8,
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
        accessibilityRole='button'
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

type ChatPreviewProps = {
  message: GroupChatMessage;
  member: Group['members'][number] | undefined;
  index: number;
};

function ChatPreview({ message, member, index }: ChatPreviewProps) {
  const animatedStyle = useFadeInUp({ delay: index * 80 });
  const displayName = member?.name ?? message.authorName;

  return (
    <Animated.View style={[styles.chatCard, animatedStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <Avatar name={displayName} size={36} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>
            {displayName}{' '}
            <Text style={{ fontSize: 12, fontWeight: '400', textTransform: 'uppercase', letterSpacing: 0.6, color: '#475569' }}>
              {message.timestamp}
            </Text>
          </Text>
          <Text style={typographyRN.body}>{message.message}</Text>
        </View>
      </View>
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
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'user';
}
