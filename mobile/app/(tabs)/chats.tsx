import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '@chatx/config';

const MOCK_CHATS = [
  { id: '1', name: 'Architecture & Engineering', lastMessage: 'SFU latency is down to 24ms ✅', time: '09:45', unread: 3, type: 'channel' },
  { id: '2', name: 'Sarah Jenkins', lastMessage: 'Can we schedule a call at 2PM?', time: '09:30', unread: 1, type: 'dm' },
  { id: '3', name: 'Frontend & Design', lastMessage: 'Pushed the new design tokens', time: '09:12', unread: 0, type: 'channel' },
  { id: '4', name: 'Alex Mercer', lastMessage: 'Thanks! LGTM 🚀', time: '08:55', unread: 0, type: 'dm' },
  { id: '5', name: 'WebRTC Infrastructure', lastMessage: 'Meeting recording is ready', time: 'Yesterday', unread: 0, type: 'channel' },
];

export default function ChatsScreen() {
  const bg = colors.semantic.dark.background;
  const card = colors.semantic.dark.card;
  const border = colors.semantic.dark.border;
  const fg = colors.semantic.dark.foreground;
  const muted = colors.semantic.dark.mutedForeground;
  const primary = colors.primitives.primary[500];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Text style={[styles.title, { color: fg }]}>Messages</Text>
        <View style={[styles.badge, { backgroundColor: primary }]}>
          <Text style={styles.badgeText}>4 Unread</Text>
        </View>
      </View>

      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.chatRow, { backgroundColor: card, borderColor: border }]}>
            <View style={[styles.avatar, { backgroundColor: item.type === 'dm' ? primary + '33' : primary + '22' }]}>
              <Text style={[styles.avatarText, { color: primary }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatTop}>
                <Text style={[styles.chatName, { color: fg }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.chatTime, { color: muted }]}>{item.time}</Text>
              </View>
              <View style={styles.chatBottom}>
                <Text style={[styles.chatPreview, { color: muted }]} numberOfLines={1}>{item.lastMessage}</Text>
                {item.unread > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: primary }]}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
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
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  list: { padding: 12, gap: 8 },
  chatRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 12, borderWidth: 1, gap: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: 'bold' },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 },
  chatTime: { fontSize: 11 },
  chatBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatPreview: { fontSize: 12, flex: 1, marginRight: 8 },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
