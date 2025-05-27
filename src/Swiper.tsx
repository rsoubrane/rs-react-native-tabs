import * as React from 'react';
import { StyleSheet, View, Animated, LayoutAnimation, Platform } from 'react-native';
import type { TabScreenProps } from './TabScreen';
import TabsHeader from './TabsHeader';
import type { SwiperProps } from './utils';
import { useTabIndex } from './context';

// ----------------------------------------------------------------------

const Swiper = React.memo(function Swiper(props: SwiperProps) {
	const { theme, dark, style, iconPosition, showTextLabel, showLeadingSpace, uppercase, mode, tabHeaderStyle, tabLabelStyle, fontSize } =
		props;

	const index = useTabIndex();
	const fadeAnim = React.useRef(new Animated.Value(1)).current;
	const [isTransitioning, setIsTransitioning] = React.useState(false);

	const children: React.Component<TabScreenProps>[] = props.children;

	const currentScreen = children[index];

	React.useEffect(() => {
		if (Platform.OS === 'ios') {
			LayoutAnimation.configureNext({
				duration: 200,
				update: {
					type: LayoutAnimation.Types.easeInEaseOut
				},
				create: {
					type: LayoutAnimation.Types.easeInEaseOut,
					property: LayoutAnimation.Properties.opacity
				}
			});
		} else {
			setIsTransitioning(true);
			Animated.sequence([
				Animated.timing(fadeAnim, {
					toValue: 0.7,
					duration: 100,
					useNativeDriver: true
				}),
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 100,
					useNativeDriver: true
				})
			]).start(() => setIsTransitioning(false));
		}
	}, [index, fadeAnim]);

	const renderProps = React.useMemo(
		() => ({
			children,
			theme,
			dark,
			style,
			offset: undefined,
			position: undefined,
			iconPosition,
			showTextLabel,
			showLeadingSpace,
			uppercase,
			mode,
			tabHeaderStyle,
			tabLabelStyle,
			fontSize // Pass fontSize to TabsHeader
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

	if (!currentScreen) {
		return null;
	}

	return (
		<View style={styles.root}>
			<TabsHeader {...renderProps} />
			<Animated.View
				style={[
					styles.content,
					{
						opacity: fadeAnim,
						transform: [
							{
								scale: isTransitioning ? 0.98 : 1
							}
						]
					}
				]}>
				{currentScreen as any}
			</Animated.View>
		</View>
	);
});

const styles = StyleSheet.create({
	root: {
		flex: 1
	},
	content: {
		flex: 1
	}
});

export default Swiper;
