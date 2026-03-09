/**
 * Why AlgoStyle Tab — Feature showcase with expandable cards
 * Thin orchestrator — data in constants, UI in components/whyAlgostyle
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { TopBar, Button } from '../../components/ui';
import { FEATURES, FeatureCardItem, ExpandedCardSheet } from '../../components/whyAlgostyle';

export default function WhyAlgoStyleScreen() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const expandedFeature = FEATURES.find((f) => f.id === expandedCard);

  return (
    <View style={styles.container}>
      <TopBar title="Why AlgoStyle" hideProfile hideFavorites hideCart />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headline}>Why AlgoStyle</Text>
          <Text style={styles.subheadline}>
            Smart outfit guidance, sustainable insights, and fast try-on — built for a curated wardrobe.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          {FEATURES.map((feature, idx) => (
            <FeatureCardItem
              key={feature.id}
              feature={feature}
              index={idx}
              onExpand={() => setExpandedCard(feature.id)}
            />
          ))}
        </View>

        {/* Footer CTA */}
        <View style={styles.footerCta}>
          <Button
            title="Get Started"
            onPress={() => {}}
            variant="primary"
            fullWidth
            icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
          />
          <Text style={styles.footerText}>
            Already a member? Explore all features in the app.
          </Text>
        </View>
      </ScrollView>

      {/* Expanded Bottom Sheet Modal */}
      {expandedFeature && (
        <ExpandedCardSheet
          feature={expandedFeature}
          onClose={() => setExpandedCard(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerSection: { marginBottom: Spacing.xl, alignItems: 'center' },
  headline: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  subheadline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  cardsContainer: { gap: Spacing.sm, marginBottom: Spacing.xl },
  footerCta: { gap: Spacing.md, alignItems: 'center' },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
