import * as React from 'react';
import { Animated, Platform } from 'react-native';
import type { AnimatedColorArgs, AnimatedTextStyle, AnimatedViewStyle, IndicatorArgs, IndicatorReturns, OffsetScrollArgs } from './utils';

// ----------------------------------------------------------------------

export function useAnimatedText({
	childrenCount,
	tabIndex,
	position,
	offset,
	textColor,
	activeColor
}: AnimatedColorArgs): AnimatedTextStyle {
	if (childrenCount <= 1) {
		return {
			color: activeColor,
			opacity: 1
		};
	}

	const childrenA = new Array(childrenCount).fill(undefined);
	const positionWithOffset = Animated.add(position!, offset!);
	const inputRange = childrenA.map((_, i) => i);

	return {
		color: positionWithOffset!.interpolate({
			inputRange: inputRange,
			outputRange: childrenA.map((_, i) => (i === tabIndex ? activeColor : textColor))
		}),
		opacity: positionWithOffset.interpolate({
			inputRange: inputRange,
			outputRange: childrenA.map((_, i) => (i === tabIndex ? 1 : 0.6))
		})
	};
}

export function useIndicator({ childrenCount, position, offset, layouts, tabsLayout }: IndicatorArgs): IndicatorReturns {
	const [renderIndex, setRenderIndex] = React.useState(0);

	const style = React.useMemo<AnimatedViewStyle | null>(() => {
		const childrenA = new Array(childrenCount).fill(undefined);
		const inputRange = childrenA.map((__, i) => i);
		const positionWithOffset = Animated.add(position!, offset!);

		const getTranslateX = (i: number) => {
			const cl = layouts.current?.[i];
			if (!cl) {
				return 0;
			}
			return (cl.x + cl.width / 2) / cl.width;
		};
		const getScaleX = (i: number) => {
			return layouts.current?.[i]?.width || 0;
		};

		return position && tabsLayout && layouts.current
			? {
					transform: [
						{
							scaleX:
								childrenA.length <= 1
									? getScaleX(0)
									: positionWithOffset.interpolate({
											inputRange,
											outputRange: childrenA.map((__, i) => getScaleX(i))
											// extrapolate: 'clamp',
										})
						},
						{
							translateX:
								childrenA.length <= 1
									? getTranslateX(0)
									: positionWithOffset.interpolate({
											inputRange,
											outputRange: childrenA.map((__, i) => getTranslateX(i))
											// extrapolate: 'clamp',
										})
						}
					]
				}
			: null;
	}, [position, offset, tabsLayout, layouts, renderIndex, childrenCount]);

	const onUpdateTabLayout = React.useCallback(() => {
		setRenderIndex((prev) => prev + 1);
	}, [setRenderIndex]);

	return [undefined, onUpdateTabLayout, style];
}

export function useOffsetScroller({ index, offset, updateScroll, mode }: OffsetScrollArgs) {
	const direction = React.useRef<undefined | 'next' | 'prev'>(undefined);

	React.useEffect(() => {
		if (offset !== undefined && offset !== null && Platform.OS !== 'android' && mode === 'scrollable') {
			const id = offset.addListener((nOffset) => {
				const newOffset = nOffset.value;
				const oldDirection = direction.current;

				if (newOffset > 0.1) {
					direction.current = 'next';
				} else if (newOffset < -0.1) {
					direction.current = 'prev';
				}

				if (direction.current) {
					if (oldDirection !== direction.current) {
						updateScroll(direction.current);
					}
				}
			});
			return () => {
				offset.removeListener(id);
			};
		}
		return undefined;
	}, [offset, updateScroll, direction, mode]);

	React.useEffect(() => {
		direction.current = undefined;
	}, [index]);
}
