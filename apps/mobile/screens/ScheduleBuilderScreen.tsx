import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { Button, Tabs, Toast } from '@/components/ui';
import { typography } from '@/constants/theme';
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
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#5A67D8" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950 px-5 pt-16">
      <View className="flex-row items-center justify-between">
        <Text className={typography.heading}>Your Schedule</Text>
        {days.length ? (
          <Text className="text-sm text-slate-400">{selectedDay ?? 'All days'}</Text>
        ) : null}
      </View>

      {days.length ? (
        <Tabs
          className="mt-4"
          value={selectedDay ?? 'all'}
          onChange={(key) => setSelectedDay(key === 'all' ? null : key)}
          items={[{ key: 'all', label: 'All' }, ...days.map((day) => ({ key: day, label: day }))]}
          variant="underline"
        />
      ) : null}

      {error ? <Text className="mt-4 text-sm text-error">{error}</Text> : null}

      <FlatList
        data={filteredSchedule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 20, gap: 12 }}
        renderItem={({ item }) => (
          <View
            className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
              item.selected ? 'border-primary/60 bg-primary/10' : 'border-slate-800/60 bg-slate-900/70'
            }`}>
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.day}</Text>
              <Text className="text-base font-semibold text-slate-100">{item.artist}</Text>
              <Text className="text-xs text-slate-400">
                {`${item.time} at ${item.stage}`}
              </Text>
            </View>
            <Button
              variant={item.selected ? 'secondary' : 'primary'}
              className="w-24"
              onPress={() => toggleSelection(item.id)}>
              {item.selected ? 'Keep' : 'Add'}
            </Button>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center gap-2 pt-20">
            <Text className="text-lg font-semibold text-slate-50">Nothing scheduled yet</Text>
            <Text className={typography.body}>Come back once the festival releases the set times.</Text>
          </View>
        }
      />

      {filteredSchedule.length ? (
        <Button className="mb-10 mt-auto" onPress={handleSave}>
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




