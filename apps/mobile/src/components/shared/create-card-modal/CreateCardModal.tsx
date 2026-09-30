import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Modal, Button, Input, Textarea, Dropdown, Text } from '../../base';
import { AssigneeSelect } from '../assignee-select/AssigneeSelect';
import { useTheme, spacing, radius } from '../../../tokens';
import {
  type BoardColumn,
  type User,
  type CardTypeOption,
  DEFAULT_CARD_TYPES,
} from '@jira-clone/shared';

export interface CreateCardInput {
  title: string;
  type?: string;
  typeId?: number | string;
  columnId: string;
  assigneeId?: string | null;
  description?: string;
  dueDate?: string;
}

export interface CreateCardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: CreateCardInput) => void | Promise<void>;
  targetColumnId?: string;
  projectKey?: string;
  columns?: BoardColumn[];
  users?: User[];
  cardTypes?: CardTypeOption[];
  onAddType?: (name: string) => Promise<any>;
  loading?: boolean;
}

export const CreateCardModal: React.FC<CreateCardModalProps> = ({
  visible,
  onClose,
  onCreate,
  targetColumnId,
  projectKey,
  columns = [],
  users = [],
  cardTypes = [],
  onAddType,
  loading = false,
}) => {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Quick inline add type dialog/input state
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeError, setNewTypeError] = useState<string | undefined>();

  const busy = submitting || loading;

  const availableTypes = cardTypes.length > 0 ? cardTypes : DEFAULT_CARD_TYPES;

  // Reset form whenever modal becomes visible
  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setSelectedColumnId(targetColumnId || columns[0]?.id || 'col-todo');
      setSelectedTypeId(availableTypes[0]?.id || '1');
      setSelectedAssigneeId(null);
      setDueDate('');
      setTitleError(undefined);
      setFormError(undefined);
      setSubmitting(false);
      setIsAddingType(false);
      setNewTypeName('');
      setNewTypeError(undefined);
    }
  }, [visible, targetColumnId, columns, availableTypes]);

  const handleCreateType = async () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) {
      setNewTypeError('Type name cannot be empty.');
      return;
    }
    if (!onAddType) return;
    try {
      const created = await onAddType(trimmed);
      if (created?.id) {
        setSelectedTypeId(String(created.id));
      }
      setIsAddingType(false);
      setNewTypeName('');
      setNewTypeError(undefined);
    } catch (err: unknown) {
      setNewTypeError(err instanceof Error ? err.message : 'Failed to add type.');
    }
  };

  const validate = (): boolean => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError('Card title cannot be empty.');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (busy || !visible) return;
    if (!validate()) return;

    setFormError(undefined);

    const chosenColumnId = selectedColumnId || targetColumnId || columns[0]?.id || 'col-todo';
    const chosenType = availableTypes.find((t) => t.id === selectedTypeId);

    const result = onCreate({
      title: title.trim(),
      type: chosenType?.label || selectedTypeId || 'Task',
      typeId: selectedTypeId,
      columnId: chosenColumnId,
      assigneeId: selectedAssigneeId,
      description: description.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
    });

    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setSubmitting(true);
      (result as Promise<void>)
        .then(() => {
          setSubmitting(false);
          onClose();
        })
        .catch((err: unknown) => {
          setSubmitting(false);
          setFormError(
            err instanceof Error ? err.message : 'Failed to create card. Please try again.'
          );
        });
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (busy) return;
    onClose();
  };

  const activeColumn = columns.find((c) => c.id === (selectedColumnId || targetColumnId));
  const modalSubtitle = projectKey
    ? activeColumn
      ? `${projectKey} · ${activeColumn.title}`
      : projectKey
    : 'CARD';

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title="Create Card"
      subtitle={modalSubtitle}
      presentation="dialog"
      footer={
        <View style={styles.footer}>
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            disabled={busy}
            onPress={handleCancel}
          />
          <Button
            label="Create Card"
            variant="primary"
            size="sm"
            loading={busy}
            disabled={busy || !title.trim()}
            onPress={handleSubmit}
          />
        </View>
      }
    >
      <View style={styles.form}>
        {/* Title Input */}
        <Input
          label="Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError) setTitleError(undefined);
          }}
          placeholder="Enter card title..."
          error={titleError}
          autoFocus
          containerStyle={{ marginBottom: 0 }}
        />

        {/* Description Textarea */}
        <Textarea
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add a more detailed description of what needs to be done..."
          showCount
          maxLength={1000}
          containerStyle={{ marginBottom: 0 }}
        />

        {/* Status Dropdown */}
        {columns.length > 0 && (
          <Dropdown
            label="Status"
            value={selectedColumnId || targetColumnId || columns[0]?.id}
            options={columns.map((c) => ({
              label: c.title,
              value: c.id,
            }))}
            onSelect={(val) => setSelectedColumnId(val)}
            placeholder="Select status..."
          />
        )}

        {/* Issue Type Dropdown */}
        <Dropdown
          label="Type"
          value={selectedTypeId}
          options={availableTypes.map((t) => ({
            label: t.label,
            value: t.id,
          }))}
          onSelect={(val) => setSelectedTypeId(val)}
          placeholder="Select type..."
          searchable
          searchPlaceholder="Search type..."
          action={
            onAddType
              ? {
                  label: '+ Add new type',
                  onPress: (query) => {
                    setNewTypeName(query || '');
                    setNewTypeError(undefined);
                    setIsAddingType(true);
                  },
                }
              : undefined
          }
        />

        {/* Inline Create Type Section */}
        {isAddingType && (
          <View style={[styles.inlineAddBox, { borderColor: colors.line, backgroundColor: colors.paper }]}>
            <Input
              label="New issue type name"
              value={newTypeName}
              onChangeText={(text) => {
                setNewTypeName(text);
                if (newTypeError) setNewTypeError(undefined);
              }}
              error={newTypeError}
              placeholder="e.g. Spike, Subtask"
              containerStyle={{ marginBottom: spacing[2] }}
              autoFocus
            />
            <View style={styles.inlineAddActions}>
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={() => setIsAddingType(false)}
              />
              <Button
                label="Add Type"
                variant="primary"
                size="sm"
                onPress={handleCreateType}
              />
            </View>
          </View>
        )}

        {/* Assignee Field */}
        <AssigneeSelect
          label="Assignee"
          users={users}
          selectedUserId={selectedAssigneeId}
          multiple={false}
          onSelect={(id) => setSelectedAssigneeId(id)}
          placeholder="Unassigned"
          pickerPresentation="inline"
        />

        {/* Due Date Field */}
        <View style={styles.dueDateContainer}>
          <View style={styles.dueDateHeader}>
            <Text variant="label" style={styles.fieldLabel}>
              Due Date (optional)
            </Text>
            {Boolean(dueDate) && (
              <Pressable onPress={() => setDueDate('')}>
                <Text variant="caption" color={colors.inkMuted} style={styles.clearText}>
                  Clear
                </Text>
              </Pressable>
            )}
          </View>
          <Input
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Form Error Banner */}
        {formError && (
          <Text
            variant="errorText"
            color={colors.warn}
            style={styles.formError}
          >
            {formError}
          </Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: spacing[3],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  formError: {
    marginTop: spacing[2],
  },
  inlineAddBox: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing[3],
  },
  inlineAddActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  dueDateContainer: {
    gap: 4,
  },
  dueDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearText: {
    textDecorationLine: 'underline',
  },
});

export default CreateCardModal;
