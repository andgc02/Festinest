import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const MOCK_FESTIVALS = [
  {
    id: 'coachella-2025',
    name: 'Coachella 2025',
    location: 'Indio, CA',
    dates: 'Apr 11–13',
    artists: 180,
  },
  {
    id: 'lollapalooza-2025',
    name: 'Lollapalooza 2025',
    location: 'Chicago, IL',
    dates: 'Aug 1–4',
    artists: 120,
  },
];

export function FestivalListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Festivals</Text>
      <View style={styles.filters}>
        <TextInput style={styles.search} placeholder="Search festivals" placeholderTextColor="#6b7280" />
        <View style={styles.filterRow}>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>Genre</Text>
          </Pressable>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>Date</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={MOCK_FESTIVALS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/festival/[festivalId]', params: { festivalId: item.id } })}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>🎫</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{`${item.location} • ${item.dates}`}</Text>
              <Text style={styles.cardMeta}>{`${item.artists} artists`}</Text>
            </View>
            <Text style={styles.cardChevron}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050914',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 24,
  },
  filters: {
    gap: 12,
    marginBottom: 20,
  },
  search: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f1f5f9',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  cardMeta: {
    color: '#a855f7',
    fontSize: 13,
  },
  cardChevron: {
    color: '#475569',
    fontSize: 28,
    fontWeight: '300',
  },
});
