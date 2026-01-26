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

type Recommendation = {
  icon: string;
  title: string;
  advice: string;
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
      return "Hey there! You haven't created any notes this week yet. No worries though - whenever you're ready, start dumping your thoughts and I'll help you spot patterns and insights. Your brain will thank you! 🧠";
    }

    const { totalNotes, topCategory, categoryPercentages, themes, dailyCounts } = analysis;
    const topCat = topCategory?.category || "Personal";
    const topPercent = topCategory?.percentage || 0;

    // Map abbreviated to full day names
    const fullDayNames: Record<string, string> = {
      "Sun": "Sunday",
      "Mon": "Monday",
      "Tue": "Tuesday",
      "Wed": "Wednesday",
      "Thu": "Thursday",
      "Fri": "Friday",
      "Sat": "Saturday"
    };

    // Find most active day
    const mostActiveDayEntry = Object.entries(dailyCounts).reduce((a, b) => 
      (b[1] > a[1]) ? b : a, ["", 0]
    );
    const mostActiveDay = fullDayNames[mostActiveDayEntry[0]] || mostActiveDayEntry[0];
    const mostActiveCount = mostActiveDayEntry[1];

    let summary = `Hey! What a week it's been. You created ${totalNotes} brain dump${totalNotes > 1 ? "s" : ""} - `;

    if (totalNotes === 1) {
      summary += `it's a start! Every journey begins with a single step. `;
    } else if (totalNotes < 4) {
      summary += `nice work getting your thoughts out there! `;
    } else if (totalNotes < 7) {
      summary += `you've been pretty consistent, love to see it! `;
    } else {
      summary += `wow, you've been on a roll! That's some serious mental decluttering. `;
    }

    if (topPercent > 60) {
      summary += `\n\nLooks like ${topCat} has been on your mind a lot (${topPercent}% of your thoughts). `;
      if (topCat === "Work") {
        summary += `Busy times at work? Remember to give yourself some breathing room too!`;
      } else if (topCat === "Health") {
        summary += `Love that you're prioritizing your wellbeing!`;
      } else if (topCat === "Tasks") {
        summary += `You're in productivity mode - just don't forget to celebrate the wins!`;
      } else if (topCat === "Ideas") {
        summary += `Your creative juices are flowing! Make sure to revisit these gems.`;
      } else {
        summary += `It's clearly something important to you right now.`;
      }
    } else if (categoryPercentages.length > 1) {
      const secondCat = categoryPercentages[1];
      summary += `\n\nYour thoughts have been nicely balanced between ${topCat} (${topPercent}%) and ${secondCat.category} (${secondCat.percentage}%). That's a healthy mix!`;
    }

    if (mostActiveCount > 1) {
      summary += `\n\n${mostActiveDay} was your most active day with ${mostActiveCount} dumps. `;
    }

    if (themes && themes.length > 0) {
      const themeList = themes.slice(0, 3).join(', ');
      summary += `\n\nI noticed some recurring themes: ${themeList}. These seem to be what's really on your mind lately.`;
    }

    return summary;
  }

  function getRecommendations(): Recommendation[] {
    if (!analysis) return [];

    const recommendations: Recommendation[] = [];
    const topCat = analysis.topCategory?.category;
    const topPercent = analysis.topCategory?.percentage || 0;

    // Category-based recommendations
    if (topCat === "Work" && topPercent > 50) {
      recommendations.push({
        icon: "cafe",
        title: "Take a Break",
        advice: "You've been focused heavily on work this week. Consider scheduling short breaks to recharge and maintain productivity."
      });
    }

    if (topCat === "Health" || analysis.categoryCounts["Health"] > 0) {
      recommendations.push({
        icon: "heart",
        title: "Keep It Up",
        advice: "Great job prioritizing your health! Consistency is key - try to maintain these healthy habits."
      });
    }

    if (topCat === "Tasks" && topPercent > 40) {
      recommendations.push({
        icon: "checkmark-done",
        title: "Celebrate Progress",
        advice: "You're getting things done! Remember to acknowledge your accomplishments, no matter how small."
      });
    }

    if (topCat === "Ideas" || analysis.categoryCounts["Ideas"] > 0) {
      recommendations.push({
        icon: "bulb",
        title: "Capture & Review",
        advice: "You're generating great ideas! Set aside time weekly to review and develop your most promising ones."
      });
    }

    if (topCat === "Personal") {
      recommendations.push({
        icon: "journal",
        title: "Self-Reflection",
        advice: "Personal reflection is valuable. Consider journaling regularly to track your growth and insights."
      });
    }

    // Wellness suggestions (always include one)
    const wellnessTips: Recommendation[] = [
      {
        icon: "water",
        title: "Stay Hydrated",
        advice: "Remember to drink plenty of water throughout the day. Proper hydration improves focus and energy levels."
      },
      {
        icon: "bed",
        title: "Prioritize Sleep",
        advice: "Quality sleep is essential for mental clarity. Aim for 7-9 hours and maintain a consistent sleep schedule."
      },
      {
        icon: "walk",
        title: "Move Your Body",
        advice: "Even a short 10-minute walk can boost your mood and creativity. Try to incorporate movement into your day."
      },
      {
        icon: "leaf",
        title: "Mindful Moments",
        advice: "Take a few minutes each day for deep breathing or meditation. It helps reduce stress and improve focus."
      },
    ];

    // Add a random wellness tip
    const randomWellness = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
    recommendations.push(randomWellness);

    // Activity-based recommendation
    const totalDumps = analysis.totalNotes;
    if (totalDumps < 3) {
      recommendations.push({
        icon: "create",
        title: "Dump More Often",
        advice: "Try to brain dump at least once a day. Regular dumps help clear your mind and capture important thoughts."
      });
    } else if (totalDumps >= 7) {
      recommendations.push({
        icon: "star",
        title: "Excellent Consistency",
        advice: "You're doing amazing with regular brain dumps! This habit is great for mental clarity and productivity."
      });
    }

    return recommendations.slice(0, 3); // Return max 3 recommendations
  }

  // Map full day names to abbreviated for API lookup
  const dayAbbrev: Record<string, string> = {
    "Sunday": "Sun",
    "Monday": "Mon", 
    "Tuesday": "Tue",
    "Wednesday": "Wed",
    "Thursday": "Thu",
    "Friday": "Fri",
    "Saturday": "Sat"
  };

  function getDailyBarHeight(day: string): number {
    if (!analysis) return 0;
    // Try both full name and abbreviated
    const abbrev = dayAbbrev[day] || day;
    const count = analysis.dailyCounts[day] || analysis.dailyCounts[abbrev] || 0;
    const maxCount = Math.max(...Object.values(analysis.dailyCounts), 1);
    return (count / maxCount) * 80;
  }

  function getDailyCount(day: string): number {
    if (!analysis) return 0;
    const abbrev = dayAbbrev[day] || day;
    return analysis.dailyCounts[day] || analysis.dailyCounts[abbrev] || 0;
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
  const dailyOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
              <Text style={[styles.barLabel, { color: colors.text }]}>{day.slice(0, 3)}</Text>
              <Text style={[styles.barCount, { color: colors.textSecondary }]}>
                {getDailyCount(day)}
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

      {/* Recommendations */}
      {analysis && analysis.totalNotes > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations</Text>
          {getRecommendations().map((rec, idx) => (
            <View key={idx} style={[styles.adviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.adviceHeader}>
                <Ionicons name={rec.icon as any} size={24} color={colors.primary} />
                <Text style={[styles.adviceTitle, { color: colors.text }]}>{rec.title}</Text>
              </View>
              <Text style={[styles.adviceText, { color: colors.textSecondary }]}>{rec.advice}</Text>
            </View>
          ))}
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
    marginBottom: 20,
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
  adviceCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
  },
});