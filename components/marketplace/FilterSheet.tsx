/**
 * FilterSheet — Bottom-sheet modal for marketplace filters.
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Pressable, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import {
  Source, Condition, SortKey,
  CONDITIONS, SORTS, SIZES,
} from './constants';

interface Props {
  visible: boolean;
  onClose: () => void;
  // filter state
  source: Source;
  setSource: (v: Source) => void;
  condition: Condition;
  setCondition: (v: Condition) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  onReset: () => void;
  resultCount: number;
}

export default function FilterSheet({
  visible, onClose,
  source, setSource,
  condition, setCondition,
  sort, setSort,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  selectedSizes, toggleSize,
  onReset,
  resultCount,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>FILTERS</Text>
            <TouchableOpacity onPress={onReset}>
              <Text style={styles.sheetReset}>RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Source */}
            <Text style={styles.filterSectionLabel}>SOURCE</Text>
            <View style={styles.filterRow}>
              {([['all', 'All listings'], ['brand', 'Partner brands'], ['user', 'User listings']] as [Source, string][]).map(([k, l]) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.filterOption, source === k && styles.filterOptionActive]}
                  onPress={() => setSource(k)}
                >
                  <Text style={[styles.filterOptionText, source === k && styles.filterOptionTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Condition */}
            <Text style={styles.filterSectionLabel}>CONDITION</Text>
            <View style={styles.filterRow}>
              {CONDITIONS.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.filterOption, condition === c.key && styles.filterOptionActive]}
                  onPress={() => setCondition(c.key)}
                >
                  <Text style={[styles.filterOptionText, condition === c.key && styles.filterOptionTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price */}
            <Text style={styles.filterSectionLabel}>PRICE RANGE (€)</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>MIN</Text>
                <TextInput
                  style={styles.priceField}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>MAX</Text>
                <TextInput
                  style={styles.priceField}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="999"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Size */}
            <Text style={styles.filterSectionLabel}>SIZE</Text>
            <View style={styles.sizeGrid}>
              {SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeChip, selectedSizes.includes(s) && styles.sizeChipActive]}
                  onPress={() => toggleSize(s)}
                >
                  <Text style={[styles.sizeChipText, selectedSizes.includes(s) && styles.sizeChipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort */}
            <Text style={styles.filterSectionLabel}>SORT BY</Text>
            <View style={styles.filterCol}>
              {SORTS.map((s) => (
                <TouchableOpacity key={s.key} style={styles.sortRow} onPress={() => setSort(s.key)}>
                  <Text style={[styles.sortLabel, sort === s.key && styles.sortLabelActive]}>{s.label}</Text>
                  {sort === s.key && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyBtnText}>
              SHOW {resultCount} RESULT{resultCount !== 1 ? 'S' : ''}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, maxHeight: '88%' },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  sheetTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 2 },
  sheetReset: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.accentWarm, marginRight: Spacing.lg, letterSpacing: 1, textTransform: 'uppercase' },
  filterSectionLabel: {
    fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.sm, marginTop: Spacing.lg,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  filterCol: { gap: 1 },
  filterOption: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  filterOptionActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterOptionText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterOptionTextActive: { color: '#FFF' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priceInput: { flex: 1, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  priceLabel: { fontSize: 9, fontWeight: FontWeight.black, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  priceField: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  priceDivider: { width: 16, height: 1, backgroundColor: Colors.border },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sizeChip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border, minWidth: 48, alignItems: 'center' },
  sizeChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  sizeChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase' },
  sizeChipTextActive: { color: '#FFF' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  sortLabelActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  applyBtn: { backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', height: 48, marginTop: Spacing.md, marginBottom: 32 },
  applyBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: 2, textTransform: 'uppercase' },
});
