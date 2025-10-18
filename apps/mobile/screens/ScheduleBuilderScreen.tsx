import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Button, Tabs, Toast } from '@/components/ui';
import { typographyRN } from '@/constants/theme';
import { Colors } from '@/styles/colors';
import { Spacing } from '@/styles/spacing';

import { fetchFestivalById } from '@/services/festivals';
import { Festival, FestivalLineupEntry, FestivalScheduleEntry } from '@/types/festival';
import { useArtistsCatalog } from '@/hooks/useArtistsCatalog';
import { Artist } from '@/types/artist';


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
  const { byId: artistsById } = useArtistsCatalog();
  const { width: viewportWidth } = useWindowDimensions();
  const [layoutMode, setLayoutMode] = useState<'scroll' | 'fit'>('scroll');

  useEffect(() => {
    const loadSchedule = async () => {
      if (!festivalId) {
        setError('Festival not found.');
        setLoading(false);
        return;
      }

      try {
        const festival = await fetchFestivalById(festivalId);
        const scheduleEntries = festival ? deriveFestivalSchedule(festival) : [];
        if (!scheduleEntries.length) {
          setSchedule([]);
          setSelectedDay(null);
          setError('No schedule available yet.');
          return;
        }

        const items: ScheduleItem[] = scheduleEntries.map((entry, index) => {
          const label = entry.artistName ?? entry.artist ?? entry.artistId ?? 'Artist TBA';
          return {
            ...entry,
            id: `${entry.day}-${entry.artistId ?? entry.artist ?? index}-${index}`,
            artistName: entry.artistName ?? entry.artist ?? entry.artistId,
            artist: label,
            selected: true,
          };
        });

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

  const daySchedules = useMemo(() => buildDaySchedules(schedule), [schedule]);
  const dayKeys = useMemo(() => daySchedules.map((day) => day.day), [daySchedules]);
  const activeDayKey = useMemo(() => {
    if (!dayKeys.length) {
      return null;
    }
    if (selectedDay && dayKeys.includes(selectedDay)) {
      return selectedDay;
    }
    return dayKeys[0] ?? null;
  }, [dayKeys, selectedDay]);
  const activeDay = useMemo(
    () => (activeDayKey ? daySchedules.find((day) => day.day === activeDayKey) ?? null : null),
    [activeDayKey, daySchedules],
  );
  const conflictDetection = useMemo(() => computeConflicts(schedule), [schedule]);
  const scheduleById = useMemo(() => new Map(schedule.map((item) => [item.id, item])), [schedule]);
  const activeConflictCount = useMemo(() => {
    if (!activeDay) {
      return 0;
    }
    let count = 0;
    for (const stage of activeDay.stages) {
      const blocks = activeDay.blocksByStage.get(stage) ?? [];
      for (const block of blocks) {
        if (conflictDetection.ids.has(block.item.id)) {
          count += 1;
        }
      }
    }
    return count;
  }, [activeDay, conflictDetection]);

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
      <View style={styles.headerRow}>
        <Text style={typographyRN.heading}>Your Schedule</Text>
        {activeDayKey ? (
          <Text style={{ fontSize: 12, color: '#94A3B8' }}>{activeDayKey}</Text>
        ) : null}
      </View>

      <View style={styles.tabsRow}>
        <Tabs value={activeDayKey!} onChange={(key) => setSelectedDay(key)} items={dayKeys.map((day) => ({ key: day, label: day }))} variant="underline" />
      </View>
      {/* Layout toggle */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
        <Pressable onPress={() => setLayoutMode('fit')} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: layoutMode==='fit' ? '#5A67D8' : '#E2E8F0', backgroundColor: layoutMode==='fit' ? '#EEF2FF' : '#FFFFFF' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: layoutMode==='fit' ? '#5A67D8' : '#475569' }}>Auto Fit</Text>
        </Pressable>
        <Pressable onPress={() => setLayoutMode('scroll')} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: layoutMode==='scroll' ? '#5A67D8' : '#E2E8F0', backgroundColor: layoutMode==='scroll' ? '#EEF2FF' : '#FFFFFF' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: layoutMode==='scroll' ? '#5A67D8' : '#475569' }}>Scroll</Text>
        </Pressable>
      </View>

      {error ? <Text style={{ marginTop: 4, fontSize: 10, color: '#E53E3E' }}>{error}</Text> : null}
      <View style={styles.gridWrapper}>
        {activeDay ? (
          <ScheduleDayGrid
            day={activeDay}
            viewportWidth={viewportWidth}
            layoutMode={layoutMode}
            toggleSelection={toggleSelection}
            conflictDetection={conflictDetection}
            scheduleById={scheduleById}
            artistsById={artistsById}
            />
        ) : (
          <View style={{ alignItems: 'center', gap: 8, paddingTop: 80 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A202C' }}>Nothing scheduled yet</Text>
            <Text style={typographyRN.body}>Come back once the festival releases the set times.</Text>
          </View>
        )}
      </View>

      {activeDay ? (
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

type StageBlock = {
  item: ScheduleItem;
  range: TimeRange;
};

type TimeLabel = {
  minute: number;
  label: string;
};

type GridLine = {
  minute: number;
  major: boolean;
};

type DaySchedule = {
  day: string;
  stages: string[];
  gridStart: number;
  gridEnd: number;
  blocksByStage: Map<string, StageBlock[]>;
  timeLabels: TimeLabel[];
  gridLines: GridLine[];
};

type ScheduleDayGridProps = {
  day: DaySchedule;
  viewportWidth: number;
  layoutMode: 'scroll' | 'fit';
  toggleSelection: (id: string) => void;
  conflictDetection: ConflictDetection;
  scheduleById: Map<string, ScheduleItem>;
  artistsById: Map<string, Artist>;
};

type StageColumnProps = {
  blocks: StageBlock[];
  columnWidth: number;
  gridStart: number;
  minuteHeight: number;
  height: number;
  offsetLeft: number;
  gridLines: GridLine[];
  blockInset: number;
  blockPaddingHorizontal: number;
  blockPaddingVertical: number;
  fontScale: number;
  layoutMode: 'scroll' | 'fit';
  toggleSelection: (id: string) => void;
  conflictDetection: ConflictDetection;
  scheduleById: Map<string, ScheduleItem>;
  artistsById: Map<string, Artist>;
};

type ScheduleBlockCardProps = {
  block: StageBlock;
  gridStart: number;
  minuteHeight: number;
  blockInset: number;
  paddingHorizontal: number;
  paddingVertical: number;
  fontScale: number;
  layoutMode: 'scroll' | 'fit';
  toggleSelection: (id: string) => void;
  conflictDetection: ConflictDetection;
  scheduleById: Map<string, ScheduleItem>;
  artistsById: Map<string, Artist>;
};

const BASE_STAGE_COLUMN_WIDTH = 86;
const TIME_COLUMN_WIDTH = 40;
const AUTO_FIT_TIME_COLUMN_WIDTH = Math.round(TIME_COLUMN_WIDTH * 0.65);
// Adjust vertical scaling independently per layout mode
const SCROLL_MINUTE_PIXEL_HEIGHT = 1.03;
const FIT_MINUTE_PIXEL_HEIGHT = 1.03;
const GRID_MINOR_INTERVAL = 15;
const GRID_HORIZONTAL_PADDING = 6;
const HSCROLL_COLUMN_WIDTH = 136; // min comfortable width per stage when scrolling
const STAGE_HSCROLL_GAP = 8;
// Back-compat for multi-row banded layout references still present in code
const AUTO_FIT_MIN_COLUMN_WIDTH = 28;
const AUTO_FIT_STAGE_GAP = 4;
const SCROLL_MIN_FONT_SCALE = 0.56;
const AUTO_FIT_MIN_FONT_SCALE = 0.40;
const BAND_VERTICAL_GAP = 8;
const BLOCK_VERTICAL_GAP = 6;
const MIN_BLOCK_HEIGHT = 34;
const GRID_ALIGNMENT_INTERVAL = GRID_MINOR_INTERVAL;
const LABEL_INTERVAL = 60;
const MINIMUM_GRID_DURATION = 180;
const TIME_LABEL_OFFSET = 6;
const TIME_LABEL_HEIGHT = 20;
const MINOR_LINE_HEIGHT = StyleSheet.hairlineWidth === 0 ? 0.5 : StyleSheet.hairlineWidth;
const TARGET_DAY_DURATION_MINUTES = 10 * 60;
const MIN_MINUTE_PIXEL_HEIGHT = 0.55;
const MAX_MINUTE_PIXEL_HEIGHT = 6;

function deriveFestivalSchedule(festival: Festival): FestivalScheduleEntry[] {
  const scheduleEntries = Array.isArray(festival.schedule) ? festival.schedule : [];
  const normalizedSchedule = scheduleEntries
    .filter((entry): entry is FestivalScheduleEntry => Boolean(entry && entry.day && entry.time))
    .map((entry) => ({
      ...entry,
      day: entry.day ?? 'TBA Day',
      time: entry.time ?? 'Time TBA',
      stage: entry.stage ?? 'TBA Stage',
    }));

  if (normalizedSchedule.length) {
    return normalizedSchedule;
  }

  const lineupEntries = Array.isArray(festival.lineup) ? festival.lineup : [];

  return lineupEntries
    .filter((entry): entry is FestivalLineupEntry => Boolean(entry && entry.day && entry.time))
    .map((entry) => ({
      day: entry.day ?? 'TBA Day',
      time: entry.time ?? 'Time TBA',
      stage: entry.stage ?? 'TBA Stage',
      artistId: entry.artistId,
      artist: entry.artist,
      artistName: entry.artistName,
    }));
}

function ScheduleDayGrid({
  day,
  viewportWidth,
  layoutMode,
  toggleSelection,
  conflictDetection,
  scheduleById,
  artistsById,
}: ScheduleDayGridProps) {
  // Rebuild blocks if day grouping failed (e.g. due to time parsing)
  const tempBlocksByStage = new Map<string, StageBlock[]>();
  if (!day.blocksByStage.size) {
    const dayKey = (day.day ?? '').trim();
    const dayKeyBase = dayKey.split(' ')[0] ?? dayKey;
    const itemsForDay = Array.from(scheduleById.values()).filter((item) => {
      const key = (item.day ?? '').trim();
      const keyBase = key.split(' ')[0] ?? key;
      return (
        key === dayKey ||
        dayKey === key ||
        key.startsWith(dayKey) ||
        dayKey.startsWith(key) ||
        keyBase === dayKeyBase
      );
    });

    const nextByStage = new Map<string, number>();
    for (const item of itemsForDay) {
      let range = parseTimeRange(item.time);
      const stageKey = normalizeStage(item.stage);
      if (!range) {
        const base = nextByStage.get(stageKey) ?? 12 * 60;
        range = { start: base, end: base + DEFAULT_SET_DURATION_MINUTES };
        nextByStage.set(stageKey, range.end + 15);
      }
      if (!tempBlocksByStage.has(stageKey)) {
        tempBlocksByStage.set(stageKey, []);
      }
      tempBlocksByStage.get(stageKey)!.push({ item: item as ScheduleItem, range });
    }
  }

  const blocksByStage = day.blocksByStage.size ? day.blocksByStage : tempBlocksByStage;
  const stagesSource = day.stages.length ? day.stages : Array.from(blocksByStage.keys());
  const stageCount = stagesSource.length;

  if (!stageCount) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <Text style={{ fontSize: 12, color: '#64748B' }}>No schedule blocks found for this day.</Text>
      </View>
    );
  }

  const baseMinuteHeight =
    layoutMode === 'scroll' ? SCROLL_MINUTE_PIXEL_HEIGHT : FIT_MINUTE_PIXEL_HEIGHT;
  const totalMinutes = Math.max(day.gridEnd - day.gridStart, MINIMUM_GRID_DURATION);
  const targetHeight = TARGET_DAY_DURATION_MINUTES * baseMinuteHeight;
  const minuteHeight = clamp(targetHeight / totalMinutes, MIN_MINUTE_PIXEL_HEIGHT, MAX_MINUTE_PIXEL_HEIGHT);
  const gridHeight = Math.max(totalMinutes * minuteHeight, MIN_BLOCK_HEIGHT * 3);
  const timeColumnWidth = layoutMode === 'scroll' ? TIME_COLUMN_WIDTH : AUTO_FIT_TIME_COLUMN_WIDTH;

  if (layoutMode === 'scroll') {
    const headerScrollRef = useRef<ScrollView | null>(null);
    const bodyScrollRef = useRef<ScrollView | null>(null);
    const syncingRef = useRef(false);

    const columnWidth = HSCROLL_COLUMN_WIDTH;
    const stageGap = STAGE_HSCROLL_GAP;
    const stageAreaWidth = stageCount * columnWidth + Math.max(stageCount - 1, 0) * stageGap;
    const fontScale = Math.max(SCROLL_MIN_FONT_SCALE, Math.min(1, columnWidth / BASE_STAGE_COLUMN_WIDTH));
    const headerFontSize = Math.max(7, 9 * fontScale);
    const timeLabelFontSize = Math.max(7, 8 * fontScale);
    const blockInset = Math.max(1, Math.min(8, columnWidth * 0.04));
    const blockPaddingHorizontal = Math.max(4, 8 * fontScale);
    const blockPaddingVertical = Math.max(3, 6 * fontScale);

    const syncToBody = (x: number) => {
      syncingRef.current = true;
      bodyScrollRef.current?.scrollTo({ x, animated: false });
      setTimeout(() => {
        syncingRef.current = false;
      }, 0);
    };

    const syncToHeader = (x: number) => {
      syncingRef.current = true;
      headerScrollRef.current?.scrollTo({ x, animated: false });
      setTimeout(() => {
        syncingRef.current = false;
      }, 0);
    };

    return (
      <View style={styles.gridContainer}>
        <View style={styles.gridHeader}>
          <View style={{ width: timeColumnWidth }} />
          <ScrollView
            ref={headerScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              if (syncingRef.current) return;
              syncToBody(event.nativeEvent.contentOffset.x);
            }}
            scrollEventThrottle={16}>
            <View style={[styles.stageHeaderRow, { width: stageAreaWidth }]}>
              {stagesSource.map((stage, index) => (
                <View
                  key={stage}
                  style={[styles.stageHeaderCell, { width: columnWidth, marginLeft: index === 0 ? 0 : stageGap }]}> 
                  <Text style={[styles.stageHeaderText, { fontSize: headerFontSize }]} numberOfLines={3} ellipsizeMode="tail">
                    {formatStageDisplayName(stage)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={styles.gridBody}>
          <View style={[styles.timeColumn, { width: timeColumnWidth, height: gridHeight }]}>
            {day.timeLabels.map((label) => {
              const top = (label.minute - day.gridStart) * minuteHeight - TIME_LABEL_OFFSET;
              const clampedTop = Math.min(Math.max(top, 0), gridHeight - TIME_LABEL_HEIGHT);
              return (
                <View key={label.minute} style={[styles.timeLabelWrapper, { top: clampedTop }]}>
                  <Text style={[styles.timeLabelText, { fontSize: timeLabelFontSize }]}>{label.label}</Text>
                </View>
              );
            })}
          </View>
          <ScrollView
            ref={bodyScrollRef}
            horizontal
            showsHorizontalScrollIndicator
            onScroll={(event) => {
              if (syncingRef.current) return;
              syncToHeader(event.nativeEvent.contentOffset.x);
            }}
            scrollEventThrottle={16}>
            <View style={[styles.stageColumnsWrapper, { width: stageAreaWidth, height: gridHeight }]}>
              {stagesSource.map((stage, index) => (
                <StageColumn
                  key={stage}
                  blocks={blocksByStage.get(stage) ?? []}
                  columnWidth={columnWidth}
                  gridStart={day.gridStart}
                  minuteHeight={minuteHeight}
                  height={gridHeight}
                  offsetLeft={index === 0 ? 0 : stageGap}
                  gridLines={day.gridLines}
                  blockInset={blockInset}
                  blockPaddingHorizontal={blockPaddingHorizontal}
                  blockPaddingVertical={blockPaddingVertical}
                  fontScale={fontScale}
                  layoutMode={layoutMode}
                  toggleSelection={toggleSelection}
                  conflictDetection={conflictDetection}
                  scheduleById={scheduleById}
                  artistsById={artistsById}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // Auto-fit layout (banded rows)
  const stageGap = AUTO_FIT_STAGE_GAP;
  const availableWidth = Math.max(
    0,
    viewportWidth -
      Spacing.screenPadding * 2 -
      GRID_HORIZONTAL_PADDING * 2 -
      AUTO_FIT_TIME_COLUMN_WIDTH,
  );
  const columnsPerRow = Math.max(1, Math.min(stageCount, Math.floor(availableWidth / AUTO_FIT_MIN_COLUMN_WIDTH)));
  const stageRows: string[][] = [];
  for (let i = 0; i < stageCount; i += columnsPerRow) {
    stageRows.push(stagesSource.slice(i, i + columnsPerRow));
  }
  const timeLabelFontSize = Math.max(6, 8 * AUTO_FIT_MIN_FONT_SCALE * 0.9);

  return (
    <View style={styles.gridContainer}>
      {stageRows.map((rowStages, rowIndex) => {
        const rowCount = rowStages.length;
        const rowColumnWidth = rowCount > 0 ? (availableWidth - Math.max(rowCount - 1, 0) * stageGap) / rowCount : availableWidth;
        const rowAreaWidth = rowCount * rowColumnWidth + Math.max(rowCount - 1, 0) * stageGap;
        const rowFontScale = Math.max(AUTO_FIT_MIN_FONT_SCALE, Math.min(1, rowColumnWidth / BASE_STAGE_COLUMN_WIDTH));
        const rowHeaderFont = Math.max(6, 8 * rowFontScale);
        const blockInset = Math.max(1, Math.min(8, rowColumnWidth * 0.04));
        const blockPaddingHorizontal = Math.max(4, 8 * rowFontScale);
        const blockPaddingVertical = Math.max(3, 6 * rowFontScale);

        return (
          <View key={`row-${rowIndex}`} style={{ marginTop: rowIndex === 0 ? 0 : BAND_VERTICAL_GAP }}>
            <View style={styles.gridHeader}>
              <View style={{ width: timeColumnWidth }} />
              <View style={{ width: rowAreaWidth }}>
                <View style={[styles.stageHeaderRow, { width: rowAreaWidth }]}>
                  {rowStages.map((stage, index) => (
                    <View
                      key={stage}
                      style={[styles.stageHeaderCell, { width: rowColumnWidth, marginLeft: index === 0 ? 0 : stageGap }]}> 
                      <Text style={[styles.stageHeaderText, { fontSize: rowHeaderFont }]} numberOfLines={3} ellipsizeMode="tail">
                        {formatStageDisplayName(stage)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.gridBody}>
              <View style={[styles.timeColumn, { width: timeColumnWidth, height: gridHeight }]}>
                {day.timeLabels.map((label) => {
                  const top = (label.minute - day.gridStart) * minuteHeight - TIME_LABEL_OFFSET;
                  const clampedTop = Math.min(Math.max(top, 0), gridHeight - TIME_LABEL_HEIGHT);
                  return (
                    <View key={`${rowIndex}-${label.minute}`} style={[styles.timeLabelWrapper, { top: clampedTop }]}>
                      <Text style={[styles.timeLabelText, { fontSize: timeLabelFontSize }]}>{label.label}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={{ width: rowAreaWidth }}>
                <View style={[styles.stageColumnsWrapper, { width: rowAreaWidth, height: gridHeight }]}>
                  {rowStages.map((stage, index) => (
                    <StageColumn
                      key={stage}
                      blocks={blocksByStage.get(stage) ?? []}
                      columnWidth={rowColumnWidth}
                      gridStart={day.gridStart}
                      minuteHeight={minuteHeight}
                      height={gridHeight}
                      offsetLeft={index === 0 ? 0 : stageGap}
                      gridLines={day.gridLines}
                      blockInset={blockInset}
                      blockPaddingHorizontal={blockPaddingHorizontal}
                      blockPaddingVertical={blockPaddingVertical}
                      fontScale={rowFontScale}
                      layoutMode={layoutMode}
                      toggleSelection={toggleSelection}
                      conflictDetection={conflictDetection}
                      scheduleById={scheduleById}
                      artistsById={artistsById}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function StageColumn({
  blocks,
  columnWidth,
  gridStart,
  minuteHeight,
  height,
  offsetLeft,
  gridLines,
  blockInset,
  blockPaddingHorizontal,
  blockPaddingVertical,
  fontScale,
  layoutMode,
  toggleSelection,
  conflictDetection,
  scheduleById,
  artistsById,
}: StageColumnProps) {
  return (
    <View
      style={[
        styles.stageColumn,
        {
          width: columnWidth,
          height,
          marginLeft: offsetLeft,
        },
      ]}>
      {gridLines.map((line) => {
        const top = (line.minute - gridStart) * minuteHeight;
        if (top < 0 || top > height) {
          return null;
        }

        const lineHeight = line.major ? 1 : MINOR_LINE_HEIGHT;
        const clampedTop = Math.max(0, Math.min(top, height - lineHeight));

        return (
          <View
            key={`grid-${line.minute}`}
            style={[
              styles.gridLineBase,
              line.major ? styles.gridLineMajor : styles.gridLineMinor,
              { top: clampedTop },
            ]}
          />
        );
      })}
      {blocks.map((block) => (
        <ScheduleBlockCard
          key={block.item.id}
          block={block}
          gridStart={gridStart}
          minuteHeight={minuteHeight}
          blockInset={blockInset}
          paddingHorizontal={blockPaddingHorizontal}
          paddingVertical={blockPaddingVertical}
          fontScale={fontScale}
          layoutMode={layoutMode}
          toggleSelection={toggleSelection}
          conflictDetection={conflictDetection}
          scheduleById={scheduleById}
          artistsById={artistsById}
        />
      ))}
    </View>
  );
}

function ScheduleBlockCard({
  block,
  gridStart,
  minuteHeight,
  blockInset,
  paddingHorizontal,
  paddingVertical,
  fontScale,
  layoutMode,
  toggleSelection,
  conflictDetection,
  scheduleById,
  artistsById,
}: ScheduleBlockCardProps) {
  const { item, range } = block;
  const displayName = getScheduleArtistName(item, artistsById);
  const top = (range.start - gridStart) * minuteHeight;
  const rawHeight = (range.end - range.start) * minuteHeight;
  const height = Math.max(MIN_BLOCK_HEIGHT, rawHeight - BLOCK_VERTICAL_GAP);
  const hasConflict = conflictDetection.ids.has(item.id);
  const conflictNames = hasConflict
    ? (conflictDetection.map.get(item.id) ?? [])
        .map((conflictId) => {
          const conflictItem = scheduleById.get(conflictId);
          return conflictItem ? getScheduleArtistName(conflictItem, artistsById) : null;
        })
        .filter(Boolean) as string[]
    : [];
  const conflictSummary = hasConflict ? formatList(conflictNames) : null;
  const selected = item.selected;
  // Keep selection toggle logic but remove conflict/status text.
  const backgroundColor = selected ? 'rgba(90,103,216,0.06)' : Colors.surface;
  const borderColor = selected ? 'rgba(90,103,216,0.60)' : '#E2E8F0';
  const timeLabel = formatDisplayTime(item, range, layoutMode);
  const textScale = layoutMode === 'fit' ? 0.68 : 1;
  const metaScale = layoutMode === 'fit' ? 0.75 : 1;
  // Make in-block text significantly smaller for dense grids
  const titleSize = Math.max(7, 10 * fontScale * textScale);
  const metaSize = Math.max(6, 8 * fontScale * metaScale);
  const footerSize = Math.max(6, 8 * fontScale * metaScale);
  const conflictSize = Math.max(6, 8 * fontScale * metaScale);

  return (
    <Pressable
      onPress={() => toggleSelection(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`Toggle ${displayName} set`}
      style={[
        styles.blockCard,
        {
          top: top + BLOCK_VERTICAL_GAP / 2,
          height,
          backgroundColor,
          borderColor,
          left: blockInset,
          right: blockInset,
          paddingHorizontal,
          paddingVertical,
        },
      ]}>
      <Text style={[styles.blockTitle, { fontSize: titleSize }]} numberOfLines={2}>
        {displayName}
      </Text>
      <Text style={[styles.blockMeta, { fontSize: metaSize }]} numberOfLines={1}>
        {timeLabel}
      </Text>
      {/* Conflict and status text removed for clarity */}
    </Pressable>
  );
}

function getScheduleArtistName(entry: ScheduleItem, artistsById: Map<string, Artist>) {
  if (entry.artistName) {
    return entry.artistName;
  }
  if (entry.artist) {
    return entry.artist;
  }
  if (entry.artistId) {
    const artist = artistsById.get(entry.artistId);
    return artist?.name ?? entry.artistId;
  }
  return 'Artist TBA';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tabsRow: {
    marginTop: 0,
    marginBottom: 2,
  },
  gridWrapper: {
    flex: 1,
    marginTop: 0,
  },
  gridContainer: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: Colors.surface,
    paddingVertical: 4,
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
  },
  gridHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  gridBody: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: TIME_COLUMN_WIDTH,
    paddingRight: 12,
    position: 'relative',
  },
  timeLabelWrapper: {
    position: 'absolute',
    left: 0,
  },
  timeLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  stageHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  stageHeaderCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  stageHeaderText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  stageColumnsWrapper: {
    flexDirection: 'row',
  },
  stageColumn: {
    position: 'relative',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  gridLineBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(148, 163, 184, 0.35)',
  },
  gridLineMajor: {
    height: 1,
    backgroundColor: '#CBD5F5',
  },
  gridLineMinor: {
    height: MINOR_LINE_HEIGHT,
  },
  blockCard: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  blockMeta: {
    fontSize: 11,
    color: '#475569',
  },
  blockFooterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // conflictText removed; no conflict copy on grid
});

function buildDaySchedules(items: ScheduleItem[]): DaySchedule[] {
  const dayMap = new Map<
    string,
    {
      stages: string[];
      blocks: StageBlock[];
      minStart: number | null;
      maxEnd: number | null;
    }
  >();

  for (const item of items) {
    const dayKey = (item.day ?? '').trim();
    if (!dayKey) {
      continue;
    }

    const range = parseTimeRange(item.time);
    if (!range) {
      continue;
    }

    const stageKey = normalizeStage(item.stage);
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, { stages: [], blocks: [], minStart: null, maxEnd: null });
    }
    const bucket = dayMap.get(dayKey)!;

    if (!bucket.stages.includes(stageKey)) {
      bucket.stages.push(stageKey);
    }

    bucket.blocks.push({ item, range });
    bucket.minStart = bucket.minStart === null ? range.start : Math.min(bucket.minStart, range.start);
    bucket.maxEnd = bucket.maxEnd === null ? range.end : Math.max(bucket.maxEnd, range.end);
  }

  return Array.from(dayMap.entries()).map(([day, bucket]) => {
    const minStart = bucket.minStart ?? 12 * 60;
    const maxEnd = bucket.maxEnd ?? minStart + MINIMUM_GRID_DURATION;
    const gridStart = alignDown(minStart, GRID_ALIGNMENT_INTERVAL);
    const alignedEnd = alignUp(maxEnd, GRID_ALIGNMENT_INTERVAL);
    const gridEnd = alignedEnd <= gridStart ? gridStart + MINIMUM_GRID_DURATION : alignedEnd;
    const blocksByStage = new Map<string, StageBlock[]>();

    for (const stage of bucket.stages) {
      const stageBlocks = bucket.blocks
        .filter((block) => normalizeStage(block.item.stage) === stage)
        .sort((a, b) => a.range.start - b.range.start);
      blocksByStage.set(stage, stageBlocks);
    }

    const timeLabels = generateTimeLabels(gridStart, gridEnd);
    const gridLines = generateGridLines(gridStart, gridEnd);

    return {
      day,
      stages: bucket.stages,
      gridStart,
      gridEnd,
      blocksByStage,
      timeLabels,
      gridLines,
    };
  });
}

function generateTimeLabels(gridStart: number, gridEnd: number): TimeLabel[] {
  const labels: TimeLabel[] = [{ minute: gridStart, label: formatMinutes(gridStart) }];
  const end = alignUp(gridEnd, LABEL_INTERVAL);

  for (let minute = alignUp(gridStart + 1, LABEL_INTERVAL); minute <= end; minute += LABEL_INTERVAL) {
    labels.push({ minute, label: formatMinutes(minute) });
  }

  return labels;
}

function generateGridLines(gridStart: number, gridEnd: number): GridLine[] {
  const lines: GridLine[] = [];

  for (let minute = gridStart; minute <= gridEnd; minute += GRID_MINOR_INTERVAL) {
    lines.push({ minute, major: minute % LABEL_INTERVAL === 0 });
  }

  return lines;
}

function normalizeStage(stage?: string | null) {
  const trimmed = stage?.trim();
  return trimmed && trimmed.length ? trimmed : 'TBA Stage';
}

function alignDown(value: number, interval: number) {
  return Math.floor(value / interval) * interval;
}

function alignUp(value: number, interval: number) {
  return Math.ceil(value / interval) * interval;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatTimeRange(range: TimeRange) {
  return `${formatMinutes(range.start)} - ${formatMinutes(range.end)}`;
}

function formatDisplayTime(entry: ScheduleItem, range: TimeRange, mode: 'scroll' | 'fit') {
  if (mode === 'fit') {
    const value = entry.time ?? formatMinutes(range.start);
    const separatorIndex = value.indexOf('-');
    return separatorIndex >= 0 ? value.slice(0, separatorIndex).trim() : value;
  }

  return entry.time ?? formatTimeRange(range);
}

function formatMinutes(totalMinutes: number) {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${meridiem}`;
}

type ConflictDetection = {
  ids: Set<string>;
  map: Map<string, string[]>;
};

type ParsedTime = {
  minutes: number;
  hadMeridiem: boolean;
  originalHours: number;
};

type TimeRange = {
  start: number;
  end: number;
};

const TIME_EXTRACTOR = /(\d{1,2})(?::(\d{2}))?\s?(AM|PM|am|pm)?/g;
const HAS_DIGIT = /\d/;
// Default to an hour-long set when only a single start time is provided.
const DEFAULT_SET_DURATION_MINUTES = 60;
const TWELVE_HOURS_IN_MINUTES = 12 * 60;
const TWENTY_FOUR_HOURS_IN_MINUTES = 24 * 60;

function formatStageDisplayName(stage: string) {
  return stage.replace(/\bStage\b/i, '').trim() || stage;
}

function computeConflicts(items: ScheduleItem[]): ConflictDetection {
  const conflicts = new Map<string, string[]>();
  const itemsByDay = new Map<string, Array<{ item: ScheduleItem; range: TimeRange }>>();

  // Group selected items by day and detect overlaps within each bucket.
  for (const item of items) {
    if (!item.selected) {
      continue;
    }

    const dayKey = (item.day ?? '').trim();
    if (!dayKey) {
      continue;
    }

    const range = parseTimeRange(item.time);
    if (!range) {
      continue;
    }

    if (!itemsByDay.has(dayKey)) {
      itemsByDay.set(dayKey, []);
    }
    itemsByDay.get(dayKey)!.push({ item, range });
  }

  for (const [, entries] of itemsByDay) {
    entries.sort((a, b) => a.range.start - b.range.start);
    for (let i = 0; i < entries.length; i += 1) {
      const current = entries[i];
      for (let j = i + 1; j < entries.length; j += 1) {
        const comparison = entries[j];
        if (rangesOverlap(current.range, comparison.range)) {
          addConflictPair(conflicts, current.item.id, comparison.item.id);
        } else if (comparison.range.start >= current.range.end) {
          break;
        }
      }
    }
  }

  return { ids: new Set(conflicts.keys()), map: conflicts };
}

function parseTimeRange(timeValue?: string): TimeRange | null {
  // Supports formats such as "9:00 PM", "1:15-2:00", "23:30", and friendly labels like "noon".
  if (!timeValue) {
    return null;
  }

  const normalized = timeValue.trim();
  if (!normalized) {
    return null;
  }

  const lower = normalized.toLowerCase();
  if (lower === 'tba' || lower === 'tbd' || lower === 'all day') {
    return null;
  }

  if (lower.includes('noon') && !HAS_DIGIT.test(normalized)) {
    const base = 12 * 60;
    return { start: base, end: base + DEFAULT_SET_DURATION_MINUTES };
  }
  if (lower.includes('midnight') && !HAS_DIGIT.test(normalized)) {
    const base = 24 * 60;
    return { start: base, end: base + DEFAULT_SET_DURATION_MINUTES };
  }

  TIME_EXTRACTOR.lastIndex = 0;
  const matches = Array.from(normalized.matchAll(TIME_EXTRACTOR));
  if (!matches.length) {
    return null;
  }

  const parsedTimes = matches
    .map((match) => parseTimeMatch(match))
    .filter((value): value is ParsedTime => value !== null);

  if (!parsedTimes.length) {
    return null;
  }

  const adjustedTimes = parsedTimes.map((parsed) => normalizeParsedTime(parsed));
  const start = adjustedTimes[0];
  let end: number | null = adjustedTimes[1] ?? null;

  if (end === null) {
    end = start + DEFAULT_SET_DURATION_MINUTES;
  } else if (end <= start) {
    const difference = start - end;
    // Heuristic: if the times look like 12-hour clock values rolling past noon (e.g. 12:30-1:15),
    // bump the end into the afternoon; otherwise treat it as a cross-midnight slot.
    if (difference <= TWELVE_HOURS_IN_MINUTES) {
      end += TWELVE_HOURS_IN_MINUTES;
    } else {
      end += TWENTY_FOUR_HOURS_IN_MINUTES;
    }
  }

  return { start, end };
}

function parseTimeMatch(match: RegExpMatchArray): ParsedTime | null {
  const hours = Number.parseInt(match[1] ?? '', 10);
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const meridiem = match[3]?.toLowerCase();
  let parsedHours = hours;
  if (meridiem === 'am' || meridiem === 'pm') {
    parsedHours %= 12;
    if (meridiem === 'pm') {
      parsedHours += 12;
    }
    return { minutes: parsedHours * 60 + minutes, hadMeridiem: true, originalHours: hours };
  }

  return { minutes: parsedHours * 60 + minutes, hadMeridiem: false, originalHours: hours };
}

function normalizeParsedTime(parsed: ParsedTime) {
  if (parsed.hadMeridiem) {
    return parsed.minutes;
  }

  const hours = parsed.originalHours;
  if (hours === 12) {
    return parsed.minutes;
  }
  if (hours >= 1 && hours <= 11) {
    return parsed.minutes + TWELVE_HOURS_IN_MINUTES;
  }
  return parsed.minutes;
}

function rangesOverlap(a: TimeRange, b: TimeRange) {
  return a.start < b.end && b.start < a.end;
}

function addConflictPair(map: Map<string, string[]>, firstId: string, secondId: string) {
  if (!map.has(firstId)) {
    map.set(firstId, []);
  }
  if (!map.has(secondId)) {
    map.set(secondId, []);
  }

  const firstConflicts = map.get(firstId)!;
  if (!firstConflicts.includes(secondId)) {
    firstConflicts.push(secondId);
  }

  const secondConflicts = map.get(secondId)!;
  if (!secondConflicts.includes(firstId)) {
    secondConflicts.push(firstId);
  }
}

function formatList(values: string[]): string {
  const unique = Array.from(new Set(values.filter(Boolean)));
  if (!unique.length) {
    return '';
  }
  if (unique.length === 1) {
    return unique[0];
  }
  if (unique.length === 2) {
    return `${unique[0]} and ${unique[1]}`;
  }
  const head = unique.slice(0, -1).join(', ');
  const tail = unique[unique.length - 1];
  return `${head}, and ${tail}`;
}







