import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_SCHEDULE = [
  { id: 'fred', time: '1:00 PM', artist: 'Fred again..', stage: 'Main Stage', selected: true },
  { id: 'peggy', time: '2:30 PM', artist: 'Peggy Gou', stage: 'Sahara', selected: false },
  { id: 'kaytra', time: '4:00 PM', artist: 'Kaytranada', stage: 'Outdoor', selected: true },
];

export function ScheduleBuilderScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Schedule</Text>
        <TouchableOpacity>
          <Text style={styles.switchText}>Day ▾</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_SCHEDULE}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, item.selected && styles.rowSelected]}>
            <View>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.artist}>{item.artist}</Text>
              <Text style={styles.stage}>{item.stage}</Text>
            </View>
            <TouchableOpacity style={styles.toggle}>
              <Text style={styles.toggleText}>{item.selected ? '✔' : '+'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040a1a',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '600',
  },
  switchText: {
    color: '#38bdf8',
    fontSize: 16,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
  },
  rowSelected: {
    borderWidth: 1,
    borderColor: '#22d3ee',
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
  stage: {
    color: '#64748b',
    fontSize: 14,
  },
  toggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
});
