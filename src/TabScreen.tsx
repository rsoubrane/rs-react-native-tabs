import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

// ----------------------------------------------------------------------

export interface TabScreenProps {
	label: string;
	icon?: LucideIcon;
	badge?: string | number | boolean;
	children: any;
	onPress?: (event: GestureResponderEvent) => void;
	onPressIn?: (event: GestureResponderEvent) => void;
	disabled?: boolean;
}

export default function TabScreen({ children }: TabScreenProps) {
	return React.Children.only(children);
}
