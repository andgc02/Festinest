import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Button, FilterChip, Modal, Tabs, Toast } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';

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
    <View style={styles.root}>
      <View style={{ gap: 16 }}>
        <Text style={typographyRN.display}>{MOCK_GROUP.name}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {headerChips.map((chip) => (
            <FilterChip key={chip.label} label={chip.label} selected={chip.selected} />
          ))}
        </View>
      </View>

      <Tabs
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 12 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>{item.artist}</Text>
                <Text style={{ fontSize: 12, color: '#64748B' }}>
                  {item.time} {'\u2022'} {item.stage}
                </Text>
              </View>
              <View style={{ borderRadius: 9999, backgroundColor: 'rgba(90,103,216,0.20)', paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#5A67D8' }}>{`${item.votes} votes`}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={{ flex: 1, gap: 12, paddingVertical: 24 }}>
          {MOCK_GROUP.chat.map((message) => (
            <View key={message.id} style={{ gap: 4, borderRadius: 16, backgroundColor: Colors.surface, padding: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>
                {message.author}{' '}
                <Text style={{ fontSize: 12, fontWeight: '400', textTransform: 'uppercase', letterSpacing: 0.6, color: '#64748B' }}>
                  {message.timestamp}
                </Text>
              </Text>
              <Text style={typographyRN.body}>{message.message}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 'auto', flexDirection: 'row', gap: 12, paddingBottom: 40 }}>
        <Button variant="secondary" style={{ flex: 1 }} onPress={() => setToastVisible(true)}>
          Open Chat
        </Button>
        <Button variant="outline" style={{ flex: 1 }} onPress={() => setQrModalVisible(true)}>
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
        <View style={{ height: 160, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: '#334155' }}>
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
});
