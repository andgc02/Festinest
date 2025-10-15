import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_GROUP = {
  name: 'Coachella Squad',
  members: ['You', 'Alex', 'Sam'],
  schedule: [
    { id: 'fred', time: '1:00 PM', artist: 'Fred again..', votes: 3 },
    { id: 'peggy', time: '2:30 PM', artist: 'Peggy Gou', votes: 1 },
  ],
};

export function GroupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`🎉 ${MOCK_GROUP.name}`}</Text>
      <Text style={styles.subtitle}>{`Members: ${MOCK_GROUP.members.join(', ')}`}</Text>
      <FlatList
        data={MOCK_GROUP.schedule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.artist}>{item.artist}</Text>
            </View>
            <View style={styles.votePill}>
              <Text style={styles.voteText}>{`${item.votes} votes`}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Group Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Share QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040a1a',
    paddingHorizontal: 20,
    paddingTop: 48,
    gap: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
  },
  time: {
    color: '#94a3b8',
    fontSize: 14,
  },
  artist: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  votePill: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  voteText: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1e1b4b',
  },
  actionText: {
    color: '#a855f7',
    textAlign: 'center',
    fontWeight: '600',
  },
});
