import * as React from 'react';
import { useContext } from 'react';

export const TabsContext = React.createContext<{
	goTo: (index: number) => void;
	index: number;
}>({
	goTo: () => null,
	index: 0
});

export const useTabNavigation = () => {
	return useContext(TabsContext).goTo;
};

export const useTabIndex = (): number => {
	return useContext(TabsContext).index;
};
