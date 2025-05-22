import { Animated } from 'react-native';

let MaterialCommunityIcons: any;

try {
	MaterialCommunityIcons = Animated.createAnimatedComponent(require('react-native-vector-icons/MaterialCommunityIcons').default);
} catch (_e: any) {
	const e = _e;
	console.log({ e });
	let isErrorLogged = false;

	// Fallback component for icons
	// @ts-ignore
	MaterialCommunityIcons = ({ name, ...rest }) => {
		if (!isErrorLogged) {
			if (!/(Cannot find module|Module not found|Cannot resolve module)/.test(e.message)) {
				console.error(e);
			}

			console.warn(
				`Tried to use the icon '${name}' in a component from 'react-native-paper-tabs', but 'react-native-vector-icons/MaterialCommunityIcons' could not be loaded.`,
				`To remove this warning, try installing 'react-native-vector-icons' or use another method to specify icon: https://callstack.github.io/react-native-paper/icons.html.`
			);

			isErrorLogged = true;
		}

		return (
			<Animated.Text {...rest} selectable={false}>
				□
			</Animated.Text>
		);
	};
}

export default MaterialCommunityIcons;
