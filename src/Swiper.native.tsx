import * as React from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import ViewPager from 'react-native-pager-view';
import type { TabScreenProps } from './TabScreen';
import TabsHeader from './TabsHeader';
import type { SwiperProps } from './utils';
import { TabsContext } from './context';

// ----------------------------------------------------------------------

const styles = StyleSheet.create({
	viewPager: {
		flex: 1
	}
});

const AnimatedPagerView = Animated.createAnimatedComponent(ViewPager);

const SwiperNative = React.memo(function SwiperNative(props: SwiperProps) {
	const {
		theme,
		dark,
		style,
		iconPosition,
		showTextLabel,
		uppercase,
		mode,
		showLeadingSpace,
		disableSwipe,
		tabHeaderStyle,
		tabLabelStyle,
		fontSize
	} = props;

	const { index, goTo } = React.useContext(TabsContext);
	const children: React.Component<TabScreenProps>[] = props.children;

	const indexRef = React.useRef<number>(index || 0);
	const offset = React.useRef<Animated.Value>(new Animated.Value(0));
	const position = React.useRef<Animated.Value>(new Animated.Value(index || 0));
	const isProgrammaticScroll = React.useRef<boolean>(false);
	const viewPager = React.useRef<ViewPager | null>(null);

	React.useEffect(() => {
		if (index !== indexRef.current && viewPager.current) {
			isProgrammaticScroll.current = true;
			viewPager.current.setPage(index);
		}
		indexRef.current = index;
	}, [index]);

	const onPageScrollStateChanged = React.useCallback((e: any) => {
		const state = e.nativeEvent.pageScrollState;

		// Reset programmatic scroll flag when scrolling ends
		if (state === 'idle') {
			isProgrammaticScroll.current = false;

			if (Platform.OS === 'ios') {
				const { HapticFeedback } = require('react-native');
				HapticFeedback?.selection?.();
			}
		}
	}, []);

	const onPageSelected = React.useCallback(
		(e: any) => {
			const newIndexFromEvent = e.nativeEvent.position;

			// Only call goTo if this was a user-initiated swipe (not programmatic)
			// and the new index is different from the current context index
			if (!isProgrammaticScroll.current && newIndexFromEvent !== index) {
				goTo(newIndexFromEvent);
			}
		},
		[goTo, index]
	);

	const renderProps = React.useMemo(
		() => ({
			children,
			theme,
			dark,
			style,
			position: position.current,
			offset: offset.current,
			iconPosition,
			showTextLabel,
			showLeadingSpace,
			uppercase,
			mode,
			tabHeaderStyle,
			tabLabelStyle,
			fontSize
		}),
		[
			children,
			theme,
			dark,
			style,
			iconPosition,
			showTextLabel,
			showLeadingSpace,
			uppercase,
			mode,
			tabHeaderStyle,
			tabLabelStyle,
			fontSize
		]
	);

	// Optimized page scroll event
	const onPageScroll = React.useMemo(
		() =>
			Animated.event(
				[
					{
						nativeEvent: {
							offset: offset.current,
							position: position.current
						}
					}
				],
				{
					useNativeDriver: true,
					listener: () => {
						// Optional: Add any side effects here
					}
				}
			),
		[]
	);

	return (
		<>
			<TabsHeader {...renderProps} />

			<AnimatedPagerView
				style={styles.viewPager}
				initialPage={index}
				scrollEnabled={!disableSwipe}
				onPageSelected={onPageSelected}
				ref={viewPager}
				onPageScrollStateChanged={onPageScrollStateChanged}
				onPageScroll={onPageScroll}
				pageMargin={0}
				orientation="horizontal"
				overdrag={false}>
				{React.Children.map(children.filter(Boolean), (tab, tabIndex) => (
					<View style={styles.viewPager} key={tab.props.label || tabIndex}>
						{tab as any}
					</View>
				))}
			</AnimatedPagerView>
		</>
	);
});

export default SwiperNative;
