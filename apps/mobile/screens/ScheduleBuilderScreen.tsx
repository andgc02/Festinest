import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fetchFestivalById } from '@/services/festivals';
import { FestivalScheduleEntry } from '@/types/festival';

type ScheduleItem = FestivalScheduleEntry & {
  id: string;
  selected: boolean;
};

export function ScheduleBuilderScreen() {
  const { festivalId } = useLocalSearchParams<{ festivalId?: string }>();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!festivalId) {
        setError('Festival not found.');
        setLoading(false);
        return;
      }

      try {
        const festival = await fetchFestivalById(festivalId);
        if (!festival?.schedule?.length) {
          setSchedule([]);
          setSelectedDay(null);
          setError('No schedule available yet.');
          return;
        }

        const items: ScheduleItem[] = festival.schedule.map((entry, index) => ({
          ...entry,
          id: `${entry.day}-${entry.artist}-${index}`,
          selected: true,
        }));

        setSchedule(items);
        setSelectedDay(items[0]?.day ?? null);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void loadSchedule();
  }, [festivalId]);

  const days = useMemo(() => {
    return Array.from(new Set(schedule.map((item) => item.day)));
  }, [schedule]);

  const filteredSchedule = useMemo(() => {
    if (!selectedDay) {
      return schedule;
    }
    return schedule.filter((item) => item.day === selectedDay);
  }, [schedule, selectedDay]);

  const toggleSelection = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, selected: !item.selected };
        }
        return item;
      }),
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Schedule</Text>
        {days.length ? (
          <TouchableOpacity onPress={() => cycleDay(days, selectedDay, setSelectedDay)}>
            <Text style={styles.switchText}>{selectedDay ?? 'All days'} ▾</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={filteredSchedule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, item.selected && styles.rowSelected]}>
            <View>
              <Text style={styles.day}>{item.day}</Text>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.artist}>{item.artist}</Text>
              <Text style={styles.stage}>{item.stage}</Text>
            </View>
            <TouchableOpacity style={[styles.toggle, item.selected && styles.toggleSelected]} onPress={() => toggleSelection(item.id)}>
              <Text style={styles.toggleText}>{item.selected ? '✔' : '+'}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nothing scheduled yet</Text>
            <Text style={styles.emptyStateSubtitle}>Come back once the festival releases the set times.</Text>
          </View>
        }
      />
      {filteredSchedule.length ? (
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function cycleDay(days: string[], current: string | null, setter: (day: string | null) => void) {
  if (!days.length) {
    return;
  }

  if (current === null) {
    setter(days[0]);
    return;
  }

  const currentIndex = days.indexOf(current);
  const nextIndex = (currentIndex + 1) % days.length;
  setter(days[nextIndex]);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040a1a',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  loader: {
    flex: 1,
    backgroundColor: '#040a1a',
    alignItems: 'center',
    justifyContent: 'center',
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
  errorText: {
    color: '#f87171',
    marginBottom: 12,
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
  day: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
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
  toggleSelected: {
    backgroundColor: '#4f46e5',
  },
  toggleText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyStateTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    color: '#94a3b8',
    textAlign: 'center',
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
