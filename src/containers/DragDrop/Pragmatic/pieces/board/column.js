import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import { IconButton } from '@atlaskit/button/new';
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import Heading from '@atlaskit/heading';
// This is the smaller MoreIcon soon to be more easily accessible with the
// ongoing icon project
import MoreIcon from '@atlaskit/icon/utility/migration/show-more-horizontal--editor-more';
import { easeInOut } from '@atlaskit/motion/curves';
import { mediumDurationMs } from '@atlaskit/motion/durations';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { centerUnderPointer } from '@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { Box, Flex, Inline, Stack, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

// Remove type definitions
import { useBoardContext } from './board-context';
import { Card } from './card';
import { ColumnContext, useColumnContext } from './column-context';

const columnStyles = xcss({
  width: '250px',
  backgroundColor: 'elevation.surface.sunken',
  borderRadius: 'border.radius.300',
  transition: `background ${mediumDurationMs}ms ${easeInOut}`,
  position: 'relative',
  /**
   * TODO: figure out hover color.
   * There is no `elevation.surface.sunken.hovered` token,
   * so leaving this for now.
   */
});

const stackStyles = xcss({
  // allow the container to be shrunk by a parent height
  // https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/#the-minimum-size-gotcha-11
  minHeight: '0',

  // ensure our card list grows to be all the available space
  // so that users can easily drop on en empty list
  flexGrow: 1,
});

const scrollContainerStyles = xcss({
  height: '100%',
  overflowY: 'auto',
});

const cardListStyles = xcss({
  boxSizing: 'border-box',
  minHeight: '100%',
  padding: 'space.100',
  gap: 'space.100',
});

const columnHeaderStyles = xcss({
  paddingInlineStart: 'space.200',
  paddingInlineEnd: 'space.200',
  paddingBlockStart: 'space.100',
  color: 'color.text.subtlest',
  userSelect: 'none',
});

// Remove type definitions
// ...existing code...

const idle = { type: 'idle' };
const isCardOver = { type: 'is-card-over' };

const stateStyles = {
  idle: xcss({
    cursor: 'grab',
  }),
  'is-card-over': xcss({
    backgroundColor: 'color.background.selected.hovered',
  }),
  'is-column-over': undefined,
  'generate-column-preview': xcss({
    isolation: 'isolate',
  }),
  'generate-safari-column-preview': undefined,
};

const isDraggingStyles = xcss({
  opacity: 0.4,
});

export const Column = memo(function Column({ column }) {
  const columnId = column.columnId;
  const columnRef = useRef(null);
  const columnInnerRef = useRef(null);
  const headerRef = useRef(null);
  const scrollableRef = useRef(null);
  const [state, setState] = useState(idle);
  const [isDragging, setIsDragging] = useState(false);

  const { instanceId, registerColumn } = useBoardContext();

  useEffect(() => {
    invariant(columnRef.current);
    invariant(columnInnerRef.current);
    invariant(headerRef.current);
    invariant(scrollableRef.current);
    return combine(
      registerColumn({
        columnId,
        entry: {
          element: columnRef.current,
        },
      }),
      draggable({
        element: columnRef.current,
        dragHandle: headerRef.current,
        getInitialData: () => ({ columnId, type: 'column', instanceId }),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          const isSafari =
            navigator.userAgent.includes('AppleWebKit') &&
            !navigator.userAgent.includes('Chrome');

          if (!isSafari) {
            setState({ type: 'generate-column-preview' });
            return;
          }
          setCustomNativeDragPreview({
            getOffset: centerUnderPointer,
            render: ({ container }) => {
              setState({
                type: 'generate-safari-column-preview',
                container,
              });
              return () => setState(idle);
            },
            nativeSetDragImage,
          });
        },
        onDragStart: () => {
          setIsDragging(true);
        },
        onDrop() {
          setState(idle);
          setIsDragging(false);
        },
      }),
      dropTargetForElements({
        element: columnInnerRef.current,
        getData: () => ({ columnId }),
        canDrop: ({ source }) => {
          return (
            source.data.instanceId === instanceId && source.data.type === 'card'
          );
        },
        getIsSticky: () => true,
        onDragEnter: () => setState(isCardOver),
        onDragLeave: () => setState(idle),
        onDragStart: () => setState(isCardOver),
        onDrop: () => setState(idle),
      }),
      dropTargetForElements({
        element: columnRef.current,
        canDrop: ({ source }) => {
          return (
            source.data.instanceId === instanceId &&
            source.data.type === 'column'
          );
        },
        getIsSticky: () => true,
        getData: ({ input, element }) => {
          const data = {
            columnId,
          };
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ['left', 'right'],
          });
        },
        onDragEnter: args => {
          setState({
            type: 'is-column-over',
            closestEdge: extractClosestEdge(args.self.data),
          });
        },
        onDrag: args => {
          setState(current => {
            const closestEdge = extractClosestEdge(args.self.data);
            if (
              current.type === 'is-column-over' &&
              current.closestEdge === closestEdge
            ) {
              return current;
            }
            return {
              type: 'is-column-over',
              closestEdge,
            };
          });
        },
        onDragLeave: () => {
          setState(idle);
        },
        onDrop: () => {
          setState(idle);
        },
      }),
      autoScrollForElements({
        element: scrollableRef.current,
        canScroll: ({ source }) =>
          source.data.instanceId === instanceId && source.data.type === 'card',
      })
    );
  }, [columnId, registerColumn, instanceId]);

  const stableItems = useRef(column.items);
  useEffect(() => {
    stableItems.current = column.items;
  }, [column.items]);

  const getCardIndex = useCallback(userId => {
    return stableItems.current.findIndex(item => item.userId === userId);
  }, []);

  const getNumCards = useCallback(() => {
    return stableItems.current.length;
  }, []);

  const contextValue = useMemo(() => {
    return { columnId, getCardIndex, getNumCards };
  }, [columnId, getCardIndex, getNumCards]);

  return (
    <ColumnContext.Provider value={contextValue}>
      <Flex
        testId={`column-${columnId}`}
        ref={columnRef}
        direction="column"
        xcss={[columnStyles, stateStyles[state.type]]}
      >
        {/* This element takes up the same visual space as the column.
          We are using a separate element so we can have two drop targets
          that take up the same visual space (one for cards, one for columns)
        */}
        <Stack xcss={stackStyles} ref={columnInnerRef}>
          <Stack
            xcss={[stackStyles, isDragging ? isDraggingStyles : undefined]}
          >
            <Inline
              xcss={columnHeaderStyles}
              ref={headerRef}
              testId={`column-header-${columnId}`}
              spread="space-between"
              alignBlock="center"
            >
              <Heading
                size="xxsmall"
                as="span"
                testId={`column-header-title-${columnId}`}
              >
                {column.title}
              </Heading>
              <ActionMenu />
            </Inline>
            <Box xcss={scrollContainerStyles} ref={scrollableRef}>
              <Stack xcss={cardListStyles} space="space.100">
                {column.items.map(item => (
                  <Card item={item} key={item.userId} />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
        {state.type === 'is-column-over' && state.closestEdge && (
          <DropIndicator
            edge={state.closestEdge}
            gap={token('space.200', '0')}
          />
        )}
      </Flex>
      {state.type === 'generate-safari-column-preview'
        ? createPortal(<SafariColumnPreview column={column} />, state.container)
        : null}
    </ColumnContext.Provider>
  );
});

const safariPreviewStyles = xcss({
  width: '250px',
  backgroundColor: 'elevation.surface.sunken',
  borderRadius: 'border.radius',
  padding: 'space.200',
});

function SafariColumnPreview({ column }) {
  return (
    <Box xcss={[columnHeaderStyles, safariPreviewStyles]}>
      <Heading size="xxsmall" as="span">
        {column.title}
      </Heading>
    </Box>
  );
}

function ActionMenu() {
  return (
    <DropdownMenu trigger={DropdownMenuTrigger}>
      <ActionMenuItems />
    </DropdownMenu>
  );
}

function ActionMenuItems() {
  const { columnId } = useColumnContext();
  const { getColumns, reorderColumn } = useBoardContext();

  const columns = getColumns();
  const startIndex = columns.findIndex(column => column.columnId === columnId);

  const moveLeft = useCallback(() => {
    reorderColumn({
      startIndex,
      finishIndex: startIndex - 1,
    });
  }, [reorderColumn, startIndex]);

  const moveRight = useCallback(() => {
    reorderColumn({
      startIndex,
      finishIndex: startIndex + 1,
    });
  }, [reorderColumn, startIndex]);

  const isMoveLeftDisabled = startIndex === 0;
  const isMoveRightDisabled = startIndex === columns.length - 1;

  return (
    <DropdownItemGroup>
      <DropdownItem onClick={moveLeft} isDisabled={isMoveLeftDisabled}>
        Move left
      </DropdownItem>
      <DropdownItem onClick={moveRight} isDisabled={isMoveRightDisabled}>
        Move right
      </DropdownItem>
    </DropdownItemGroup>
  );
}

function DropdownMenuTrigger({ triggerRef, ...triggerProps }) {
  return (
    <IconButton
      ref={mergeRefs([triggerRef])}
      appearance="subtle"
      label="Actions"
      spacing="compact"
      icon={MoreIcon}
      {...triggerProps}
    />
  );
}
