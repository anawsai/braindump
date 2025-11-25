import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchNotes } from '../../lib/api';

export default function ReviewPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchNotes()
      .then((data) => {
        if (!mounted) return;
        setNotes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setNotes([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const total = notes.length;

  const countsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const n of notes) {
      const c = (n.category || n.tag || 'Uncategorized');
      map[c] = (map[c] || 0) + 1;
    }
    return map;
  }, [notes]);

  const topCategory = useMemo(() => {
    let best = null as string | null;
    let bestCount = 0;
    for (const k of Object.keys(countsByCategory)) {
      if (countsByCategory[k] > bestCount) {
        best = k; bestCount = countsByCategory[k];
      }
    }
    return { name: best ?? 'None', count: bestCount };
  }, [countsByCategory]);

  const thinkingPatterns = useMemo(() => {
    // derive percentages for a couple of categories (Work, Health)
    const work = countsByCategory['Work'] || 0;
    const health = countsByCategory['Health'] || 0;
    const workPct = total ? Math.round((work / total) * 100) : 0;
    const healthPct = total ? Math.round((health / total) * 100) : 0;
    return [{ label: 'Work', pct: workPct }, { label: 'Health', pct: healthPct }];
  }, [countsByCategory, total]);

  // simple stress trend mock — use counts to create sample bars
  const stressTrend = useMemo(() => {
    // create 7 numbers; bias toward last days if many notes
    const base = total ? Math.min(8, Math.ceil(total / 3)) : 1;
    return [1, 3, 2, 2, base + 3, base + 1, base + 2];
  }, [total]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 18 }}>
      <Text style={s.title}>Review</Text>

      <View style={s.cardLarge}>
        <Text style={s.cardTitle}>Weekly Summary</Text>
        <Text style={s.cardBody}>
          {`You've created ${total} note${total === 1 ? '' : 's'} this week.`}
          {topCategory.name && topCategory.name !== 'None' ? ` Your top topic is ${topCategory.name} (${topCategory.count}).` : ''}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
        <View style={s.metricBox}>
          <Ionicons name="brain" size={36} color="#2b1a0d" />
          <Text style={s.metricNumber}>{total}</Text>
        </View>
        <View style={s.metricBox}>
          <Ionicons name="checkmark-circle" size={36} color="#2b1a0d" />
          <Text style={s.metricNumber}>{topCategory.count}</Text>
        </View>
      </View>

      <Text style={[s.sectionTitle, { marginTop: 18 }]}>Thinking Patterns</Text>
      {thinkingPatterns.map((p) => (
        <View key={p.label} style={s.patternCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={s.badge}><Text style={s.badgeText}>⌂</Text></View>
            <Text style={s.patternLabel}>{p.label}</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${p.pct}%` }]} />
          </View>
          <Text style={s.pctText}>{p.pct}%</Text>
        </View>
      ))}

      <Text style={[s.sectionTitle, { marginTop: 18 }]}>Stress Trends</Text>
      <View style={s.trendCard}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 6 }}>
          {stressTrend.map((v, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={[s.bar, { height: 10 + v * 8 }]} />
              <Text style={s.barLabel}>{['M','T','W','T','F','S','S'][i]}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[s.sectionTitle, { marginTop: 18 }]}>Recomendations</Text>
      <View style={s.recCard}>
        <Text style={s.recTitle}>{topCategory.count > 0 ? `Schedule that meeting` : 'No recommendations yet'}</Text>
        <Text style={s.recBody}>{topCategory.count > 0 ? `(You've mentioned this ${topCategory.count} times, time to act.)` : 'Create more notes to get personalized recommendations.'}</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  cardLarge: {
    backgroundColor: '#FFF2E0',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#7A4C2B',
  },
  cardTitle: { fontWeight: '700', marginBottom: 6 },
  cardBody: { color: '#222' },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFF0D9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7A4C2B',
  },
  metricNumber: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  patternCard: {
    backgroundColor: '#FFF2E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#7A4C2B',
  },
  badge: { backgroundColor: '#FFB052', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  badgeText: { color: '#2b1a0d', fontWeight: '700' },
  patternLabel: { fontWeight: '700' },
  progressTrack: { height: 12, backgroundColor: '#F6EDE6', borderRadius: 8, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', backgroundColor: '#FFB052' },
  pctText: { textAlign: 'right', marginTop: 6, color: '#333' },
  trendCard: { backgroundColor: '#FFF2E0', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#7A4C2B' },
  bar: { width: '60%', backgroundColor: '#FFB052', borderRadius: 4 },
  barLabel: { marginTop: 6, color: '#333' },
  recCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#DDDDDD', marginTop: 8 },
  recTitle: { fontWeight: '700', marginBottom: 6 },
  recBody: { color: '#666' },
});
