import * as React from 'react';
import type { ReactElement } from 'react';
import type { LayoutChangeEvent, TextProps, TextStyle } from 'react-native';
import { Animated, StyleSheet, View, Platform, Text, Pressable } from 'react-native';
import type { TabScreenProps } from './TabScreen';
import type { IconPosition, Mode, TabsTheme } from './utils';
import { useAnimatedText } from './internal';

// ----------------------------------------------------------------------

const AnimatedText = Animated.createAnimatedComponent<React.ComponentType<TextProps>>(Text as any);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Badge = React.memo(
	({ visible, size = 16, theme, children }: { visible: boolean; size: number; theme: TabsTheme; children?: React.ReactNode }) => {
		if (!visible) return null;

		return (
			<View
				style={[
					styles.badge,
					{
						backgroundColor: theme.colors.primary,
						borderRadius: size / 2,
						width: children ? size + 10 : size,
						height: size
					}
				]}>
				{children ? <Text style={[styles.badgeText, { fontSize: size / 2 }]}>{children}</Text> : null}
			</View>
		);
	}
);

const TabsHeaderItem = React.memo(
	function TabsHeaderItem({
		tab,
		tabIndex,
		active,
		goTo,
		onTabLayout,
		activeColor,
		textColor,
		theme,
		position,
		offset,
		childrenCount,
		uppercase,
		mode,
		iconPosition,
		showTextLabel,
		tabLabelStyle,
		fontSize,
		iconSize
	}: {
		tab: ReactElement<TabScreenProps>;
		tabIndex: number;
		active: boolean;
		goTo: (index: number) => void;
		onTabLayout: (index: number, e: LayoutChangeEvent) => void;
		activeColor: string;
		textColor: string;
		theme: TabsTheme;
		position: Animated.Value | undefined;
		offset: Animated.Value | undefined;
		childrenCount: number;
		uppercase?: boolean;
		iconPosition?: IconPosition;
		showTextLabel?: boolean;
		mode: Mode;
		tabLabelStyle?: TextStyle | undefined;
		fontSize?: number;
		iconSize?: number;
	}) {
		const scaleAnim = React.useRef(new Animated.Value(1)).current;
		const pressOpacity = React.useRef(new Animated.Value(1)).current;

		const { color, opacity } = useAnimatedText({
			active,
			position,
			offset,
			activeColor,
			textColor,
			tabIndex,
			childrenCount
		});

		const badgeConfig = React.useMemo(() => {
			const isFilled = tab.props.badge !== undefined && tab.props.badge !== null;
			const withoutContent = typeof tab.props.badge === 'boolean';
			return { isFilled, withoutContent };
		}, [tab.props.badge]);

		const handlePressIn = React.useCallback(
			(e: any) => {
				Animated.parallel([
					Animated.spring(scaleAnim, {
						toValue: 0.95,
						useNativeDriver: true,
						tension: 300,
						friction: 8
					}),
					Animated.timing(pressOpacity, {
						toValue: 0.7,
						duration: 100,
						useNativeDriver: true
					})
				]).start();

				tab.props.onPressIn?.(e);
			},
			[scaleAnim, pressOpacity, tab.props]
		);

		const handlePressOut = React.useCallback(() => {
			Animated.parallel([
				Animated.spring(scaleAnim, {
					toValue: 1,
					useNativeDriver: true,
					tension: 300,
					friction: 8
				}),
				Animated.timing(pressOpacity, {
					toValue: 1,
					duration: 100,
					useNativeDriver: true
				})
			]).start();
		}, [scaleAnim, pressOpacity]);

		const handlePress = React.useCallback(
			(e: any) => {
				if (Platform.OS === 'ios') {
					const { HapticFeedback } = require('react-native');
					HapticFeedback?.impact?.(HapticFeedback.ImpactFeedbackStyle.Light);
				}

				goTo(tabIndex);
				tab.props.onPress?.(e);
			},
			[goTo, tabIndex, tab.props]
		);

		const handleLayout = React.useCallback(
			(e: LayoutChangeEvent) => {
				onTabLayout(tabIndex, e);
			},
			[onTabLayout, tabIndex]
		);

		const textContent = React.useMemo(
			() => (uppercase ? tab.props.label.toUpperCase() : tab.props.label),
			[uppercase, tab.props.label]
		);

		const finalFontSize = React.useMemo(() => {
			// Use provided fontSize prop first, then tabLabelStyle fontSize, or fall back to 13
			return fontSize || tabLabelStyle?.fontSize || 13;
		}, [fontSize, tabLabelStyle?.fontSize]);

		const [adaptiveFontSize, setAdaptiveFontSize] = React.useState(finalFontSize);
		const textRef = React.useRef<Text>(null);

		const handleTextLayout = React.useCallback(
			(event: any) => {
				const { width: textWidth } = event.nativeEvent.layout;
				const containerWidth = mode === 'fixed' ? 120 : 150; // Estimate based on tab width
				const iconWidth = tab.props.icon ? (iconSize || 24) + 8 : 0; // Icon + margin
				const availableWidth = containerWidth - iconWidth - 32; // Padding

				if (textWidth > availableWidth && adaptiveFontSize > 10) {
					const ratio = availableWidth / textWidth;
					const newFontSize = Math.max(10, Math.floor(finalFontSize * ratio));
					if (newFontSize !== adaptiveFontSize) {
						setAdaptiveFontSize(newFontSize);
					}
				}
			},
			[mode, tab.props.icon, adaptiveFontSize, finalFontSize, iconSize]
		);

		React.useEffect(() => {
			setAdaptiveFontSize(finalFontSize);
		}, [finalFontSize]);

		const displayText = React.useMemo(() => {
			// Don't truncate text - let flexbox handle it
			return textContent;
		}, [textContent]);

		const containerStyle = React.useMemo(() => [styles.tabRoot, mode === 'fixed' && styles.tabRootFixed], [mode]);

		const pressableStyle = React.useMemo(
			() => [
				styles.touchableRipple,
				iconPosition === 'top' && styles.touchableRippleTop,
				tab.props.disabled && styles.touchableRippleDisabled
			],
			[iconPosition, tab.props.disabled]
		);

		const innerStyle = React.useMemo(
			() => [styles.touchableRippleInner, iconPosition === 'top' && styles.touchableRippleInnerTop],
			[iconPosition]
		);

		return (
			<View key={tab.props.label} style={containerStyle} onLayout={handleLayout}>
				<AnimatedPressable
					disabled={tab.props.disabled}
					onPress={handlePress}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					style={[
						pressableStyle,
						{
							transform: [{ scale: scaleAnim }],
							opacity: pressOpacity
						}
					]}
					accessibilityRole="button"
					accessibilityLabel={tab.props.label}
					accessibilityState={{ selected: active }}
					testID={`tab_${tabIndex}`}>
					<View style={innerStyle}>
						{tab.props.icon && (
							<Animated.View style={[styles.iconContainer, iconPosition !== 'top' && styles.marginRight, { opacity }]}>
								{React.createElement(tab.props.icon, {
									size: iconSize || 24,
									color: Platform.OS === 'android' ? textColor : textColor,
									accessibilityLabel: tab.props.label
								})}
							</Animated.View>
						)}

						{badgeConfig.isFilled && (
							<View
								style={[
									styles.badgeContainer,
									{
										right: (badgeConfig.withoutContent ? String(tab.props.badge).length * -2 : 0) - 2
									}
								]}>
								<Badge visible={true} size={badgeConfig.withoutContent ? 8 : 16} theme={theme}>
									{!badgeConfig.withoutContent ? tab.props.badge : undefined}
								</Badge>
							</View>
						)}

						{showTextLabel && (
							<View style={styles.textContainer}>
								<AnimatedText
									ref={textRef}
									selectable={false}
									onLayout={handleTextLayout}
									style={[
										styles.text,
										iconPosition === 'top' && styles.textTop,
										{ color, opacity, fontSize: adaptiveFontSize },
										tabLabelStyle
									]}>
									{displayText}
								</AnimatedText>
							</View>
						)}
					</View>
				</AnimatedPressable>
			</View>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.active === nextProps.active &&
			prevProps.tabIndex === nextProps.tabIndex &&
			prevProps.tab.props.label === nextProps.tab.props.label &&
			prevProps.tab.props.badge === nextProps.tab.props.badge &&
			prevProps.tab.props.disabled === nextProps.tab.props.disabled &&
			prevProps.activeColor === nextProps.activeColor &&
			prevProps.textColor === nextProps.textColor &&
			prevProps.uppercase === nextProps.uppercase &&
			prevProps.iconPosition === nextProps.iconPosition &&
			prevProps.showTextLabel === nextProps.showTextLabel &&
			prevProps.mode === nextProps.mode
		);
	}
);

const styles = StyleSheet.create({
	badgeContainer: {
		position: 'absolute',
		right: -8,
		top: -4,
		zIndex: 10
	},
	badge: {
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 3
	},
	badgeText: {
		color: '#fff',
		fontWeight: '700',
		textAlign: 'center',
		fontSize: 10
	},
	tabRoot: {
		position: 'relative',
		marginHorizontal: 3
	},
	tabRootFixed: {
		flex: 1
	},
	touchableRipple: {
		height: 48,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 24,
		flex: 1,
		marginHorizontal: 6,
		backgroundColor: 'transparent',
		overflow: 'hidden'
	},
	touchableRippleTop: {
		height: 70,
		borderRadius: 35
	},
	touchableRippleInner: {
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 16,
		paddingVertical: 0,
		flex: 1,
		borderRadius: 24,
		backgroundColor: 'transparent'
	},
	touchableRippleInnerTop: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 35
	},
	touchableRippleDisabled: {
		opacity: 0.3
	},
	iconContainer: {
		width: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
		flexShrink: 0
	},
	text: {
		textAlign: 'center',
		letterSpacing: 0.5,
		includeFontPadding: false,
		textAlignVertical: 'center',
		fontWeight: '600',
		flexShrink: 1,
		...Platform.select({
			web: {
				userSelect: 'none',
				fontFamily: 'system-ui, -apple-system, sans-serif'
			},
			android: {
				includeFontPadding: false,
				textAlignVertical: 'center',
				fontFamily: 'Roboto'
			},
			ios: {
				fontFamily: 'SF Pro Display'
			},
			default: {}
		})
	},
	textTop: {
		marginTop: 8,
		fontSize: 12
	},
	textContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
		minHeight: 24
	},
	marginRight: {
		marginRight: 8
	}
});

export default TabsHeaderItem;
