import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/expo';
import { Screen, TopBar, Surface } from '@/components/StudyUI';
import { useColors } from '@/hooks/useColors';
import { useStudy } from '@/context/StudyContext';

export default function ProfileScreen() {
  const colors = useColors();
  const { signOut } = useClerk();
  const { clearLocalData } = useStudy();
  const [reminders, setReminders] = useState(true);
  const [darkDesk, setDarkDesk] = useState(true);

  const toggle = (setter: (v: boolean) => void, value: boolean) => {
    Haptics.selectionAsync();
    setter(!value);
  };

  const logout = () => {
    Alert.alert(
      'Log out?',
      'This will sign you out and clear any local study data saved on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            clearLocalData();
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <TopBar title="Profile" subtitle="YOUR STUDY DESK" />

      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>M</Text>
        </View>

        <View>
          <Text style={[styles.name, { color: colors.foreground }]}>Maya Chen</Text>
          <Text style={[styles.email, { color: colors.mutedForeground }]}>maya.chen@study.space</Text>
        </View>

        <Pressable
          accessibilityLabel="Edit profile"
          style={[styles.edit, { backgroundColor: colors.secondary }]}
          onPress={() => Alert.alert('Profile', 'Your profile is ready for your next study session.')}
        >
          <Ionicons name="pencil" size={16} color={colors.accent} />
        </Pressable>
      </View>

      <Surface style={styles.level}>
        <View>
          <Text style={[styles.kicker, { color: colors.accent }]}>CURRENT LEVEL</Text>
          <Text style={[styles.levelTitle, { color: colors.foreground }]}>Focused learner</Text>
        </View>
        <Text style={[styles.points, { color: colors.primary }]}>640 <Text style={[styles.detail, { color: colors.mutedForeground }]}>pts</Text></Text>
      </Surface>

      <Text style={[styles.section, { color: colors.foreground }]}>Preferences</Text>

      <Surface style={{ paddingVertical: 4 }}>
        <Setting
          icon="notifications-outline"
          title="Study reminders"
          detail="A gentle nudge at 7:30 PM"
          value={reminders}
          onChange={() => toggle(setReminders, reminders)}
        />
        <Setting
          icon="moon-outline"
          title="Midnight desk"
          detail="Keep the focused dark palette for late-night study"
          value={darkDesk}
          onChange={() => toggle(setDarkDesk, darkDesk)}
        />
      </Surface>

      <Pressable
        accessibilityLabel="Log out"
        style={[styles.logout, { borderColor: colors.border, backgroundColor: 'rgba(248,113,113,0.08)' }]}
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={16} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Log out</Text>
      </Pressable>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>v1.0.0</Text>
    </Screen>
  );
}

function Setting({
  icon,
  title,
  detail,
  value,
  onChange,
}: {
  icon: any;
  title: string;
  detail: string;
  value: boolean;
  onChange?: () => void;
}) {
  const colors = useColors();

  return (
    <View style={styles.setting}>
      <View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={!onChange}
        trackColor={{ false: colors.muted, true: colors.accent }}
        thumbColor={colors.foreground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 10, marginBottom: 20 },
  avatar: { width: 57, height: 57, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  edit: { marginLeft: 'auto', width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  level: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3 },
  levelTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 6 },
  points: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  section: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 12 },
  setting: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(142,164,192,0.14)',
  },
  settingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  logout: { height: 48, borderRadius: 15, borderWidth: 1, marginTop: 28, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  version: { textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 18 },
});
