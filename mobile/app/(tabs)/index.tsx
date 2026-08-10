import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors } from '@chatx/config';

export default function MobileHomeScreen() {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.semantic.dark.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.semantic.dark.foreground }]}>ChatX Mobile</Text>
        <View style={[styles.badge, { backgroundColor: colors.primitives.primary[600] }]}>
          <Text style={styles.badgeText}>Phase 1 Active</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.semantic.dark.card, borderColor: colors.semantic.dark.border }]}>
        <Text style={[styles.cardTitle, { color: colors.semantic.dark.foreground }]}>
          Industrial-Grade Platform
        </Text>
        <Text style={[styles.cardSub, { color: colors.semantic.dark.mutedForeground }]}>
          Telegram-speed messaging, Google Meet video conferencing, and permission-aware AI intelligence.
        </Text>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primitives.primary[500] }]}>
        <Text style={styles.buttonText}>Start Instant Meeting</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
