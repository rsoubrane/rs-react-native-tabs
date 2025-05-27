import * as React from 'react';
import type { TextStyle, View, ViewStyle } from 'react-native';
import type { AnimatedColorArgs, IndicatorArgs, IndicatorReturns, OffsetScrollArgs } from './utils';

function getIndicatorStyle({
	left,
	width
}: {
	left: number;
	width: number;
}): ViewStyle {
	return {
		transform: [{ scaleX: width }, { translateX: roundToTwo(left / width) || 0 }]
	};
}

function roundToTwo(num: number) {
	return Math.round(num * 100 + Number.EPSILON) / 100;
}

export function useIndicator({ index, layouts }: IndicatorArgs): IndicatorReturns {
	const [indicatorStyle, setIndicatorStyle] = React.useState<ViewStyle | null>(null);
	const indicatorRef = React.useRef<View>(null) as React.RefObject<View>;
	const updateIndicator = React.useCallback(() => {
		if (!indicatorRef.current || !layouts.current) {
			return;
		}
		const cl = layouts.current[index];
		if (cl) {
			setIndicatorStyle(getIndicatorStyle({ left: cl.x, width: cl.width }));
		}
	}, [index, indicatorRef, layouts]);

	// update indicator when index changes (updateIndicator function changes to new reference when index changes)
	React.useEffect(() => {
		updateIndicator();
	}, [updateIndicator]);

	return [indicatorRef, updateIndicator, indicatorStyle];
}

export function useOffsetScroller(_: OffsetScrollArgs) {
	// This function is a placeholder for future implementation.
	// Currently, it does not perform any actions.
	// You can implement the logic for scrolling to a specific index here.
	return;
}
export function useAnimatedText({ activeColor, active, textColor }: AnimatedColorArgs): TextStyle {
	return React.useMemo(
		() => ({
			color: active ? activeColor : textColor,
			opacity: active ? 1 : 0.6
		}),
		[active, activeColor, textColor]
	);
}
