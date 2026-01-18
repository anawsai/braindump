import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getWeeklyNotes, analyzeWeeklyNotes } from "../../lib/api";

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
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [weeklyNotes, setWeeklyNotes] = useState<any[]>([]);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  async function loadWeeklyData() {
    try {
      setLoading(true);
      const notes = await getWeeklyNotes();
      setWeeklyNotes(notes);
      const analysisData = analyzeWeeklyNotes(notes);
      setAnalysis(analysisData);
    } catch (error) {
      console.error("Failed to load weekly data:", error);
    } finally {
      setLoading(false);
    }
  }

  function generateWeeklySummary() {
    if (!analysis || analysis.totalNotes === 0) {
      return "You haven't created any notes this week yet. Start dumping your thoughts to see patterns emerge and gain insights about what's on your mind!";
    }

    const { totalNotes, topCategory, categoryPercentages, themes } = analysis;
    const topCat = topCategory?.category || "Personal";
    const topPercent = topCategory?.percentage || 0;

    let summary = `This week you created ${totalNotes} brain dump${totalNotes > 1 ? "s" : ""}, `;

    // Describe category focus
    if (topPercent > 60) {
      summary += `with a strong focus on ${topCat} (${topPercent}% of your thoughts). `;
    } else if (categoryPercentages.length > 1) {
      const secondCat = categoryPercentages[1];
      summary += `balanced between ${topCat} (${topPercent}%) and ${secondCat.category} (${secondCat.percentage}%). `;
    } else {
      summary += `focused on ${topCat}. `;
    }

    // Add themes if we found any
    if (themes && themes.length > 0) {
      const themeList = themes.slice(0, 5).join(', ');
      summary += `\n\nRecurring themes in your notes include: ${themeList}. `;
      
      // Add context based on category + themes
      if (topCat === "Work") {
        summary += `These work-related topics seem to be occupying significant mental space. `;
      } else if (topCat === "Personal") {
        summary += `You've been spending time reflecting on personal matters and self-development. `;
      } else if (topCat === "Ideas") {
        summary += `Your creative mind has been active with new ideas and possibilities. `;
      } else if (topCat === "Health") {
        summary += `Health and wellness have been on your mind this week. `;
      }
    }

    // Activity pattern insight
    const activeDays = Object.values(analysis.dailyCounts).filter(c => c > 0).length;
    if (activeDays >= 5) {
      summary += `\n\nYou've been consistently brain dumping ${activeDays} days this week - excellent habit building!`;
    } else if (activeDays >= 3) {
      summary += `\n\nYou've brain dumped on ${activeDays} days this week. Consider making it a daily practice for even better mental clarity.`;
    } else if (activeDays === 1) {
      const busiestDay = Object.entries(analysis.dailyCounts)
        .reduce((max, [day, count]) => count > max[1] ? [day, count] : max, ['', 0]);
      summary += `\n\nAll your brain dumps happened on ${busiestDay[0]}. Try spreading them throughout the week for better mental maintenance.`;
    }

    return summary;
  }

  function getDailyBarHeight(day: string): number {
    if (!analysis) return 0;
    const count = analysis.dailyCounts[day] || 0;
    const maxCount = Math.max(...Object.values(analysis.dailyCounts), 1);
    // Scale to max height of 120
    return (count / maxCount) * 120;
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB052" />
        <Text style={styles.loadingText}>Analyzing your week...</Text>
      </View>
    );
  }

  // Get top 2 categories for display
  const topCategories = analysis?.categoryPercentages.slice(0, 2) || [];
  const dailyOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Weekly Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Weekly Summary</Text>
          <Text style={styles.summaryText}>{generateWeeklySummary()}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Brain Dumps */}
          <View style={styles.statCard}>
            <View style={styles.brainIcon}>
              <Image
                source={require("../../assets/reviewbrainicon.png")}
                style={styles.brainImage}
              />
            </View>
            <Text style={styles.statNumber}>{analysis?.totalNotes || 0}</Text>
            <Text style={styles.statLabel}>Brain Dumps</Text>
          </View>

          {/* Categories */}
          <View style={styles.statCard}>
            <View style={styles.categoryIcon}>
              <Ionicons name="pie-chart" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>
              {analysis?.categoryPercentages.length || 0}
            </Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        {/* Thinking Patterns */}
        <Text style={styles.sectionTitle}>Thinking Patterns</Text>

        {topCategories.length > 0 ? (
          topCategories.map((cat, idx) => (
            <View key={idx} style={styles.patternCard}>
              <View style={styles.patternBadge}>
                <Ionicons
                  name={getCategoryIcon(cat.category) as any}
                  size={18}
                  color="#000000"
                />
                <Text style={styles.patternLabel}>{cat.category}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[styles.progressBar, { width: `${cat.percentage}%` }]}
                />
              </View>
              <Text style={styles.percentText}>{cat.percentage}%</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No notes yet this week to analyze
            </Text>
          </View>
        )}

        {/* Activity Trends */}
        <Text style={styles.sectionTitle}>Daily Activity</Text>
        <View style={styles.chartCard}>
          {/* Add dotted lines */}
          <View style={styles.chartGridLines}>
            <View style={styles.dottedLine} />
            <View style={styles.dottedLine} />
            <View style={styles.dottedLine} />
            <View style={styles.dottedLine} />
          </View>
          <View style={styles.chartBars}>
            {dailyOrder.map((day, idx) => (
              <View key={idx} style={styles.barContainer}>
                <View
                  style={[styles.bar, { height: getDailyBarHeight(day) }]}
                />
                <Text style={styles.barLabel}>{day[0]}</Text>
                <Text style={styles.barCount}>
                  {analysis?.dailyCounts[day] || 0}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reflections & Insights */}
        {analysis && analysis.totalNotes > 0 && (
          <>
            <Text style={styles.sectionTitle}>Reflections for the Week</Text>
            
            {/* Primary reflection based on dominant category */}
            {analysis.topCategory && analysis.topCategory.percentage > 60 && (
              <View style={styles.recommendationCard}>
                <Ionicons
                  name={getCategoryIcon(analysis.topCategory.category) as any}
                  size={24}
                  color="#FFB052"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recommendationTitle}>
                    Reflect on: {analysis.topCategory.category}
                  </Text>
                  <Text style={styles.recommendationSubtext}>
                    {analysis.topCategory.percentage}% of your mental energy went to {analysis.topCategory.category.toLowerCase()} matters. 
                    {analysis.topCategory.category === "Work" && " Are there specific projects causing stress? What progress have you made? What can you delegate or simplify?"}
                    {analysis.topCategory.category === "Personal" && " What patterns do you notice in your personal thoughts? What's bringing you joy? What needs attention?"}
                    {analysis.topCategory.category === "Health" && " How is your body feeling? What health goals are you working toward? What small changes could you make?"}
                    {analysis.topCategory.category === "Ideas" && " Which ideas excite you most? What's one you could act on this week? What's stopping you?"}
                    {analysis.topCategory.category === "Tasks" && " What tasks keep reappearing? Which ones truly matter? What can you eliminate or automate?"}
                    {analysis.topCategory.category === "Learning" && " What are you discovering? How can you apply this knowledge? What's your next learning goal?"}
                  </Text>
                </View>
              </View>
            )}

            {/* Theme-based reflection */}
            {analysis.themes && analysis.themes.length > 0 && (
              <View style={styles.recommendationCard}>
                <Ionicons
                  name="book"
                  size={24}
                  color="#FFB052"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recommendationTitle}>
                    Recurring themes to explore
                  </Text>
                  <Text style={styles.recommendationSubtext}>
                    You've mentioned: {analysis.themes.slice(0, 4).join(', ')}. 
                    {"\n\n"}These topics keep coming up. What's the common thread? 
                    What's unresolved? Journal about why these themes matter to you right now.
                  </Text>
                </View>
              </View>
            )}

            {/* Balance reflection for diverse categories */}
            {analysis.categoryPercentages.length >= 3 && 
             analysis.topCategory && 
             analysis.topCategory.percentage < 50 && (
              <View style={styles.recommendationCard}>
                <Ionicons
                  name="git-network"
                  size={24}
                  color="#FFB052"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recommendationTitle}>
                    Notice: Balanced attention
                  </Text>
                  <Text style={styles.recommendationSubtext}>
                    Your thoughts span {analysis.categoryPercentages.length} life areas. 
                    This mental diversity is healthy! Consider: Are you giving each area 
                    the attention it deserves? What feels neglected? What's thriving?
                  </Text>
                </View>
              </View>
            )}

            {/* Consistency reflection */}
            {(() => {
              const activeDays = Object.values(analysis.dailyCounts).filter(c => c > 0).length;
              if (activeDays >= 5) {
                return (
                  <View style={styles.recommendationCard}>
                    <Ionicons
                      name="trophy"
                      size={24}
                      color="#FFB052"
                      style={{ marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recommendationTitle}>
                        Celebrate: Strong consistency
                      </Text>
                      <Text style={styles.recommendationSubtext}>
                        You brain dumped {activeDays} days this week! This regular practice 
                        helps you process thoughts before they become overwhelming. How has 
                        this habit impacted your mental clarity?
                      </Text>
                    </View>
                  </View>
                );
              } else if (activeDays <= 2) {
                return (
                  <View style={styles.recommendationCard}>
                    <Ionicons
                      name="calendar"
                      size={24}
                      color="#FFB052"
                      style={{ marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recommendationTitle}>
                        Consider: Daily brain dumps
                      </Text>
                      <Text style={styles.recommendationSubtext}>
                        You dumped thoughts on {activeDays} day{activeDays > 1 ? 's' : ''} this week. 
                        Try making it a daily habit - even 2 minutes before bed. What's preventing 
                        you from doing this more regularly?
                      </Text>
                    </View>
                  </View>
                );
              }
            })()}

            {/* Peak activity day reflection */}
            {(() => {
              const maxDay = Object.entries(analysis.dailyCounts).reduce(
                (max, [day, count]) =>
                  count > max.count ? { day, count } : max,
                { day: "", count: 0 }
              );
              return (
                maxDay.count >= 3 && (
                  <View style={styles.recommendationCard}>
                    <Ionicons
                      name="flame"
                      size={24}
                      color="#FF5500"
                      style={{ marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recommendationTitle}>
                        Notice: Peak activity on {maxDay.day}
                      </Text>
                      <Text style={styles.recommendationSubtext}>
                        You had {maxDay.count} brain dumps on {maxDay.day}. What happened 
                        that day? Was something stressful? Inspiring? Understanding your 
                        patterns helps you manage your mental load better.
                      </Text>
                    </View>
                  </View>
                )
              );
            })()}

            {/* Action prompt for ideas */}
            {analysis.topCategory && 
             analysis.topCategory.category === "Ideas" && 
             analysis.topCategory.count >= 3 && (
              <View style={styles.recommendationCard}>
                <Ionicons
                  name="rocket"
                  size={24}
                  color="#FFB052"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recommendationTitle}>
                    Challenge: From ideas to action
                  </Text>
                  <Text style={styles.recommendationSubtext}>
                    You've captured {analysis.topCategory.count} ideas this week. 
                    Pick ONE to act on today - even a tiny first step. Which idea 
                    keeps pulling at you? What's the smallest thing you could do right now?
                  </Text>
                </View>
              </View>
            )}

            {/* Work-life balance prompt */}
            {analysis.topCategory && 
             analysis.topCategory.category === "Work" && 
             analysis.topCategory.percentage > 70 && (
              <View style={styles.recommendationCard}>
                <Ionicons
                  name="alert-circle"
                  size={24}
                  color="#FF5500"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recommendationTitle}>
                    Reflect: Work-life integration
                  </Text>
                  <Text style={styles.recommendationSubtext}>
                    {analysis.topCategory.percentage}% of your thoughts are work-related. 
                    Is this intentional? What personal needs might you be overlooking? 
                    Schedule one non-work activity this week that brings you joy.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  brainIcon: {
    position: "relative",
    marginBottom: 12,
  },
  brainImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  statLabel: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
    marginTop: 8,
  },
  patternCard: {
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  patternBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFB052",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    gap: 6,
  },
  patternLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#FFE6C7",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFB052",
    borderRadius: 6,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    width: 45,
    textAlign: "right",
  },
  emptyCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    paddingTop: 15,
    paddingBottom: 8,
    paddingHorizontal: 20,
    marginBottom: 24,
    position: "relative",
  },
  chartGridLines: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    height: 120,
    justifyContent: "space-between",
    paddingVertical: 0,
  },
  dottedLine: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    width: "100%",
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    position: "relative",
    zIndex: 1,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    marginTop: 8,
  },
  bar: {
    width: 24,
    backgroundColor: "#FFB052",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  barCount: {
    fontSize: 12,
    color: "#666666",
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  recommendationSubtext: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});