import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { TabsProviderProps } from './utils';
import { TabsContext } from './context';

// ----------------------------------------------------------------------

export const TabsProvider = React.memo(function TabsProvider({ children, onChangeIndex, defaultIndex, forcedIndex }: TabsProviderProps) {
	const [index, setIndex] = useState<number>(defaultIndex || 0);

	useEffect(() => {
		if (forcedIndex !== undefined && forcedIndex !== index) {
			setIndex(forcedIndex);
		}
	}, [forcedIndex, index]);

	const goTo = useCallback(
		(ind: number) => {
			if (ind !== index) {
				setIndex(ind);
				onChangeIndex?.(ind);
			}
		},
		[index, onChangeIndex]
	);

	const value = useMemo(() => ({ goTo, index }), [goTo, index]);

	return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
});
