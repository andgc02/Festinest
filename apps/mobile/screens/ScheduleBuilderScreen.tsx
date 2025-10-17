import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Button, Tabs, Toast } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';
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
  const [toastVisible, setToastVisible] = useState(false);

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

  const days = useMemo(() => Array.from(new Set(schedule.map((item) => item.day))), [schedule]);

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

  const handleSave = () => {
    setToastVisible(true);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color="#5A67D8" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={typographyRN.heading}>Your Schedule</Text>
        {days.length ? (
          <Text style={{ fontSize: 12, color: '#94A3B8' }}>{selectedDay ?? 'All days'}</Text>
        ) : null}
      </View>

      {days.length ? (
        <Tabs
          value={selectedDay ?? 'all'}
          onChange={(key) => setSelectedDay(key === 'all' ? null : key)}
          items={[{ key: 'all', label: 'All' }, ...days.map((day) => ({ key: day, label: day }))]}
          variant="underline"
        />
      ) : null}

      {error ? <Text style={{ marginTop: 16, fontSize: 12, color: '#E53E3E' }}>{error}</Text> : null}

      <FlatList
        data={filteredSchedule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 20, gap: 12 }}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 16,
              borderWidth: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderColor: item.selected ? 'rgba(90,103,216,0.60)' : 'rgba(30,41,59,0.60)',
              backgroundColor: item.selected ? 'rgba(90,103,216,0.10)' : 'rgba(15,23,42,0.70)',
            }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#94A3B8' }}>{item.day}</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#F1F5F9' }}>{item.artist}</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                {`${item.time} at ${item.stage}`}
              </Text>
            </View>
            <Button
              variant={item.selected ? 'secondary' : 'primary'}
              style={{ width: 96 }}
              onPress={() => toggleSelection(item.id)}>
              {item.selected ? 'Keep' : 'Add'}
            </Button>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 8, paddingTop: 80 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#F8FAFC' }}>Nothing scheduled yet</Text>
            <Text style={typographyRN.body}>Come back once the festival releases the set times.</Text>
          </View>
        }
      />

      {filteredSchedule.length ? (
        <Button style={{ marginBottom: 40, marginTop: 'auto' }} onPress={handleSave}>
          Save Schedule
        </Button>
      ) : null}

      <Toast
        visible={toastVisible}
        message="Schedule saved to your profile."
        type="success"
        onHide={() => setToastVisible(false)}
      />
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
});




