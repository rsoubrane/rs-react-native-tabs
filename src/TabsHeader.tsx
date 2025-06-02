import * as React from 'react';
import type { ReactElement } from 'react';
import type { LayoutChangeEvent, LayoutRectangle, ViewStyle } from 'react-native';
import { Animated, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { TabScreenProps } from './TabScreen';
import TabsHeaderItem from './TabsHeaderItem';
import type { SwiperRenderProps } from './utils';
import { TabsContext } from './context';
import { useIndicator, useOffsetScroller } from './internal';

// ----------------------------------------------------------------------

export default function TabsHeader({
	position,
	offset,
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
	fontSize,
	iconSize,
	children
}: SwiperRenderProps) {
	const { index, goTo } = React.useContext(TabsContext);

	const { backgroundColor: customBackground, elevation: _elevation, ...restStyle }: ViewStyle = StyleSheet.flatten(style) || {};

	const elevation = _elevation || 0;
	const isDark = typeof dark === 'boolean' ? dark : false;

	const backgroundColor = customBackground || (isDark ? '#1f2937' : '#f8fafc');

	const textColor = isDark ? '#a1a1aa' : '#64748b';
	const activeColor = isDark ? '#e2e8f0' : '#334155';

	const innerScrollSize = React.useRef<number | null>(null);
	const scrollX = React.useRef<number>(0);
	const scrollRef = React.useRef<ScrollView>(null);
	const layouts = React.useRef<Record<string, LayoutRectangle> | null>(null);
	const [tabsLayout, setTabsLayout] = React.useState<LayoutRectangle | null>(null);
	const [indicatorRef, onUpdateTabLayout, indicatorStyle] = useIndicator({
		tabsLayout,
		layouts,
		index,
		offset,
		position,
		childrenCount: children.length
	});

	const onTabsLayout = React.useCallback(
		(e: LayoutChangeEvent) => {
			setTabsLayout(e.nativeEvent.layout);
		},
		[setTabsLayout]
	);

	const onTabLayout = React.useCallback(
		(tabIndex: number, event: LayoutChangeEvent) => {
			layouts.current = {
				...layouts.current,
				[tabIndex]: event.nativeEvent.layout
			};
			onUpdateTabLayout();
		},
		[layouts, onUpdateTabLayout]
	);

	const updateScroll = React.useCallback(
		(scrollType?: 'next' | 'prev') => {
			if (!layouts.current) {
				return;
			}
			let cl = layouts.current[index];

			if (!cl || !scrollRef.current || !tabsLayout) {
				return;
			}

			const tabsWidth = tabsLayout.width;
			const scrolledX = scrollX.current;

			if (scrollType === 'next') {
				const next = layouts.current?.[index + 1];
				if (next) {
					cl = next;
				}
			} else if (scrollType === 'prev') {
				const prev = layouts.current?.[index - 1];
				if (prev) {
					cl = prev;
				}
			}
			const relativeX = cl.x - scrolledX;
			const overflowLeft = relativeX;
			const overflowRight = -tabsWidth + relativeX + cl.width;

			if (overflowRight > -50) {
				scrollRef.current.scrollTo({
					x: scrolledX + overflowRight + 50,
					y: 0,
					animated: true
				});
			} else if (overflowLeft < 50) {
				scrollRef.current.scrollTo({
					x: scrolledX + overflowLeft - 50,
					y: 0,
					animated: true
				});
			}
		},
		[layouts, index, scrollRef, scrollX, tabsLayout]
	);

	useOffsetScroller({ updateScroll, index, offset, mode });

	React.useEffect(() => {
		updateScroll();
	}, [updateScroll]);

	return (
		<Animated.View style={[styles.relative, tabHeaderStyle]}>
			<View
				style={[{ backgroundColor, elevation }, restStyle, styles.tabs, iconPosition === 'top' && styles.tabsTopIcon]}
				onLayout={onTabsLayout}>
				<ScrollView
					ref={scrollRef}
					contentContainerStyle={mode === 'fixed' ? styles.fixedContentContainerStyle : undefined}
					onContentSizeChange={(e) => {
						innerScrollSize.current = e;
					}}
					onScroll={(e) => {
						scrollX.current = e.nativeEvent.contentOffset.x;
					}}
					scrollEventThrottle={25}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					alwaysBounceHorizontal={mode === 'scrollable'}
					scrollEnabled={mode === 'scrollable'}>
					{mode === 'scrollable' && showLeadingSpace ? <View style={styles.scrollablePadding} /> : null}

					{React.Children.map(children, (tab, tabIndex) => (
						<TabsHeaderItem
							theme={theme}
							tabIndex={tabIndex}
							tab={tab as ReactElement<TabScreenProps>}
							active={index === tabIndex}
							onTabLayout={onTabLayout}
							goTo={goTo}
							activeColor={activeColor}
							textColor={textColor}
							position={position}
							offset={offset}
							childrenCount={children.length}
							uppercase={uppercase}
							iconPosition={iconPosition}
							showTextLabel={showTextLabel}
							mode={mode}
							tabLabelStyle={tabLabelStyle}
							fontSize={fontSize}
							iconSize={iconSize}
						/>
					))}
					<Animated.View
						ref={indicatorRef}
						pointerEvents="none"
						style={[
							styles.indicator,
							{
								backgroundColor: theme.colors.primary
							},
							indicatorStyle as any
						]}
					/>
				</ScrollView>
				{elevation > 0 && (
					<Animated.View
						style={[
							styles.removeTopShadow,
							{
								height: elevation,
								backgroundColor,
								top: -elevation
							}
						]}
					/>
				)}
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	relative: { position: 'relative' },
	removeTopShadow: {
		position: 'absolute',
		left: 0,
		right: 0,
		zIndex: 2
	},
	scrollablePadding: {
		width: 52
	},
	tabs: {
		height: 48
	},
	tabsTopIcon: {
		height: 72
	},
	fixedContentContainerStyle: {
		flex: 1
	},
	indicator: {
		position: 'absolute',
		height: 2,
		width: 1,
		left: 0,
		bottom: 0,
		...Platform.select({
			web: {
				backgroundColor: 'transparent',
				transitionDuration: '150ms',
				transitionProperty: 'all',
				transformOrigin: 'left',
				willChange: 'transform'
			},
			default: {}
		})
	}
});
