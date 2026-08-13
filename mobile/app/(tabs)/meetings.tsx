import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@chatx/config';

const MOCK_MEETINGS = [
  { id: '1', title: 'ChatX Architecture Sync', time: '10:00 AM', duration: '45 min', participants: 6, status: 'live' },
  { id: '2', title: 'Frontend Design Review', time: '2:00 PM', duration: '30 min', participants: 4, status: 'upcoming' },
  { id: '3', title: 'WebRTC Infrastructure', time: 'Yesterday 3 PM', duration: '1h 20min', participants: 3, status: 'ended' },
];

export default function MeetingsScreen() {
  const [joining, setJoining] = useState<string | null>(null);
  const bg = colors.semantic.dark.background;
  const card = colors.semantic.dark.card;
  const border = colors.semantic.dark.border;
  const fg = colors.semantic.dark.foreground;
  const muted = colors.semantic.dark.mutedForeground;
  const primary = colors.primitives.primary[500];

  const statusColor = (s: string) => ({
    live: '#ef4444',
    upcoming: '#f59e0b',
    ended: '#6b7280',
  }[s] || '#6b7280');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Text style={[styles.title, { color: fg }]}>Meetings</Text>
      </View>

      <TouchableOpacity style={[styles.newMeetingBtn, { backgroundColor: primary }]}>
        <Text style={styles.newMeetingText}>+ Start Instant Meeting</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.list}>
        {MOCK_MEETINGS.map((m) => (
          <View key={m.id} style={[styles.card, { backgroundColor: card, borderColor: border }]}>
            <View style={styles.cardTop}>
              <View style={[styles.statusDot, { backgroundColor: statusColor(m.status) }]} />
              <Text style={[styles.cardTitle, { color: fg }]}>{m.title}</Text>
            </View>
            <Text style={[styles.cardMeta, { color: muted }]}>
              {m.time} · {m.duration} · {m.participants} participants
            </Text>
            {m.status !== 'ended' && (
              <TouchableOpacity
                onPress={() => setJoining(m.id)}
                style={[styles.joinBtn, { backgroundColor: m.status === 'live' ? '#ef4444' : primary }]}
              >
                <Text style={styles.joinText}>
                  {joining === m.id ? 'Joining...' : m.status === 'live' ? 'Join Live Meeting' : 'Join When Starts'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 12, borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  newMeetingBtn: { margin: 12, padding: 14, borderRadius: 12, alignItems: 'center' },
  newMeetingText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  list: { padding: 12, gap: 10 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  cardMeta: { fontSize: 12 },
  joinBtn: { marginTop: 8, padding: 10, borderRadius: 8, alignItems: 'center' },
  joinText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
