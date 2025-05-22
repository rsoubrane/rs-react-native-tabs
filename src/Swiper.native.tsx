import * as React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import ViewPager from 'react-native-pager-view';
import type { SwiperProps } from './utils';
import type { TabScreenProps } from './TabScreen';
import { TabsContext } from './context';
import TabsHeader from './TabsHeader';

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
		tabLabelStyle
	} = props;
	const { index, goTo } = React.useContext(TabsContext);
	const indexRef = React.useRef<number>(index || 0);

	const children: React.Component<TabScreenProps>[] = props.children;

	const offset = React.useRef<Animated.Value>(new Animated.Value(0));
	const position = React.useRef<Animated.Value>(new Animated.Value(index || 0));
	const isScrolling = React.useRef<boolean>(false);
	const viewPager = React.useRef<ViewPager | undefined>(undefined);

	React.useEffect(() => {
		if (index !== indexRef.current) {
			isScrolling.current = true;
			viewPager.current && viewPager.current.setPage(index);
		}

		indexRef.current = index;
		return undefined;
	}, [isScrolling, viewPager, index]);

	const onPageScrollStateChanged = React.useCallback(
		(e: any) => {
			isScrolling.current = e.nativeEvent.pageScrollState !== 'idle';
		},
		[isScrolling]
	);

	const onPageSelected = React.useCallback(
		(e: any) => {
			if (isScrolling.current) return;
			isScrolling.current = false;
			const i = e.nativeEvent.position;
			goTo(i);
		},
		[isScrolling, goTo]
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
			tabLabelStyle
		}),
		[
			children,
			theme,
			dark,
			style,
			position,
			offset,
			iconPosition,
			showTextLabel,
			showLeadingSpace,
			uppercase,
			mode,
			tabHeaderStyle,
			tabLabelStyle
		]
	);

	return (
		<>
			<TabsHeader {...renderProps} />
			<AnimatedPagerView
				style={styles.viewPager}
				initialPage={index}
				scrollEnabled={!disableSwipe}
				onPageSelected={onPageSelected}
				ref={viewPager as any}
				onPageScrollStateChanged={onPageScrollStateChanged}
				onPageScroll={Animated.event(
					[
						{
							nativeEvent: {
								offset: offset.current,
								position: position.current
							}
						}
					],
					{
						useNativeDriver: true
					}
				)}>
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
