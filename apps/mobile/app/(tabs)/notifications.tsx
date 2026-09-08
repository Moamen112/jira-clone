import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import {
  Text,
  Badge,
  Avatar,
  Divider,
} from '../../src/components/base';
import { colors } from '../../src/tokens/colors';
import { spacing } from '../../src/tokens/spacing';
import { radius } from '../../src/tokens/radius';

interface NotificationItem {
  id: string;
  actor: { name: string; avatarUrl?: string };
  actionText: string;
  issueKey: string;
  issueTitle: string;
  timeAgo: string;
  unread: boolean;
  statusVariant?: 'accent' | 'warn' | 'neutral' | 'done';
  statusLabel?: string;
}

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      actor: { name: 'Sarah Connor' },
      actionText: 'assigned you to',
      issueKey: 'FIELD-14',
      issueTitle: 'Implement bottom tabs layout and navigation',
      timeAgo: '5m ago',
      unread: true,
      statusVariant: 'accent',
      statusLabel: 'In Progress',
    },
    {
      id: 'notif-2',
      actor: { name: 'Alex Morgan' },
      actionText: 'commented on',
      issueKey: 'FIELD-2',
      issueTitle: 'Design card-level permission system',
      timeAgo: '1h ago',
      unread: true,
      statusVariant: 'accent',
      statusLabel: 'In Progress',
    },
    {
      id: 'notif-3',
      actor: { name: 'David Kim' },
      actionText: 'moved to Done',
      issueKey: 'FIELD-1',
      issueTitle: 'Implement design tokens and typography hierarchy',
      timeAgo: 'Yesterday',
      unread: false,
      statusVariant: 'done',
      statusLabel: 'Done',
    },
    {
      id: 'notif-4',
      actor: { name: 'Elena Rostova' },
      actionText: 'created issue in To Do',
      issueKey: 'FIELD-8',
      issueTitle: 'Add offline optimistic cache for mobile cards',
      timeAgo: '2d ago',
      unread: false,
      statusVariant: 'neutral',
      statusLabel: 'To Do',
    },
  ];

  const filtered = filter === 'unread'
    ? notifications.filter((n) => n.unread)
    : notifications;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setFilter('all')}
          style={[
            styles.filterPill,
            filter === 'all' && styles.filterPillActive,
          ]}
        >
          <Text
            variant="caption"
            bold
            color={filter === 'all' ? '#FFFFFF' : colors.light.ink}
          >
            All Notifications
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter('unread')}
          style={[
            styles.filterPill,
            filter === 'unread' && styles.filterPillActive,
          ]}
        >
          <Text
            variant="caption"
            bold
            color={filter === 'unread' ? '#FFFFFF' : colors.light.ink}
          >
            Unread (2)
          </Text>
        </Pressable>
      </View>

      {/* Notifications Feed */}
      {filtered.map((item) => (
        <View
          key={item.id}
          style={[
            styles.notificationCard,
            item.unread && styles.unreadCard,
          ]}
        >
          <View style={styles.cardTop}>
            <Avatar name={item.actor.name} size="md" />

            <View style={styles.cardMain}>
              <Text variant="bodySmall" style={{ lineHeight: 20 }}>
                <Text variant="bodySmall" bold>
                  {item.actor.name}
                </Text>{' '}
                {item.actionText}{' '}
                <Text variant="monoKey" bold>
                  {item.issueKey}
                </Text>
              </Text>

              <Text variant="bodySmall" muted numberOfLines={1} style={{ marginTop: 2 }}>
                {item.issueTitle}
              </Text>

              <View style={styles.metaRow}>
                <Text variant="caption" muted>
                  {item.timeAgo}
                </Text>
                {item.statusLabel && (
                  <Badge
                    label={item.statusLabel}
                    variant={item.statusVariant}
                    size="sm"
                  />
                )}
              </View>
            </View>

            {item.unread && <View style={styles.unreadDot} />}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.paper,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[6],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  filterPill: {
    paddingVertical: spacing[1] + 2,
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.line,
  },
  filterPillActive: {
    backgroundColor: colors.light.accent,
    borderColor: colors.light.accent,
  },
  notificationCard: {
    backgroundColor: colors.light.surface,
    padding: spacing[3],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.light.line,
    marginBottom: spacing[3],
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.light.accent,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardMain: {
    flex: 1,
    marginLeft: spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.light.accent,
    marginTop: 4,
  },
});
