import React from 'react';
import { StyleProp, TextStyle, ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface IconProps {
  /** Icon size in pixels (default: 20) */
  size?: number;
  /** Fill/stroke color */
  color?: string | ColorValue;
  /** Whether the parent state is active/focused (toggles solid vs outline variant) */
  focused?: boolean;
  /** Custom style override */
  style?: StyleProp<TextStyle>;
}

export type IconComponent = React.FC<IconProps>;

/**
 * Factory creating consistent, typed icon components wrapping Ionicons glyphs.
 * Keep presentation logic here; all interactive business logic belongs in the consuming component.
 */
function createIcon(
  defaultName: keyof typeof Ionicons.glyphMap,
  focusedName?: keyof typeof Ionicons.glyphMap
): IconComponent {
  const Icon: IconComponent = ({ size = 20, color, focused = false, style }) => {
    const iconName = focused && focusedName ? focusedName : defaultName;
    return <Ionicons name={iconName} size={size} color={color} style={style} />;
  };
  Icon.displayName = `Icon(${defaultName})`;
  return Icon;
}

// ---------------------------------------------------------------------------
// 1. Navigation & Tab Bar Icons
// ---------------------------------------------------------------------------
export const HomeIcon = createIcon('home-outline', 'home');
export const GridIcon = createIcon('grid-outline', 'grid');
export const NotificationsIcon = createIcon('notifications-outline', 'notifications');
export const PersonIcon = createIcon('person-outline', 'person');
export const ProfileIcon = PersonIcon;
export const UserIcon = PersonIcon;

// ---------------------------------------------------------------------------
// 2. Actions & Controls
// ---------------------------------------------------------------------------
export const AddIcon = createIcon('add');
export const PlusIcon = AddIcon;
export const TrashIcon = createIcon('trash-outline');
export const DeleteIcon = TrashIcon;
export const CreateIcon = createIcon('create-outline');
export const EditIcon = CreateIcon;
export const CloseIcon = createIcon('close');
export const CloseCircleIcon = createIcon('close-circle');
export const CloseCircleOutlineIcon = createIcon('close-circle-outline');
export const SearchIcon = createIcon('search-outline');
export const CameraIcon = createIcon('camera');

// ---------------------------------------------------------------------------
// 3. Directional & Navigation
// ---------------------------------------------------------------------------
export const ChevronBackIcon = createIcon('chevron-back');
export const BackIcon = ChevronBackIcon;
export const ChevronDownIcon = createIcon('chevron-down');
export const ArrowForwardIcon = createIcon('arrow-forward');
export const ArrowUpIcon = createIcon('arrow-up-outline');
export const ArrowDownIcon = createIcon('arrow-down-outline');

// ---------------------------------------------------------------------------
// 4. Card, Board & Accordion Sections
// ---------------------------------------------------------------------------
export const DocumentTextIcon = createIcon('document-text-outline');
export const PeopleIcon = createIcon('people-outline');
export const PulseIcon = createIcon('pulse-outline');
export const ActivityIcon = PulseIcon;
export const TimeIcon = createIcon('time-outline');
export const HistoryIcon = TimeIcon;
export const LayersIcon = createIcon('layers-outline');
export const BoardIcon = GridIcon;
export const LockClosedIcon = createIcon('lock-closed-outline');
export const EllipsisHorizontalIcon = createIcon('ellipsis-horizontal');
export const MoreIcon = EllipsisHorizontalIcon;

// ---------------------------------------------------------------------------
// 5. Status & Feedback
// ---------------------------------------------------------------------------
export const CheckmarkIcon = createIcon('checkmark');
export const CheckmarkCircleIcon = createIcon('checkmark-circle');
export const WarningIcon = createIcon('warning-outline');
export const InfoIcon = createIcon('information-circle-outline');

// ---------------------------------------------------------------------------
// 6. Comments & Collaboration
// ---------------------------------------------------------------------------
export const ChatBubbleIcon = createIcon('chatbubble-outline');
export const ChatBubblesIcon = createIcon('chatbubbles-outline');
export const ChatEllipsesIcon = createIcon('chatbubble-ellipses-outline');
export const CommentsIcon = ChatBubblesIcon;

// ---------------------------------------------------------------------------
// 7. Dynamic Lookup Map & Unified Component
// ---------------------------------------------------------------------------
export const iconMap = {
  add: AddIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-forward': ArrowForwardIcon,
  'arrow-up': ArrowUpIcon,
  camera: CameraIcon,
  'chat-bubble': ChatBubbleIcon,
  'chat-bubbles': ChatBubblesIcon,
  'chat-ellipses': ChatEllipsesIcon,
  checkmark: CheckmarkIcon,
  'checkmark-circle': CheckmarkCircleIcon,
  'chevron-back': ChevronBackIcon,
  'chevron-down': ChevronDownIcon,
  close: CloseIcon,
  'close-circle': CloseCircleIcon,
  'close-circle-outline': CloseCircleOutlineIcon,
  create: CreateIcon,
  'document-text': DocumentTextIcon,
  'ellipsis-horizontal': EllipsisHorizontalIcon,
  grid: GridIcon,
  home: HomeIcon,
  info: InfoIcon,
  layers: LayersIcon,
  lock: LockClosedIcon,
  notifications: NotificationsIcon,
  people: PeopleIcon,
  person: PersonIcon,
  pulse: PulseIcon,
  search: SearchIcon,
  time: TimeIcon,
  trash: TrashIcon,
  warning: WarningIcon,
} as const;

export type AppIconName = keyof typeof iconMap;

export interface AppIconProps extends IconProps {
  name: AppIconName;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, ...props }) => {
  const Component = iconMap[name];
  if (!Component) return null;
  return <Component {...props} />;
};

export default AppIcon;
