import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { colors } from '@chatx/config';

export default function ProfileScreen() {
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifMeetings, setNotifMeetings] = useState(true);
  const [notifMentions, setNotifMentions] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const bg = colors.semantic.dark.background;
  const card = colors.semantic.dark.card;
  const border = colors.semantic.dark.border;
  const fg = colors.semantic.dark.foreground;
  const muted = colors.semantic.dark.mutedForeground;
  const primary = colors.primitives.primary[500];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.section, { backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.sectionTitle, { color: muted }]}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) => (
    <View style={[styles.row, { borderTopColor: border }]}>
      <Text style={[styles.rowLabel, { color: fg }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#374151', true: primary + '88' }}
        thumbColor={value ? primary : '#6b7280'}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Text style={[styles.title, { color: fg }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Card */}
        <View style={[styles.avatarCard, { backgroundColor: card, borderColor: border }]}>
          <View style={[styles.avatar, { backgroundColor: primary }]}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <View>
            <Text style={[styles.name, { color: fg }]}>ChatX User</Text>
            <Text style={[styles.email, { color: muted }]}>user@chatx.io</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#22c55e33' }]}>
              <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>● Online</Text>
            </View>
          </View>
        </View>

        <Section title="NOTIFICATIONS">
          <SettingRow label="Direct Messages" value={notifMessages} onToggle={setNotifMessages} />
          <SettingRow label="Meeting Alerts" value={notifMeetings} onToggle={setNotifMeetings} />
          <SettingRow label="Mentions & Replies" value={notifMentions} onToggle={setNotifMentions} />
        </Section>

        <Section title="APPEARANCE">
          <SettingRow label="Dark Mode" value={darkMode} onToggle={setDarkMode} />
        </Section>

        <Section title="ACCOUNT">
          <TouchableOpacity style={[styles.row, { borderTopColor: border }]}>
            <Text style={[styles.rowLabel, { color: fg }]}>Edit Profile</Text>
            <Text style={{ color: muted }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderTopColor: border }]}>
            <Text style={[styles.rowLabel, { color: fg }]}>Change Password</Text>
            <Text style={{ color: muted }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderTopColor: border }]}>
            <Text style={[styles.rowLabel, { color: '#ef4444' }]}>Sign Out</Text>
            <Text style={{ color: muted }}>›</Text>
          </TouchableOpacity>
        </Section>

        <Text style={[styles.version, { color: muted }]}>ChatX Mobile v0.1.0 · Powered by Supabase</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 12, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16, gap: 16 },
  avatarCard: { flexDirection: 'row', gap: 14, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  email: { fontSize: 12, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  section: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, padding: 12, paddingBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTopWidth: 1 },
  rowLabel: { fontSize: 14 },
  version: { textAlign: 'center', fontSize: 11, marginTop: 8 },
});
