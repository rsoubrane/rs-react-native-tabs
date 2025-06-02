import * as React from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import Swiper from './Swiper';
import type { IconPosition, Mode, TabsTheme } from './utils';

// ----------------------------------------------------------------------

const Tabs = React.memo(function Tabs({
	theme,
	dark,
	style,
	mode = 'fixed',
	uppercase = true,
	iconPosition = 'leading',
	showTextLabel = true,
	showLeadingSpace = true,
	disableSwipe = false,
	tabHeaderStyle,
	tabLabelStyle,
	fontSize,
	iconSize,
	children: childrenProp
}: {
	children: any;
	theme: TabsTheme;
	dark?: boolean;
	style?: ViewStyle;
	iconPosition?: IconPosition;
	showTextLabel?: boolean;
	showLeadingSpace?: boolean;
	uppercase?: boolean;
	mode?: Mode;
	disableSwipe?: boolean;
	tabHeaderStyle?: ViewStyle | undefined;
	tabLabelStyle?: TextStyle | undefined;
	fontSize?: number;
	iconSize?: number;
}) {
	const children = React.useMemo(() => React.Children.toArray(childrenProp).filter(Boolean), [childrenProp]);

	const swiperProps = React.useMemo(
		() => ({
			style,
			dark,
			theme,
			uppercase,
			iconPosition,
			showTextLabel,
			showLeadingSpace,
			mode,
			disableSwipe,
			tabHeaderStyle,
			tabLabelStyle,
			fontSize,
			iconSize
		}),
		[
			style,
			dark,
			theme,
			uppercase,
			iconPosition,
			showTextLabel,
			showLeadingSpace,
			mode,
			disableSwipe,
			tabHeaderStyle,
			tabLabelStyle,
			fontSize,
			iconSize
		]
	);

	return <Swiper {...swiperProps}>{children}</Swiper>;
});

export default Tabs;
