import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HelpPage() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const faqs = [
    {
      question: "How do I create a note?",
      answer: "Click the '+ Add Note' button on the Notes page, or use the Dump page for quick brain dumps. Fill in the title and content, select a category, and hit Save.",
    },
    {
      question: "How do I edit or delete a note?",
      answer: "Click on any note card to view details. From there, you can click Edit to modify it or Delete to remove it permanently.",
    },
    {
      question: "What are categories and how do I use them?",
      answer: "Categories help organize your notes by topic (Work, Health, Personal, etc.). Select a category when creating or editing a note using the star icon.",
    },
    {
      question: "How does AI organization work?",
      answer: "When you click 'Save & Organize', our AI analyzes your note content and suggests relevant categories and connections.",
    },
    {
      question: "Can I search my notes?",
      answer: "Yes! Use the search bar at the top of the Notes page to search by title or content.",
    },
    {
      question: "How do I change my settings?",
      answer: "Click Settings in the sidebar to manage notifications, privacy, and appearance preferences.",
    },
  ];

  const openEmail = () => {
    Linking.openURL("mailto:support@braindump.app?subject=Help Request");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Quick Contact */}
        <View style={styles.quickContactCard}>
          <Ionicons name="mail" size={32} color="#FFB052" />
          <Text style={styles.quickContactTitle}>Need Quick Help?</Text>
          <Text style={styles.quickContactText}>
            Email us directly at support@braindump.app
          </Text>
          <TouchableOpacity style={styles.emailButton} onPress={openEmail}>
            <Text style={styles.emailButtonText}>Send Email</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expandedFAQ === index ? "chevron-up" : "chevron-down"}
                size={20}
                color="#000000"
              />
            </TouchableOpacity>
            {expandedFAQ === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </View>
        ))}

        {/* Quick Tips */}
        <Text style={styles.sectionTitle}>Quick Tips</Text>
        <View style={styles.tipsCard}>
          <View style={styles.tipRow}>
            <Ionicons name="bulb" size={20} color="#FFB052" />
            <Text style={styles.tipText}>
              Use the Dump page for quick, fleeting thoughts, then organize them
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="bulb" size={20} color="#FFB052" />
            <Text style={styles.tipText}>
              Check the Review page weekly to see patterns in your thinking
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="bulb" size={20} color="#FFB052" />
            <Text style={styles.tipText}>
              Tag notes with categories to find them faster later
            </Text>
          </View>
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
  quickContactCard: {
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  quickContactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginTop: 12,
    marginBottom: 8,
  },
  quickContactText: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  emailButton: {
    backgroundColor: "#FFB052",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  emailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
    marginTop: 8,
  },
  faqCard: {
    backgroundColor: "#FFDBB0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#333333",
    marginTop: 12,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: "#F7F4F1",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    padding: 12,
    fontSize: 14,
    color: "#000000",
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#FFB052",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  tipsCard: {
    backgroundColor: "#F7F4F1",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 16,
    marginBottom: 24,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
});