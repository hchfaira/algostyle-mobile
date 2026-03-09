/**
 * Reusable Button — ASOS-style: bold, solid, no gradients
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 18 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const textSizes = {
    sm: FontSize.sm,
    md: FontSize.md,
    lg: FontSize.md,
  };

  const variantBg: Record<string, ViewStyle> = {
    primary: { backgroundColor: Colors.accent },
    secondary: { backgroundColor: Colors.surfaceLight },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.accent },
    ghost: { backgroundColor: 'transparent' },
  };

  const variantText: Record<string, TextStyle> = {
    primary: { color: Colors.textOnAccent },
    secondary: { color: Colors.textPrimary },
    outline: { color: Colors.accent },
    ghost: { color: Colors.textPrimary },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyles[size],
        variantBg[variant],
        disabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.textOnAccent : Colors.accent} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              styles.text,
              variantText[variant],
              { fontSize: textSizes[size] },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrapper: {
    marginRight: 2,
  },
  text: {
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.4,
  },
});
