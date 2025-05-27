import * as React from 'react';
import type { ReactElement } from 'react';
import type { LayoutChangeEvent, TextProps, TextStyle } from 'react-native';
import { Animated, StyleSheet, View, Platform, Text, Pressable, Dimensions } from 'react-native';
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
		fontSize
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

		const dynamicFontSize = React.useMemo(() => {
			if (fontSize) return fontSize; // Use provided fontSize if available
			const screenWidth = Dimensions.get('window').width;
			const tabWidth = mode === 'fixed' ? screenWidth / childrenCount : Math.min(screenWidth / 3, 120);
			const iconSpace = tab.props.icon ? 32 : 0;
			const paddingSpace = 32;
			const badgeSpace = badgeConfig.isFilled ? 16 : 0;
			const availableTextWidth = tabWidth - iconSpace - paddingSpace - badgeSpace;

			let fontSizeValue = 11; // Reduced from 12

			if (availableTextWidth > 80 && textContent.length <= 6) {
				fontSizeValue = 13; // Reduced from 14
			} else if (availableTextWidth > 100 && textContent.length <= 4) {
				fontSizeValue = 15; // Reduced from 16
			}

			const textLength = textContent.length;
			if (textLength > 12) {
				fontSizeValue = Math.max(7, fontSizeValue - 3); // Adjusted from Math.max(8, fontSize - 4)
			} else if (textLength > 8) {
				fontSizeValue = Math.max(9, fontSizeValue - 2); // Adjusted from Math.max(10, fontSize - 2)
			}

			if (availableTextWidth < 40) {
				fontSizeValue = Math.max(7, fontSizeValue - 2); // Adjusted from Math.max(8, fontSize - 2)
			} else if (availableTextWidth < 60) {
				fontSizeValue = Math.max(8, fontSizeValue - 1); // Adjusted from Math.max(9, fontSize - 1)
			}

			return fontSizeValue;
		}, [fontSize, textContent.length, mode, childrenCount, tab.props.icon, badgeConfig.isFilled]);

		const maxCharacters = React.useMemo(() => {
			const screenWidth = Dimensions.get('window').width;
			const tabWidth = mode === 'fixed' ? screenWidth / childrenCount : Math.min(screenWidth / 3, 120);
			const iconSpace = tab.props.icon ? 32 : 0;
			const paddingSpace = 32;
			const badgeSpace = badgeConfig.isFilled ? 16 : 0;
			const availableTextWidth = tabWidth - iconSpace - paddingSpace - badgeSpace;

			const characterWidth = dynamicFontSize * (Platform.OS === 'ios' ? 0.55 : 0.6);
			const maxChars = Math.floor(availableTextWidth / characterWidth);

			return Math.max(3, maxChars);
		}, [dynamicFontSize, mode, childrenCount, tab.props.icon, badgeConfig.isFilled]);

		const displayText = React.useMemo(() => {
			if (textContent.length <= maxCharacters) {
				return textContent;
			}

			if (maxCharacters <= 4) {
				return `${textContent.substring(0, 1)}...`;
			}

			return `${textContent.substring(0, maxCharacters - 3)}...`;
		}, [textContent, maxCharacters]);

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
									size: 24,
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
									selectable={false}
									numberOfLines={1}
									ellipsizeMode="tail"
									style={[
										styles.text,
										iconPosition === 'top' && styles.textTop,
										{ color, opacity, fontSize: dynamicFontSize },
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
			prevProps.mode === nextProps.mode &&
			prevProps.fontSize === nextProps.fontSize // Added fontSize to comparison
		);
	}
);

const styles = StyleSheet.create({
	badgeContainer: {
		position: 'absolute',
		left: 0,
		top: -2
	},
	badge: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	badgeText: {
		color: '#fff',
		fontWeight: 'bold',
		textAlign: 'center'
	},
	tabRoot: {
		position: 'relative'
	},
	tabRootFixed: {
		flex: 1
	},
	touchableRipple: {
		height: 48,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderRadius: 8
	},
	touchableRippleTop: {
		height: 72
	},
	touchableRippleInner: {
		height: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 16,
		minWidth: 90,
		maxWidth: 360
	},
	touchableRippleInnerTop: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	},
	touchableRippleDisabled: {
		opacity: 0.4
	},
	iconContainer: {
		width: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center'
	},
	text: {
		textAlign: 'center',
		letterSpacing: 0.5,
		includeFontPadding: false,
		textAlignVertical: 'center',
		fontWeight: '500',
		...Platform.select({
			web: {
				transitionDuration: '150ms',
				transitionProperty: 'all',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				textOverflow: 'ellipsis'
			},
			android: {
				includeFontPadding: false,
				textAlignVertical: 'center'
			},
			default: {}
		})
	},
	textTop: {
		marginTop: 6
	},
	textContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1
	},
	marginRight: {
		marginRight: 8
	}
});

export default TabsHeaderItem;
