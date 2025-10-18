import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import type { User } from 'firebase/auth';

import { AvatarGroup, Button, Card, Input, Modal, Toast } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
import { useAuth } from '@/providers/AuthProvider';
import { createGroup, fetchUserGroups, GroupVoteUtils } from '@/services/groups';
import { Group } from '@/types/group';

export function GroupHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'info' | 'error' | 'success'>('info');

  const username = useMemo(() => deriveUsername(user), [user]);

  const showToast = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const loadGroups = useCallback(async () => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await fetchUserGroups(user.uid);
      setGroups(results);
    } catch (error) {
      console.warn('Failed to load groups', error);
      showToast('Unable to load groups. Pull to refresh and try again.', 'error');
      setGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = useCallback(async () => {
    if (!user) {
      showToast('Sign in to create a group.', 'error');
      return;
    }

    if (groups.length >= GroupVoteUtils.MAX_GROUPS_PER_USER) {
      showToast('You already have 5 active groups. Archive one before creating another.', 'error');
      return;
    }

    if (!newGroupName.trim()) {
      showToast('Give your group a name before continuing.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const group = await createGroup({
        name: newGroupName,
        ownerId: user.uid,
        ownerName: user.displayName ?? undefined,
        ownerUsername: username,
      });

      setGroups((prev) => [...prev, group]);
      setCreateModalVisible(false);
      setNewGroupName('');
      showToast('Group created!', 'success');
      router.push({ pathname: '/group/[groupId]', params: { groupId: group.id } });
    } catch (error) {
      console.warn('Failed to create group', error);
      showToast(error instanceof Error ? error.message : 'Could not create the group. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [user, groups.length, newGroupName, username, router, showToast]);

  const handleOpenGroup = useCallback(
    (groupId: string) => {
      router.push({ pathname: '/group/[groupId]', params: { groupId } });
    },
    [router],
  );

  const renderItem = ({ item }: ListRenderItemInfo<Group>) => {
    const ownerDisplay =
      item.ownerUsername && item.ownerUsername === username ? 'you' : item.ownerUsername || 'group owner';

    return (
      <Pressable
        onPress={() => handleOpenGroup(item.id)}
        key={item.id}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        <Card style={{ padding: 16, gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text }}>{item.name}</Text>
              <Text style={{ fontSize: 13, color: '#475569' }}>Owned by {ownerDisplay}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#5A67D8' }}>
                {item.members.length} member{item.members.length === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
          <AvatarGroup avatars={item.members} maxVisible={5} size={36} />
        </Card>
      </Pressable>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text, textAlign: 'center' }}>
        No groups yet
      </Text>
      <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center' }}>
        Create a group to start planning with friends. You can have up to five active groups.
      </Text>
      <Button style={{ marginTop: 12 }} onPress={() => setCreateModalVisible(true)}>
        Create your first group
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingState]}>
        <Text style={typographyRN.display}>Your Groups</Text>
        <ActivityIndicator style={{ marginTop: 16 }} size="large" color={Colors.primary} />
        <Text style={{ fontSize: 14, color: '#64748B', marginTop: 12 }}>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={typographyRN.display}>Your Groups</Text>
        <Button variant="secondary" onPress={() => setCreateModalVisible(true)}>
          New Group
        </Button>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 24, gap: 16, flexGrow: 1 }}
        renderItem={renderItem}
        ListEmptyComponent={!loading ? <EmptyState /> : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      />

      <Toast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />

      <Modal
        visible={createModalVisible}
        onDismiss={() => {
          setCreateModalVisible(false);
          setNewGroupName('');
        }}
        title="Create a Group"
        description="Pick a name that your friends will recognise. You can manage up to five active groups."
        primaryAction={{
          label: submitting ? 'Creating...' : 'Create group',
          onPress: handleCreateGroup,
          disabled: submitting,
        }}
        secondaryAction={{
          label: 'Cancel',
          variant: 'outline',
          onPress: () => {
            setCreateModalVisible(false);
            setNewGroupName('');
          },
        }}>
        <View style={{ gap: 12 }}>
          <Input
            value={newGroupName}
            onChangeText={setNewGroupName}
            placeholder="Weekend Warriors"
            autoFocus
            editable={!submitting}
          />
          <Text style={{ fontSize: 12, color: '#64748B' }}>
            {'Group IDs are generated as `{username}-{slugified-name}`. Avoid special characters for the cleanest link.'}
          </Text>
          <Text style={{ fontSize: 12, color: '#94A3B8' }}>
            {groups.length}/{GroupVoteUtils.MAX_GROUPS_PER_USER} active groups
          </Text>
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
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingState: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 48,
    gap: 16,
  },
});

function deriveUsername(user?: User | null) {
  if (!user) {
    return 'guest';
  }

  if (user.displayName) {
    return slugify(user.displayName);
  }

  if (user.email) {
    const emailHandle = user.email.split('@')[0] ?? 'user';
    return slugify(emailHandle);
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
