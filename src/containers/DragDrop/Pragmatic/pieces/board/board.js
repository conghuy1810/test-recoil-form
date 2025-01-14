import React, { forwardRef, memo, useEffect } from 'react';

import { autoScrollWindowForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { Box, xcss } from '@atlaskit/primitives';

import { useBoardContext } from './board-context';

const boardStyles = xcss({
	display: 'flex',
	justifyContent: 'center',
	gap: 'space.200',
	flexDirection: 'row',
	height: '480px',
});

const Board = forwardRef(({ children }, ref) => {
	const { instanceId } = useBoardContext();

	useEffect(() => {
		return autoScrollWindowForElements({
			canScroll: ({ source }) => source.data.instanceId === instanceId,
		});
	}, [instanceId]);

	return (
		<Box xcss={boardStyles} ref={ref}>
			{children}
		</Box>
	);
});

export default memo(Board);
