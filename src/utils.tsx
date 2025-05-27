import type { MutableRefObject, RefObject, ReactNode } from 'react';
import type { Animated, LayoutRectangle, StyleProp, TextStyle, View, ViewStyle } from 'react-native';

// ----------------------------------------------------------------------

export type AnimatedViewStyle = Animated.AnimatedProps<StyleProp<ViewStyle>>;
export type AnimatedTextStyle = Animated.AnimatedProps<StyleProp<TextStyle>>;
export type Mode = 'fixed' | 'scrollable';
export type IconPosition = 'leading' | 'top';

export interface TabsTheme {
	colors: {
		primary: string;
		surface: string;
		onSurface: string;
		onSurfaceVariant?: string;
		background?: string;
		error?: string;
	};
	fonts?: {
		titleSmall?: TextStyle;
	};
	roundness?: number;
	dark?: boolean;
	isV3?: boolean;
	mode?: string;
}

export interface SwiperRenderProps {
	dark: boolean | undefined;
	style: ViewStyle | undefined;
	theme: TabsTheme;
	children: any;
	position: Animated.Value | undefined;
	offset: Animated.Value | undefined;
	iconPosition?: IconPosition;
	showTextLabel?: boolean;
	showLeadingSpace?: boolean;
	uppercase: boolean;
	mode: Mode;
	tabHeaderStyle: ViewStyle | undefined;
	tabLabelStyle: TextStyle | undefined;
	fontSize?: number;
}

export interface SwiperProps {
	dark: boolean | undefined;
	style: ViewStyle | undefined;
	theme: TabsTheme;
	children: any;
	iconPosition?: IconPosition;
	showTextLabel?: boolean;
	showLeadingSpace?: boolean;
	uppercase: boolean;
	mode: Mode;
	disableSwipe?: boolean;
	tabHeaderStyle: ViewStyle | undefined;
	tabLabelStyle: TextStyle | undefined;
	fontSize?: number;
}

export interface OffsetScrollArgs {
	index: number;
	offset: Animated.Value | undefined;
	updateScroll: (direction?: undefined | 'next' | 'prev') => void;
	mode: Mode;
}

export interface AnimatedColorArgs {
	tabIndex: number;
	active: boolean;
	position: Animated.Value | undefined;
	offset: Animated.Value | undefined;
	textColor: string;
	activeColor: string;
	childrenCount: number;
}

export interface IndicatorArgs {
	layouts: MutableRefObject<Record<string, LayoutRectangle> | null>;
	index: number;
	childrenCount: number;
	position: Animated.Value | undefined;
	offset: Animated.Value | undefined;
	tabsLayout: LayoutRectangle | null;
}

export type IndicatorReturns = [RefObject<View> | undefined, () => any, AnimatedViewStyle | null];

export interface TabsProviderProps {
	children: ReactNode;
	onChangeIndex?: (index: number) => void;
	defaultIndex?: number;
	forcedIndex?: number;
}
