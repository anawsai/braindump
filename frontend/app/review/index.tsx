import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ReviewPage() {
  const router = useRouter();

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
          <Text style={styles.summaryText}>
            You've been highly focused on work this week with increased stress
            about __ deadlines. Your brain dumps show 3x more work-related
            thoughts than usual. Consider scheduling that team meeting you
            mentioned 5 times.
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Brain Dumps */}
            <View style={styles.statCard}>
            <View style={styles.brainIcon}>
                <Image 
                source={require('../../assets/reviewbrainicon.png')} 
                style={styles.brainImage}
                />
            </View>
            <Text style={styles.statNumber}>12</Text>
            </View>

          {/* Completed Tasks */}
          <View style={styles.statCard}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>2</Text>
          </View>
        </View>

        {/* Thinking Patterns */}
        <Text style={styles.sectionTitle}>Thinking Patterns</Text>

        <View style={styles.patternCard}>
          <View style={styles.patternBadge}>
            <Ionicons name="briefcase" size={18} color="#000000" />
            <Text style={styles.patternLabel}>Work</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: "65%" }]} />
          </View>
          <Text style={styles.percentText}>65%</Text>
        </View>

        <View style={styles.patternCard}>
          <View style={styles.patternBadge}>
            <Ionicons name="fitness" size={18} color="#000000" />
            <Text style={styles.patternLabel}>Health</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: "45%" }]} />
          </View>
          <Text style={styles.percentText}>45%</Text>
        </View>

        {/* Stress Trends */}
        <Text style={styles.sectionTitle}>Stress Trends</Text>
        <View style={styles.chartCard}>
        {/* Add dotted lines */}
        <View style={styles.chartGridLines}>
            <View style={styles.dottedLine} />
            <View style={styles.dottedLine} />
            <View style={styles.dottedLine} />
            <View style={styles.dottedLine} />
        </View>
        <View style={styles.chartBars}>
            <View style={styles.barContainer}>
            <View style={[styles.bar, { height: 40 }]} />
            <Text style={styles.barLabel}>M</Text>
            </View>
            <View style={styles.barContainer}>
            <View style={[styles.bar, { height: 80 }]} />
            <Text style={styles.barLabel}>T</Text>
            </View>
            <View style={styles.barContainer}>
            <View style={[styles.bar, { height: 60 }]} />
            <Text style={styles.barLabel}>W</Text>
            </View>
            <View style={styles.barContainer}>
            <View style={[styles.bar, { height: 50 }]} />
            <Text style={styles.barLabel}>T</Text>
            </View>
            <View style={styles.barContainer}>
            <View style={[styles.bar, { height: 120 }]} />
            <Text style={styles.barLabel}>F</Text>
            </View>
            <View style={styles.barContainer}>
            <View style={[styles.bar, { height: 90 }]} />
            <Text style={styles.barLabel}>S</Text>
            </View>
            <View style={styles.barContainer}>
            <View style={[styles.bar, { height: 100 }]} />
            <Text style={styles.barLabel}>S</Text>
            </View>
        </View>
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>Schedule that meeting</Text>
          <Text style={styles.recommendationSubtext}>
            (You've mentioned this 5 times, time to act.)
          </Text>
        </View>

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
    textAlign: "center",
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
    resizeMode: 'contain',
  },
  stressLines: {
    position: "absolute",
    top: -10,
    right: -10,
    fontSize: 20,
  },
  checkIcon: {
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
  chartCard: {
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    paddingTop: 15,     
    paddingBottom: 8,  
    paddingHorizontal: 20,
    marginBottom: 24,
    position: 'relative',
  },
  chartGridLines: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    height: 120,
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  dottedLine: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    width: '100%',
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    position: 'relative',
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
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 16,
    marginBottom: 12,
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
  },
});