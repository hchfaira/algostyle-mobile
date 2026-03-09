/**
 * Build Outfit Modal — allows users to manually select items and create custom outfits
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  FadeOutDown,
} from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import { Button, Card, Chip } from './ui';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';
import type { GarmentItem, GarmentCategory } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLS = 2;
const ITEM_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / GRID_COLS;

interface BuildOutfitModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const CATEGORIES: GarmentCategory[] = [
  'top',
  'bottom',
  'dress',
  'outerwear',
  'shoes',
  'accessory',
];

export const BuildOutfitModal: React.FC<BuildOutfitModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | null>(null);
  const [outfitName, setOutfitName] = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { wardrobe, userId, addCustomOutfit } = useAppStore();

  // Filter wardrobe by category
  const filteredItems = useMemo(() => {
    if (!selectedCategory) {
      return wardrobe;
    }
    return wardrobe.filter((item) => item.attributes.category === selectedCategory);
  }, [wardrobe, selectedCategory]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCreateOutfit = async () => {
    if (!outfitName.trim()) {
      Alert.alert('Error', 'Please enter an outfit name');
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      setIsCreating(true);

      // Get selected garments
      const selectedGarments = wardrobe.filter((item) =>
        selectedItems.includes(item.id)
      );

      // Create outfit via API
      const response = await api.createCustomOutfit(userId, {
        name: outfitName,
        description: outfitDescription || undefined,
        garmentIds: selectedItems,
        isPublic: false,
      });

      if (response.success && response.outfit) {
        // Update Zustand store
        addCustomOutfit(response.outfit);

        Alert.alert('Success', `Outfit "${outfitName}" created!`);
        resetForm();
        onClose();
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create outfit'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedItems([]);
    setSelectedCategory(null);
    setOutfitName('');
    setOutfitDescription('');
  };

  const renderGarmentItem = ({ item }: { item: GarmentItem }) => {
    const isSelected = selectedItems.includes(item.id);
    const itemColor = item.attributes.color_hex || item.attributes.color_primary || Colors.surface;

    return (
      <TouchableOpacity
        onPress={() => handleSelectItem(item.id)}
        style={[styles.itemWrapper]}
      >
        <Card style={isSelected ? styles.itemCardSelected : styles.itemCard}>
          {/* Color Swatch */}
          <View
            style={[
              styles.colorSwatch,
              { backgroundColor: itemColor },
            ]}
          />

          {/* Selection Indicator */}
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}

          {/* Item Info */}
          <Text
            style={styles.itemName}
            numberOfLines={1}
          >
            {item.attributes.subcategory || item.attributes.category}
          </Text>

          <Text
            style={styles.itemCategory}
            numberOfLines={1}
          >
            {item.attributes.category}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutDown}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👁️ Build Outfit</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Outfit Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outfit Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Casual Friday Vibes"
            placeholderTextColor={Colors.textMuted}
            value={outfitName}
            onChangeText={setOutfitName}
            maxLength={50}
          />
        </View>

        {/* Outfit Description Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes about this outfit..."
            placeholderTextColor={Colors.textMuted}
            value={outfitDescription}
            onChangeText={setOutfitDescription}
            multiline
            numberOfLines={3}
            maxLength={150}
          />
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <Chip
              label="All"
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                label={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category as GarmentCategory)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Selected Items Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Selected Items ({selectedItems.length})
          </Text>
          {selectedItems.length > 0 ? (
            <View style={styles.selectedSummary}>
              {selectedItems.map((itemId) => {
                const item = wardrobe.find((w) => w.id === itemId);
                return item ? (
                  <Chip
                    key={itemId}
                    label={`${item.attributes.subcategory || item.attributes.category} (${item.attributes.color_primary})`}
                    onPress={() => handleSelectItem(itemId)}
                    selected
                  />
                ) : null;
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>No items selected yet</Text>
          )}
        </View>

        {/* Wardrobe Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Select Items ({filteredItems.length})
          </Text>
          {filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              renderItem={renderGarmentItem}
              keyExtractor={(item) => item.id}
              numColumns={GRID_COLS}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContent}
            />
          ) : (
            <Text style={styles.emptyText}>No items in this category</Text>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.actionGradient}
      >
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => {
              resetForm();
              onClose();
            }}
            style={styles.cancelButton}
          />
          <Button
            title={isCreating ? 'Creating...' : '✓ Create Outfit'}
            onPress={handleCreateOutfit}
            disabled={isCreating || selectedItems.length === 0 || !outfitName.trim()}
            style={styles.createButton}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 1000,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
    padding: Spacing.sm,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    paddingVertical: Spacing.md,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  categoryChip: {
    marginRight: Spacing.sm,
  },
  selectedSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  selectedChip: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  gridContent: {
    paddingBottom: Spacing.lg,
  },
  itemWrapper: {
    width: ITEM_WIDTH,
    marginHorizontal: (Spacing.md / 2),
  },
  itemCard: {
    padding: Spacing.sm,
    position: 'relative',
  },
  itemCardSelected: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  colorSwatch: {
    width: '100%',
    height: 80,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: FontSize.lg,
    color: Colors.background,
    fontWeight: FontWeight.bold,
  },
  itemName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  itemCategory: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  actionGradient: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
});
