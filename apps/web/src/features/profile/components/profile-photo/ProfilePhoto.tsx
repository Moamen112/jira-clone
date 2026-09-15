import { useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, FC } from 'react';
import { Avatar, type AvatarSize } from '../../../../components/shared/avatar';
import { Modal } from '../../../../components/shared/modal';
import { Button, Text } from '../../../../components/base';
import type { User } from '@jira-clone/shared';
import styles from './ProfilePhoto.module.css';

// ============================================================================
// ICONS — inline, theme-aware (inherit currentColor)
// ============================================================================

interface IconProps {
  size?: number;
}

const AddIcon: FC<IconProps> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

const DEFAULT_STORAGE_KEY = 'jira-clone.profile-avatar';

export interface ProfilePhotoProps {
  /** The user whose photo is being edited */
  user: User;
  /** Avatar size tier or custom pixel size (default: 80) */
  size?: AvatarSize | number;
  /** localStorage key used to persist the photo until the backend lands */
  storageKey?: string;
  /** Called whenever the photo changes or is removed (data URL or null) */
  onPhotoChange?: (dataUrl: string | null) => void;
  /** Container style override. */
  style?: CSSProperties;
  /** Additional CSS class. */
  className?: string;
  /** Test identifier. */
  testID?: string;
}

function readCachedPhoto(storageKey: string): string | null {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeCachedPhoto(storageKey: string, dataUrl: string | null): void {
  try {
    if (dataUrl) {
      window.localStorage.setItem(storageKey, dataUrl);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    // Storage unavailable or quota exceeded — the in-memory photo still works.
  }
}
/**
 * ProfilePhoto — avatar with change/remove photo controls.
 *
 * Uses a hidden file input + FileReader to read the selection as a data URL.
 * The photo is cached in localStorage so it survives reloads — until the
 * backend upload API is wired up, at which point `onPhotoChange` should be
 * replaced with a real multipart upload.
 */
export const ProfilePhoto: FC<ProfilePhotoProps> = ({
  user,
  size = 80,
  storageKey = DEFAULT_STORAGE_KEY,
  onPhotoChange,
  style,
  className = '',
  testID,
}) => {
  const [customUrl, setCustomUrl] = useState<string | null>(() => readCachedPhoto(storageKey));
  const [error, setError] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    setError(undefined);

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, GIF, WebP...).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!dataUrl) return;
      setCustomUrl(dataUrl);
      writeCachedPhoto(storageKey, dataUrl);
      onPhotoChange?.(dataUrl);
      setModalVisible(false);
    };
    reader.onerror = () => {
      setError('Could not read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFromModal = () => {
    handleRemove();
    setModalVisible(false);
  };

  const handleRemove = () => {
    setCustomUrl(null);
    setError(undefined);
    writeCachedPhoto(storageKey, null);
    onPhotoChange?.(null);
  };

  const photoUrl = customUrl ?? user.avatarUrl;

  return (
    <div
      className={`${styles.wrapper} ${className}`}
      style={style}
      data-testid={testID}
    >
      <div className={styles.photoWrap}>
        <Avatar
          name={user.name}
          imageUrl={photoUrl}
          size={size}
          bordered
          borderColor="var(--color-surface)"
        />

        {/* Manage photo — circular "+" badge on the photo corner opens the modal */}
        <button
          type="button"
          className={`${styles.badge} ${styles.addBadge}`}
          onClick={() => setModalVisible(true)}
          aria-label="Manage photo"
          title="Manage photo"
        >
          <AddIcon size={14} />
        </button>
      </div>

      <span className={styles.hint}>Click + to manage your photo</span>

      {/* Manage-photo modal: update / remove actions */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Profile photo"
        subtitle={user.name}
        presentation="dialog"
        contentStyle={{ maxWidth: 380 }}
      >
        <div className={styles.modalBody}>
          <Avatar
            name={user.name}
            imageUrl={photoUrl}
            size={72}
            bordered
            borderColor="var(--color-surface)"
          />

          <p className={styles.modalText}>
            {customUrl
              ? 'You are using a custom photo for your profile.'
              : 'You are currently using your default profile photo.'}
          </p>

          <div className={styles.modalActions}>
            <Button
              label="Update photo"
              variant="primary"
              fullWidth
              leftIcon={<AddIcon size={16} />}
              onPress={() => inputRef.current?.click()}
            />
            <Button
              label="Remove photo"
              variant="danger"
              fullWidth
              disabled={!customUrl}
              onPress={handleRemoveFromModal}
            />
          </div>

          {error && (
            <Text variant="errorText" color="var(--color-warn)">
              {error}
            </Text>
          )}
        </div>
      </Modal>

      {/* Hidden file input — triggered via the buttons above */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfilePhoto;