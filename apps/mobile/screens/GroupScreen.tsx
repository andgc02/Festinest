import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Button, FilterChip, Modal, Tabs, Toast } from '@/components/ui';
import { typography } from '@/constants/theme';

const MOCK_GROUP = {
  name: 'Coachella Squad',
  members: ['You', 'Alex', 'Sam'],
  schedule: [
    { id: 'fred', time: '1:00 PM', artist: 'Fred again..', votes: 3, stage: 'Main' },
    { id: 'peggy', time: '2:30 PM', artist: 'Peggy Gou', votes: 1, stage: 'Sahara' },
  ],
  chat: [
    { id: '1', author: 'Alex', message: 'Meet at the main gate at noon?', timestamp: '11:45 AM' },
    { id: '2', author: 'Sam', message: 'Bring water and sunscreen!', timestamp: '11:47 AM' },
  ],
};

type TabKey = 'schedule' | 'chat';

export function GroupScreen() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('schedule');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const headerChips = useMemo(
    () => [
      { label: `${MOCK_GROUP.members.length} members`, selected: true },
      { label: 'Votes on 2 sets', selected: false },
    ],
    [],
  );

  return (
    <View className="flex-1 bg-slate-950 px-5 pt-14">
      <View className="gap-4">
        <Text className={typography.display}>{MOCK_GROUP.name}</Text>
        <View className="flex-row gap-2">
          {headerChips.map((chip) => (
            <FilterChip key={chip.label} label={chip.label} selected={chip.selected} />
          ))}
        </View>
      </View>

      <Tabs
        className="mt-6"
        value={selectedTab}
        onChange={(key) => setSelectedTab(key as TabKey)}
        items={[
          { key: 'schedule', label: 'Schedule Votes', count: MOCK_GROUP.schedule.length },
          { key: 'chat', label: 'Group Chat', count: MOCK_GROUP.chat.length },
        ]}
      />

      {selectedTab === 'schedule' ? (
        <FlatList
          data={MOCK_GROUP.schedule}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 20, gap: 12 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between rounded-2xl bg-slate-900/70 px-4 py-3">
              <View>
                <Text className="text-base font-semibold text-slate-100">{item.artist}</Text>
                <Text className="text-xs text-slate-400">
                  {item.time} • {item.stage}
                </Text>
              </View>
              <View className="rounded-full bg-primary/20 px-3 py-1">
                <Text className="text-xs font-semibold text-primary">{`${item.votes} votes`}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View className="flex-1 gap-3 py-6">
          {MOCK_GROUP.chat.map((message) => (
            <View key={message.id} className="gap-1 rounded-2xl bg-slate-900/70 p-4">
              <Text className="text-sm font-semibold text-slate-100">
                {message.author}{' '}
                <Text className="text-xs font-normal uppercase tracking-wide text-slate-500">
                  {message.timestamp}
                </Text>
              </Text>
              <Text className={typography.body}>{message.message}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="mt-auto flex-row gap-3 pb-10">
        <Button variant="secondary" className="flex-1" onPress={() => setToastVisible(true)}>
          Open Chat
        </Button>
        <Button variant="outline" className="flex-1" onPress={() => setQrModalVisible(true)}>
          Share QR
        </Button>
      </View>

      <Toast
        visible={toastVisible}
        message="Group chat launch is coming soon."
        type="info"
        onHide={() => setToastVisible(false)}
      />

      <Modal
        visible={qrModalVisible}
        onDismiss={() => setQrModalVisible(false)}
        title="Share Group QR"
        description="Show this QR code to invite new friends to the squad."
        primaryAction={{
          label: 'Copy Link',
          onPress: () => {
            setQrModalVisible(false);
            setToastVisible(true);
          },
        }}
        secondaryAction={{
          label: 'Close',
          variant: 'outline',
          onPress: () => setQrModalVisible(false),
        }}>
        <View className="h-40 items-center justify-center rounded-2xl border border-dashed border-slate-700">
          <Text className="text-sm text-slate-400">QR preview placeholder</Text>
        </View>
      </Modal>
    </View>
  );
}
