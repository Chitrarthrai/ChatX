import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '@chatx/config';

const MOCK_CALLS = [
  { id: '1', name: 'Sarah Jenkins', type: 'incoming', duration: '12:34', time: 'Today 09:45', missed: false },
  { id: '2', name: 'Alex Mercer', type: 'outgoing', duration: '05:22', time: 'Today 08:30', missed: false },
  { id: '3', name: 'Michael Chen', type: 'incoming', duration: '—', time: 'Yesterday 3:14 PM', missed: true },
  { id: '4', name: 'Architecture Team', type: 'outgoing', duration: '45:00', time: 'Yesterday 2:00 PM', missed: false },
];

export default function CallsScreen() {
  const bg = colors.semantic.dark.background;
  const card = colors.semantic.dark.card;
  const border = colors.semantic.dark.border;
  const fg = colors.semantic.dark.foreground;
  const muted = colors.semantic.dark.mutedForeground;
  const primary = colors.primitives.primary[500];

  const typeColor = (type: string, missed: boolean) =>
    missed ? '#ef4444' : type === 'incoming' ? '#22c55e' : primary;

  const typeLabel = (type: string, missed: boolean) =>
    missed ? '↙ Missed' : type === 'incoming' ? '↙ Incoming' : '↗ Outgoing';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Text style={[styles.title, { color: fg }]}>Calls</Text>
        <TouchableOpacity style={[styles.newCallBtn, { backgroundColor: primary }]}>
          <Text style={styles.newCallText}>New Call</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_CALLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, { backgroundColor: card, borderColor: border }]}>
            <View style={[styles.avatar, { backgroundColor: primary + '33' }]}>
              <Text style={[styles.avatarText, { color: primary }]}>
                {item.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: fg }]}>{item.name}</Text>
              <Text style={[styles.sub, { color: typeColor(item.type, item.missed) }]}>
                {typeLabel(item.type, item.missed)} · {item.duration}
              </Text>
              <Text style={[styles.time, { color: muted }]}>{item.time}</Text>
            </View>
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: '#22c55e' + '33' }]}>
              <Text style={{ color: '#22c55e', fontSize: 16 }}>📞</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
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
  newCallBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  newCallText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  list: { padding: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  sub: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  time: { fontSize: 11 },
  callBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
