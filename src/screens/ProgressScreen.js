import React, { useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import colors from '../styles/colors';
import progressData from '../data/progressData';
import userData from '../data/userData';
import progressManager from '../utils/progressManager';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {

  // fallback dummy data to show historical bars when no real weekly data exists
  const defaultDummy = [30, 45, 20, 60, 50, 40, 0]; // last slot reserved for today

  // helper to build initial series from static data or dummy
  function buildInitialSeries() {
    const raw = Array.isArray(progressData.weekly) ? progressData.weekly : [];
    if (raw.length === 7 && !raw.every((v) => v === 0)) return [...raw];
    return [...defaultDummy];
  }

  const [progressSeries, setProgressSeries] = React.useState(() => buildInitialSeries());
  const [progressPercent, setProgressPercent] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    let unsub = null;

    async function initAndSubscribe() {
      try {
        await progressManager.init();
        const totals = progressManager.computeTotals();
        if (!mounted) return;
        setProgressPercent(totals.percent || 0);
        // If everything was cleared, reset the whole weekly series to zeros
        if ((totals.completedCalories || 0) === 0 && (totals.completedExercises || 0) === 0) {
          setProgressSeries(() => new Array(7).fill(0));
        } else {
          setProgressSeries((prev) => {
            const u = Array.isArray(prev) ? [...prev] : buildInitialSeries();
            u[u.length - 1] = totals.percent;
            return u;
          });
        }
        unsub = progressManager.subscribe(() => {
          const t = progressManager.computeTotals();
          setProgressPercent(t.percent || 0);
          if ((t.completedCalories || 0) === 0 && (t.completedExercises || 0) === 0) {
            setProgressSeries(() => new Array(7).fill(0));
          } else {
            setProgressSeries((prev) => {
              const u = Array.isArray(prev) ? [...prev] : buildInitialSeries();
              u[u.length - 1] = t.percent;
              return u;
            });
          }
        });
      } catch (err) {
        setProgressSeries(buildInitialSeries());
      }
    }

    initAndSubscribe();
    return () => { mounted = false; if (unsub) unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh when screen gains focus to ensure latest totals are shown
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          await progressManager.init();
          const totals = progressManager.computeTotals();
          if (!mounted) return;
          setProgressPercent(totals.percent || 0);
          setProgressSeries((prev) => {
            const u = Array.isArray(prev) ? [...prev] : buildInitialSeries();
            u[u.length - 1] = totals.percent || 0;
            return u;
          });
        } catch (e) {
          // ignore
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  // ---------- DATE LOGIC ----------
  // ensure the chart uses the same today percent as the dashboard
  const chartSeries = React.useMemo(() => {
    const u = Array.isArray(progressSeries) ? [...progressSeries] : buildInitialSeries();
    u[u.length - 1] = progressPercent;
    return u;
  }, [progressSeries, progressPercent]);

  const todayIndex = chartSeries.length - 1;

  const dayLabels = useMemo(() => {
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString('en-US', { weekday: 'short' })
      );
    }
    return labels;
  }, []);

  // ---------- STREAK LOGIC ----------
  const streak = useMemo(() => {
    let count = 0;
    const lastIndex = chartSeries.length - 1;
    // If today's value is zero, start counting from yesterday so streak reflects past days
    let start = lastIndex;
    if (chartSeries[lastIndex] === 0) start = lastIndex - 1;
    if (start < 0) return 0;
    for (let i = start; i >= 0; i--) {
      if (chartSeries[i] > 0) count++;
      else break;
    }
    return count;
  }, [chartSeries]);

  // ---------- STATS ----------
  const averageProgress = Math.round(
    chartSeries.reduce((a, b) => a + b, 0) / chartSeries.length
  );

  const bestDay = Math.max(...chartSeries);

  // ---------- UI ----------
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Last 7 days performance</Text>
      </View>

      {/* Weekly Chart */}
      <View style={styles.chartCard}>
          <BarChart
            data={{
              labels: dayLabels,
              datasets: [{ data: chartSeries }],
            }}
            // reduce width so chart sits inside card padding and appears centered
            width={screenWidth - 40 - 24}
            height={220}
            fromZero
            withInnerLines={false}
            showValuesOnTopOfBars
            chartConfig={{
              // make chart background transparent so only the card's background shows
              backgroundGradientFrom: colors.surfaceLight,
              backgroundGradientTo: colors.surfaceLight,
              backgroundGradientFromOpacity: 1,
              backgroundGradientToOpacity: 1,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.onSurfaceVariant,
              barPercentage: 0.6,
              fillShadowGradient: colors.primary,
              fillShadowGradientOpacity: 1,
            }}
            style={styles.chart}
          />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>STREAK</Text>
          <Text style={styles.statValue}>{streak} days</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>AVERAGE</Text>
          <Text style={styles.statValue}>{averageProgress}%</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>BEST DAY</Text>
          <Text style={styles.statValue}>{bestDay}%</Text>
        </View>
      </View>

      {/* Today Highlight */}
      <View style={styles.todayCard}>
        <Text style={styles.todayTitle}>Today</Text>
        <Text style={styles.todayValue}>
          {progressPercent}% completed
        </Text>
        <Text style={styles.todayHint}>
          Keep going to maintain your streak 🔥
        </Text>
      </View>

    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 24,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.onSurface,
  },

  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },

  chartCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    backgroundColor: 'transparent',
    paddingRight: 8,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  statCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 6,
  },

  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
  },

  todayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },

  todayValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },

  todayHint: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },
});
