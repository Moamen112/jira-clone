import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  IconButton,
  Input,
  Textarea,
  Badge,
  Avatar,
  AvatarGroup,
  Divider,
  Spinner,
  Skeleton,
  Modal,
  Dropdown,
  Toast,
} from '../src/components/base';
import { colors } from '../src/tokens/colors';
import { spacing } from '../src/tokens/spacing';
import { radius } from '../src/tokens/radius';

export default function HomeScreen() {
  // Interactive UI states
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('in_progress');
  const [titleInput, setTitleInput] = useState('Implement drag-and-drop board');
  const [descInput, setDescInput] = useState(
    'Support smooth column movement on mobile and web using shared business logic.'
  );

  const mockMembers = [
    { name: 'Alex Morgan' },
    { name: 'Sarah Connor' },
    { name: 'David Kim' },
    { name: 'Elena Rostova' },
    { name: 'Marcus Brody' },
  ];

  const statusOptions = [
    { label: 'To Do', value: 'todo', description: 'Pending implementation' },
    { label: 'In Progress', value: 'in_progress', description: 'Currently active' },
    { label: 'In Review', value: 'in_review', description: 'Awaiting review' },
    { label: 'Done', value: 'done', description: 'Completed and verified' },
  ];

  const handleSimulateAction = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
      setToastVisible(true);
    }, 800);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text variant="display" bold>
            Fieldnotes
          </Text>
          <Text variant="subheading" muted style={{ marginTop: 2 }}>
            Base UI Components Showcase
          </Text>
        </View>

        {/* 1. Typography */}
        <View style={styles.sectionCard}>
          <Text variant="sectionLabel" muted style={styles.sectionTitle}>
            1. TYPOGRAPHY (Fieldnotes Scale)
          </Text>
          <Text variant="heading" bold>Heading 20px Bold</Text>
          <Text variant="subheading" bold style={{ marginTop: 4 }}>Subheading 17px</Text>
          <Text variant="body" style={{ marginTop: 4 }}>
            Body regular 16px. Primary reading text for descriptions, comments, and issue details.
          </Text>
          <Text variant="bodySmall" muted style={{ marginTop: 4 }}>
            BodySmall 14px muted. Secondary text for metadata and timestamps.
          </Text>
          <View style={styles.monoRow}>
            <Text variant="monoKey">FIELD-102</Text>
            <Text variant="monoData" muted style={{ marginLeft: 12 }}>
              Updated 2h ago · 340ms
            </Text>
          </View>
        </View>

        {/* 2. Badges */}
        <View style={styles.sectionCard}>
          <Text variant="sectionLabel" muted style={styles.sectionTitle}>
            2. BADGES & STATUS PILLS
          </Text>
          <View style={styles.wrapRow}>
            <Badge label="FIELD-14" variant="mono" />
            <Badge label="To Do" variant="neutral" />
            <Badge label="In Progress" variant="accent" />
            <Badge label="In Review" variant="warn" />
            <Badge label="Done" variant="done" />
            <Badge label="Publisher" variant="default" />
            <Badge label="Assignee" variant="accent" />
          </View>
        </View>

        {/* 3. Avatars & Avatar Groups */}
        <View style={styles.sectionCard}>
          <Text variant="sectionLabel" muted style={styles.sectionTitle}>
            3. AVATARS & MEMBERS
          </Text>
          <View style={styles.row}>
            <Avatar name="Alex Morgan" size="xl" />
            <Avatar name="Sarah Connor" size="lg" />
            <Avatar name="David Kim" size="md" />
            <Avatar name="Elena Rostova" size="sm" />
            <Avatar unassigned size="md" />
          </View>

          <Divider margin={3} />

          <View style={styles.rowBetween}>
            <Text variant="label">Project Members Stack:</Text>
            <AvatarGroup users={mockMembers} max={3} size="md" />
          </View>
        </View>

        {/* 4. Buttons & Icon Buttons */}
        <View style={styles.sectionCard}>
          <Text variant="sectionLabel" muted style={styles.sectionTitle}>
            4. BUTTONS & ACTIONS
          </Text>
          <View style={styles.wrapRow}>
            <Button label="Primary Button" variant="primary" />
            <Button label="Secondary" variant="secondary" />
            <Button label="Destructive" variant="danger" />
            <Button label="Ghost" variant="ghost" />
          </View>

          <View style={[styles.row, { marginTop: spacing[3] }]}>
            <Button
              label={buttonLoading ? 'Updating...' : 'Test Async Action'}
              variant="primary"
              loading={buttonLoading}
              onPress={handleSimulateAction}
            />
            <Button label="Small" size="sm" variant="secondary" />
          </View>

          <Divider margin={3} />

          <Text variant="label" style={{ marginBottom: spacing[2] }}>
            Icon Buttons (44px tap targets):
          </Text>
          <View style={styles.row}>
            <IconButton
              variant="secondary"
              icon={<Text variant="body" bold>⋯</Text>}
            />
            <IconButton
              variant="ghost"
              icon={<Text variant="body" bold>🔍</Text>}
            />
            <IconButton
              variant="primary"
              icon={<Text variant="body" bold color="#FFF">+</Text>}
            />
            <IconButton
              variant="danger"
              icon={<Text variant="body" bold color="#FFF">✕</Text>}
            />
          </View>
        </View>

        {/* 5. Inputs & Textarea */}
        <View style={styles.sectionCard}>
          <Text variant="sectionLabel" muted style={styles.sectionTitle}>
            5. FORM INPUTS
          </Text>
          <Input
            label="Card Title"
            value={titleInput}
            onChangeText={setTitleInput}
            placeholder="What needs to be done?"
            hint="Press tab or enter to submit"
          />

          <Input
            label="Input with Error Validation"
            defaultValue="Invalid issue format"
            error="Project key does not exist."
          />

          <Textarea
            label="Card Description"
            value={descInput}
            onChangeText={setDescInput}
            maxLength={200}
            showCount
            placeholder="Add detailed context..."
          />
        </View>

        {/* 6. Dropdown (Mobile Action Picker) */}
        <View style={styles.sectionCard}>
          <Text variant="sectionLabel" muted style={styles.sectionTitle}>
            6. DROPDOWN (Mobile Sheet Selector)
          </Text>
          <Dropdown
            label="Transition Status"
            options={statusOptions}
            value={selectedStatus}
            onSelect={(val) => {
              setSelectedStatus(val);
              setToastVisible(true);
            }}
            searchable
          />
        </View>

        {/* 7. Loading States (Spinner & Skeleton) */}
        <View style={styles.sectionCard}>
          <Text variant="sectionLabel" muted style={styles.sectionTitle}>
            7. LOADING STATES (Spinner & Skeleton)
          </Text>
          <View style={styles.row}>
            <Spinner size="small" label="Updating status..." direction="row" />
          </View>

          <Divider margin={3} />

          <Text variant="label" style={{ marginBottom: spacing[2] }}>
            Card Shimmer Skeleton:
          </Text>
          <View style={styles.skeletonCard}>
            <View style={styles.rowBetween}>
              <Skeleton width={60} height={18} />
              <Skeleton circle width={28} height={28} />
            </View>
            <Skeleton width="90%" height={16} style={{ marginTop: 10 }} />
            <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
          </View>
        </View>

        {/* 8. Overlays (Modal & Toast) */}
        <View style={styles.sectionCard}>
          <Text variant="sectionLabel" muted style={styles.sectionTitle}>
            8. INTERACTIVE MODAL & NOTIFICATIONS
          </Text>
          <Button
            label="Open Bottom Sheet Modal"
            variant="primary"
            fullWidth
            onPress={() => setModalVisible(true)}
          />
          <Button
            label="Show Toast Notification"
            variant="secondary"
            fullWidth
            style={{ marginTop: spacing[2] }}
            onPress={() => setToastVisible(true)}
          />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Interactive Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Issue Details (FIELD-14)"
        subtitle="PROJECT / SPRINT 2"
        footer={
          <View style={styles.modalFooter}>
            <Button
              label="Close"
              variant="secondary"
              onPress={() => setModalVisible(false)}
            />
            <Button
              label="Save Changes"
              variant="primary"
              onPress={() => {
                setModalVisible(false);
                setToastVisible(true);
              }}
            />
          </View>
        }
      >
        <Text variant="heading" bold>
          {titleInput}
        </Text>
        <Text variant="body" muted style={{ marginTop: 8, lineHeight: 22 }}>
          {descInput}
        </Text>

        <Divider margin={4} />

        <View style={styles.rowBetween}>
          <Text variant="label">Current Status:</Text>
          <Badge
            label={selectedStatus.replace('_', ' ').toUpperCase()}
            variant="accent"
          />
        </View>

        <View style={[styles.rowBetween, { marginTop: spacing[3] }]}>
          <Text variant="label">Assignee:</Text>
          <View style={styles.row}>
            <Avatar name="Sarah Connor" size="sm" />
            <Text variant="bodySmall" bold style={{ marginLeft: 6 }}>
              Sarah Connor
            </Text>
          </View>
        </View>
      </Modal>

      {/* Interactive Toast Notification */}
      <Toast
        visible={toastVisible}
        message="Status updated to In Progress successfully."
        variant="success"
        actionLabel="Undo"
        onAction={() => setToastVisible(false)}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.paper,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[4],
  },
  sectionCard: {
    backgroundColor: colors.light.surface,
    padding: spacing[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.light.line,
    marginBottom: spacing[4],
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginBottom: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  monoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    backgroundColor: colors.light.paper,
    padding: spacing[2],
    borderRadius: radius.input,
  },
  skeletonCard: {
    backgroundColor: colors.light.paper,
    padding: spacing[3],
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.light.line,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
  },
});
