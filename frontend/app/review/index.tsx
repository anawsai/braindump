import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getWeeklyNotes, analyzeWeeklyNotes } from "../../lib/api";
import { useTheme } from '../../context/ThemeContext';
import { useLoading } from '../../context/LoadingContext';

type CategoryData = {
  category: string;
  count: number;
  percentage: number;
};

type AnalysisData = {
  totalNotes: number;
  categoryCounts: Record<string, number>;
  categoryPercentages: CategoryData[];
  dailyCounts: Record<string, number>;
  topCategory?: CategoryData;
  themes?: string[];
  notes?: any[];
};

export default function ReviewPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { start, stop } = useLoading();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      async function loadWeeklyData() {
        // Only show loading animation on first load
        if (!hasLoadedOnce) {
          start('Analyzing your week...');
        }
        
        try {
          const notes = await getWeeklyNotes();
          const analysisData = analyzeWeeklyNotes(notes);
          setAnalysis(analysisData);
          setHasLoadedOnce(true);
        } catch (error) {
          console.error("Failed to load weekly data:", error);
        } finally {
          if (!hasLoadedOnce) {
            stop();
          }
        }
      }
      
      loadWeeklyData();
    }, [hasLoadedOnce])
  );

  function generateWeeklySummary() {
    if (!analysis || analysis.totalNotes === 0) {
      return "You haven't created any notes this week yet. Start dumping your thoughts to see patterns emerge!";
    }

    const { totalNotes, topCategory, categoryPercentages, themes } = analysis;
    const topCat = topCategory?.category || "Personal";
    const topPercent = topCategory?.percentage || 0;

    let summary = `This week you created ${totalNotes} brain dump${totalNotes > 1 ? "s" : ""}, `;

    if (topPercent > 60) {
      summary += `with a strong focus on ${topCat} (${topPercent}% of your thoughts). `;
    } else if (categoryPercentages.length > 1) {
      const secondCat = categoryPercentages[1];
      summary += `balanced between ${topCat} (${topPercent}%) and ${secondCat.category} (${secondCat.percentage}%). `;
    } else {
      summary += `focused on ${topCat}. `;
    }

    if (themes && themes.length > 0) {
      const themeList = themes.slice(0, 3).join(', ');
      summary += `Key themes: ${themeList}.`;
    }

    return summary;
  }

  function getDailyBarHeight(day: string): number {
    if (!analysis) return 0;
    const count = analysis.dailyCounts[day] || 0;
    const maxCount = Math.max(...Object.values(analysis.dailyCounts), 1);
    return (count / maxCount) * 80;
  }

  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Work: "briefcase",
      Health: "fitness",
      Personal: "person",
      Ideas: "bulb",
      Tasks: "checkmark-circle",
      Learning: "book",
    };
    return icons[category] || "star";
  }

  const topCategories = analysis?.categoryPercentages.slice(0, 2) || [];
  const dailyOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Weekly Review</Text>
      </View>

      {/* Weekly Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.summaryText, { color: colors.text }]}>{generateWeeklySummary()}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="document-text" size={32} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{analysis?.totalNotes || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Brain Dumps</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="pie-chart" size={32} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {analysis?.categoryPercentages.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Categories</Text>
        </View>
      </View>

      {/* Thinking Patterns */}
      {topCategories.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
          {topCategories.map((cat, idx) => (
            <View key={idx} style={[styles.patternCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.patternRow}>
                <Ionicons name={getCategoryIcon(cat.category) as any} size={20} color={colors.primary} />
                <Text style={[styles.patternLabel, { color: colors.text }]}>{cat.category}</Text>
                <Text style={[styles.percentText, { color: colors.text }]}>{cat.percentage}%</Text>
              </View>
              <View style={[styles.progressBarContainer, { backgroundColor: colors.surface }]}>
                <View style={[styles.progressBar, { width: `${cat.percentage}%`, backgroundColor: colors.primary }]} />
              </View>
            </View>
          ))}
        </>
      )}

      {/* Activity Chart */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Activity</Text>
      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.chartBars}>
          {dailyOrder.map((day, idx) => (
            <View key={idx} style={styles.barContainer}>
              <View style={[styles.bar, { height: Math.max(getDailyBarHeight(day), 4), backgroundColor: colors.primary }]} />
              <Text style={[styles.barLabel, { color: colors.text }]}>{day[0]}</Text>
              <Text style={[styles.barCount, { color: colors.textSecondary }]}>
                {analysis?.dailyCounts[day] || 0}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Themes */}
      {analysis?.themes && analysis.themes.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recurring Themes</Text>
          <View style={styles.themesContainer}>
            {analysis.themes.slice(0, 5).map((theme, idx) => (
              <View key={idx} style={[styles.themeTag, { backgroundColor: colors.primary }]}>
                <Text style={[styles.themeText, { color: colors.text }]}>{theme}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },
  patternCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  patternLabel: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "700",
  },
  chartCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  barCount: {
    fontSize: 10,
    marginTop: 2,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});