import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ViewStyle,
  Dimensions,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { GridIcon } from '../../../../assets/icon';
import {
  BoardColumn as BoardColumnType,
  Card as CardType,
  User,
} from '@jira-clone/shared';
import { Text } from '../../base/typography/Text';
import { Badge } from '../../base/badge/Badge';
import { Button } from '../../base/button/Button';
import { BoardColumn, DEFAULT_COLUMN_WIDTH } from '../board-column/BoardColumn';
import {
  BoardFilterBar,
  filterCards,
  CardFilterCriteria,
} from '../board-filter-bar';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { useTheme } from '../../../tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface BoardProps {
  /** Columns configured for this board */
  columns: BoardColumnType[];
  /** Cards belonging to this board */
  cards: CardType[];
  /** Available workspace members */
  users?: User[];
  /** Current viewing user ID */
  currentUserId?: string;
  /** Optional board title (e.g. "Sprint 14 Kanban") */
  boardTitle?: string;
  /** Optional project key or code (e.g. "FIELD") */
  projectKey?: string;
  /** Whether to render the integrated filter bar (default: true) */
  showFilterBar?: boolean;
  /** Whether to show quick column jump tabs above the board (default: true) */
  showColumnTabs?: boolean;
  /** Card press callback (opens detail) */
  onCardPress?: (card: CardType) => void;
  /** Card quick move callback */
  onCardMove?: (card: CardType) => void;
  /** Card single assignee change */
  onCardAssigneeChange?: (userId: string | null, card: CardType) => void;
  /** Card multi-assignees change */
  onCardAssigneesChange?: (userIds: string[], card: CardType) => void;
  /** Quick inline card creation callback */
  onCreateCard?: (title: string, columnId: string) => void | Promise<void>;
  /** Whether card creation is permitted (default: true) */
  canCreateCard?: boolean;
  /** Pull-to-refresh refreshing state */
  refreshing?: boolean;
  /** Pull-to-refresh trigger callback */
  onRefresh?: () => void;
  /** Custom column width (default: Math.min(SCREEN_WIDTH * 0.82, 330)) */
  columnWidth?: number;
  /** Custom gap between columns (default: spacing[3] = 12) */
  columnGap?: number;
  /** Custom slot above board */
  renderHeader?: () => React.ReactNode;
  /** Custom slot below board */
  renderFooter?: () => React.ReactNode;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom scroll content container style */
  contentContainerStyle?: ViewStyle;
  /** Test identifier */
  testID?: string;
}

export const Board: React.FC<BoardProps> = ({
  columns = [],
  cards = [],
  users = [],
  currentUserId,
  boardTitle,
  projectKey,
  showFilterBar = true,
  showColumnTabs = true,
  onCardPress,
  onCardMove,
  onCardAssigneeChange,
  onCardAssigneesChange,
  onCreateCard,
  canCreateCard = true,
  refreshing = false,
  onRefresh,
  columnWidth = DEFAULT_COLUMN_WIDTH,
  columnGap = spacing[3],
  renderHeader,
  renderFooter,
  style,
  contentContainerStyle,
  testID,
}) => {
  const { colors } = useTheme();
  const boardScrollRef = useRef<ScrollView>(null);
  const tabsScrollRef = useRef<ScrollView>(null);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  // Integrated filter bar states
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [createdByMe, setCreatedByMe] = useState(false);
  const [hasCommentsFilter, setHasCommentsFilter] = useState(false);
  const [selectedFilterUserIds, setSelectedFilterUserIds] = useState<string[]>([]);

  const handleToggleFilterUserId = (userId: string) => {
    setSelectedFilterUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setAssignedToMe(false);
    setCreatedByMe(false);
    setHasCommentsFilter(false);
    setSelectedFilterUserIds([]);
  };

  // Filter cards across all columns
  const filteredCards = filterCards(cards, {
    searchQuery,
    assignedToMe,
    createdByMe,
    hasComments: hasCommentsFilter,
    selectedUserIds: selectedFilterUserIds,
    currentUserId,
  });

  // Track active column on horizontal scroll
  const handleBoardScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const itemInterval = columnWidth + columnGap;
    if (itemInterval > 0) {
      const index = Math.round(offsetX / itemInterval);
      if (index >= 0 && index < columns.length && index !== activeColumnIndex) {
        setActiveColumnIndex(index);
      }
    }
  };

  // Scroll board to target column when tab pill is tapped
  const scrollToColumn = (index: number) => {
    if (index < 0 || index >= columns.length) return;
    setActiveColumnIndex(index);
    boardScrollRef.current?.scrollTo({
      x: index * (columnWidth + columnGap),
      animated: true,
    });
  };

  // Resolve column accent color
  const getColumnColor = (col: BoardColumnType) => {
    return (
      col.color ||
      (col.id.includes('done')
        ? '#10B981'
        : col.id.includes('review')
        ? colors.accent
        : col.id.includes('progress')
        ? '#3B82F6'
        : colors.inkMuted)
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }, style]} testID={testID}>
      {/* Optional Board Title Header */}
      {(boardTitle || projectKey) && (
        <View style={styles.boardHeader}>
          <View style={styles.boardHeaderLeft}>
            {projectKey && (
              <Badge
                label={projectKey}
                variant="accent"
                size="sm"
                rounded
              />
            )}
            {boardTitle && (
              <Text variant="heading" bold numberOfLines={1}>
                {boardTitle}
              </Text>
            )}
          </View>
          <Badge
            label={`${filteredCards.length} ${
              filteredCards.length === 1 ? 'issue' : 'issues'
            }`}
            variant="neutral"
            size="sm"
          />
        </View>
      )}

      {/* Custom Header Slot */}
      {renderHeader && renderHeader()}

      {/* Integrated Filter Bar */}
      {showFilterBar && (
        <BoardFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          assignedToMe={assignedToMe}
          onToggleAssignedToMe={() => setAssignedToMe((prev) => !prev)}
          createdByMe={createdByMe}
          onToggleCreatedByMe={() => setCreatedByMe((prev) => !prev)}
          hasComments={hasCommentsFilter}
          onToggleHasComments={() => setHasCommentsFilter((prev) => !prev)}
          selectedUserIds={selectedFilterUserIds}
          onToggleUserId={handleToggleFilterUserId}
          users={users}
          currentUser={users.find((u) => u.id === currentUserId)}
          matchCount={filteredCards.length}
          totalCount={cards.length}
          onClearFilters={handleClearFilters}
          style={styles.filterBar}
        />
      )}

      {/* Quick Column Jump Tabs */}
      {showColumnTabs && columns.length > 1 && (
        <View style={styles.tabsWrapper}>
          <ScrollView
            ref={tabsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {columns.map((col, index) => {
              const isActive = index === activeColumnIndex;
              const count = filteredCards.filter((c: CardType) => c.columnId === col.id).length;
              const dotColor = getColumnColor(col);

              return (
                <Pressable
                  key={col.id}
                  onPress={() => scrollToColumn(index)}
                  style={({ pressed }) => [
                    styles.tabPill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isActive ? colors.ink : colors.line,
                    },
                    pressed && styles.tabPillPressed,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Scroll to ${col.title} column, ${count} issues`}
                >
                  <View style={[styles.tabDot, { backgroundColor: dotColor }]} />
                  <Text
                    variant="caption"
                    bold={isActive}
                    style={{ color: isActive ? colors.ink : colors.inkMuted }}
                  >
                    {col.title}
                  </Text>
                  <Badge
                    label={String(count)}
                    variant="neutral"
                    size="sm"
                    rounded
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Empty Board State (When 0 Columns) */}
      {columns.length === 0 ? (
        <View
          style={[
            styles.emptyBoard,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
        >
          <GridIcon
            size={40}
            color={colors.inkMuted}
            style={{ marginBottom: spacing[2] }}
          />
          <Text variant="body" bold style={{ color: colors.ink }}>
            No columns configured
          </Text>
          <Text
            variant="caption"
            muted
            style={{ textAlign: 'center', marginTop: 4, maxWidth: 260 }}
          >
            This board does not have any workflow columns set up yet.
          </Text>
        </View>
      ) : (
        /* Horizontal Kanban Columns Surface */
        <ScrollView
          ref={boardScrollRef}
          horizontal
          snapToInterval={columnWidth + columnGap}
          decelerationRate="fast"
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          onScroll={handleBoardScroll}
          scrollEventThrottle={16}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={Boolean(refreshing)}
                onRefresh={onRefresh}
                tintColor={colors.accent}
              />
            ) : undefined
          }
          contentContainerStyle={[
            styles.boardScrollContent,
            { gap: columnGap },
            contentContainerStyle,
          ]}
        >
          {columns.map((col) => {
            const columnCards = filteredCards.filter(
              (c: CardType) => c.columnId === col.id
            );

            return (
              <BoardColumn
                key={col.id}
                column={col}
                cards={columnCards}
                users={users}
                currentUserId={currentUserId}
                onCardPress={onCardPress}
                onCardMove={onCardMove}
                onCardAssigneeChange={onCardAssigneeChange}
                onCardAssigneesChange={onCardAssigneesChange}
                onCreateCard={onCreateCard}
                canCreateCard={canCreateCard}
                columnWidth={columnWidth}
                style={{ marginRight: 0 }}
              />
            );
          })}
        </ScrollView>
      )}

      {/* Custom Footer Slot */}
      {renderFooter && renderFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  boardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  filterBar: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  tabsWrapper: {
    paddingBottom: spacing[3],
  },
  tabsContent: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    alignItems: 'center',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tabPillActive: {},
  tabPillPressed: {
    opacity: 0.8,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tabText: {},
  tabTextActive: {},
  boardScrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
    alignItems: 'flex-start',
  },
  emptyBoard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[4],
    marginHorizontal: spacing[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});

export default Board;
