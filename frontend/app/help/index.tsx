import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function Help() {
  const router = useRouter();
  const { colors } = useTheme();

  const faqs = [
    {
      question: "What is BrainDump?",
      answer: "BrainDump is your digital space to capture thoughts, ideas, tasks, and reflections. Think of it as a brain decluttering tool that helps you organize your mental space.",
    },
    {
      question: "How do I create a note?",
      answer: "Tap the '+' button on the Notes or Dump page. Choose a category, write your thoughts, and save. You can also quickly dump thoughts without organizing them first.",
    },
    {
      question: "What are categories for?",
      answer: "Categories help you organize your thoughts into Work, Personal, Health, Ideas, Tasks, and Learning. This makes it easier to review patterns and find specific notes later.",
    },
    {
      question: "How does the Review feature work?",
      answer: "The Review page analyzes your weekly notes to show patterns, themes, and insights. It helps you understand what's been occupying your mental space.",
    },
    {
      question: "What are Related Notes?",
      answer: "BrainDump automatically finds connections between your notes based on similar themes and content. This helps you discover patterns in your thinking.",
    },
    {
      question: "How do I delete my account?",
      answer: "Go to Settings > Delete Account. Note that this action is permanent and all your data will be lost.",
    },
  ];

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@braindump.app");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={[styles.welcomeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="help-circle" size={48} color={colors.primary} />
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>How can we help?</Text>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
            Find answers to common questions below, or contact our support team.
          </Text>
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

        {faqs.map((faq, index) => (
          <View key={index} style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
            </View>
            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
          </View>
        ))}

        {/* Contact Support */}
        <View style={[styles.contactCard, { backgroundColor: colors.primary, borderColor: colors.border }]}>
          <Ionicons name="mail" size={32} color={colors.text} />
          <Text style={[styles.contactTitle, { color: colors.text }]}>Still need help?</Text>
          <Text style={[styles.contactText, { color: colors.text }]}>
            Our support team is here to assist you with any questions or issues.
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={handleContactSupport}
          >
            <Text style={[styles.contactButtonText, { color: colors.text }]}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>BrainDump</Text>
          <Text style={[styles.infoVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Made with ❤️ to help you declutter your mind
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
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  welcomeCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 32,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },

  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  faqCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },

  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },

  faqQuestion: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },

  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 28,
  },

  contactCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },

  contactTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },

  contactText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },

  contactButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
  },

  contactButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  infoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  infoVersion: {
    fontSize: 14,
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    textAlign: "center",
  },
});