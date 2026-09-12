import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { CameraIcon } from '../../assets/icon';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { mockCurrentUser } from '@jira-clone/shared';
import { Text, Avatar, Badge, Divider, Button } from '../../src/components/base';
import { useTheme, spacing, radius } from '../../src/tokens';

/**
 * Profile tab — shows the signed-in (mock) user's details and lets them
 * pick a profile photo from the device media library (demo: local URI only).
 */
export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = mockCurrentUser;

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const handlePickPhoto = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        shape: 'oval',
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      // Permission denied or picker failed — keep the current photo.
    }
  };

  const handleLogout = () => {
    // No auth slice yet — just return to the auth screen.
    router.replace('/auth');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handlePickPhoto}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.avatarButtonPressed,
            ]}
          >
            <Avatar
              name={user.name}
              imageUrl={avatarUri ?? user.avatarUrl}
              size="xl"
              bordered
              borderColor={colors.paper}
            />
            {/* Camera badge overlay */}
            <View
              style={[
                styles.cameraBadge,
                { backgroundColor: colors.accent, borderColor: colors.paper },
              ]}
            >
              <CameraIcon size={14} color="#FFFFFF" />
            </View>
          </Pressable>

          {avatarUri && (
            <Pressable
              onPress={() => setAvatarUri(null)}
              accessibilityRole="button"
              accessibilityLabel="Reset profile photo"
              hitSlop={8}
              style={styles.resetLink}
            >
              <Text variant="link" color={colors.inkMuted}>
                Reset photo
              </Text>
            </Pressable>
          )}

          <Text variant="heading" bold align="center" style={styles.name}>
            {user.name}
          </Text>
          <Text variant="body" muted align="center" style={styles.email}>
            {user.email}
          </Text>
          <Badge label="Signed in" variant="done" size="sm" rounded style={styles.signedIn} />
        </View>

        {/* Details Card */}
        <View
          style={[
            styles.detailsCard,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
        >
          <View style={styles.detailRow}>
            <Text variant="label" muted style={styles.detailLabel}>
              Email
            </Text>
            <Text variant="bodySmall" numberOfLines={1} style={styles.detailValue}>
              {user.email}
            </Text>
          </View>

          <Divider margin={2} />

          <View style={styles.detailRow}>
            <Text variant="label" muted style={styles.detailLabel}>
              User ID
            </Text>
            <Text variant="monoKey" style={styles.detailValue} numberOfLines={1}>
              {user.id}
            </Text>
          </View>

          <Divider margin={2} />

          <View style={styles.detailRow}>
            <Text variant="label" muted style={styles.detailLabel}>
              Initials
            </Text>
            <Text variant="bodySmall" style={styles.detailValue}>
              {user.initials}
            </Text>
          </View>
        </View>

        {/* Logout */}
        <Button
          label="Logout"
          variant="danger"
          size="lg"
          fullWidth
          style={styles.logoutButton}
          onPress={handleLogout}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  avatarButton: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtonPressed: {
    opacity: 0.85,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetLink: {
    marginTop: spacing[1],
  },
  name: {
    marginTop: spacing[3],
  },
  email: {
    marginTop: spacing[1],
  },
  signedIn: {
    marginTop: spacing[3],
  },
  detailsCard: {
    alignSelf: 'stretch',
    borderRadius: radius.card,
    borderWidth: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginTop: spacing[5],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    alignSelf: 'stretch',
    marginTop: spacing[5],
  },
  detailLabel: {
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    marginLeft: spacing[2],
    textAlign: 'right',
  },
});