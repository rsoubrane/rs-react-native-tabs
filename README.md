# Tabs Component

A customizable tabs component for React Native that supports tailwind/nativewind colors and Lucide icons.

## Features

- Support for tailwind colors
- Uses Lucide icons
- Dark mode support
- Customizable tab headers
- Badge support
- Responsive design

## Usage

```jsx
import { Tabs, TabScreen, TabsProvider } from '@/components/_tabs';
import { Home, User, Bell, Settings } from 'lucide-react-native';

export default function MyScreen() {
  const isDark = false; // Use your own theme system

  return (
    <TabsProvider defaultIndex={0}>
      <Tabs
        dark={isDark}
        style={{
          backgroundColor: isDark ? '#1f2937' : '#f8fafc'
        }}
        theme={{
          colors: {
            primary: isDark ? '#3b82f6' : '#2563eb',
            surface: isDark ? '#111827' : '#ffffff',
            onSurface: isDark ? '#f3f4f6' : '#1f2937',
          }
        }}
        tabLabelStyle={{
          color: isDark ? '#e2e8f0' : '#374151',
          fontSize: 14,
          fontWeight: '500',
        }}
        fontSize={14}
        iconSize={20}
      >
        <TabScreen label="Home" icon={Home}>
          <HomeScreen />
        </TabScreen>
        <TabScreen label="Profile" icon={User}>
          <ProfileScreen />
        </TabScreen>
        <TabScreen label="Notifications" icon={Bell} badge={5}>
          <NotificationsScreen />
        </TabScreen>
        <TabScreen label="Settings" icon={Settings}>
          <SettingsScreen />
        </TabScreen>
      </Tabs>
    </TabsProvider>
  );
}
```

## Props

### Tabs

| Prop             | Type                    | Description                           |
| ---------------- | ----------------------- | ------------------------------------- |
| `theme`          | Object                  | Theme object with colors.primary etc. |
| `dark`           | boolean                 | Whether to use dark mode              |
| `style`          | ViewStyle               | Style for the tabs container          |
| `mode`           | 'fixed' \| 'scrollable' | Tab header layout mode                |
| `iconPosition`   | 'leading' \| 'top'      | Position of the icon                  |
| `showTextLabel`  | boolean                 | Whether to show text labels           |
| `uppercase`      | boolean                 | Whether to uppercase labels           |
| `tabHeaderStyle` | ViewStyle               | Style for the tab header              |
| `tabLabelStyle`  | TextStyle               | Style for the tab labels              |
| `fontSize`       | number                  | Font size for tab labels              |
| `iconSize`       | number                  | Size for tab icons                    |

### TabScreen

| Prop       | Type                        | Description                                                   |
| ---------- | --------------------------- | ------------------------------------------------------------- |
| `label`    | string                      | Tab label text                                                |
| `icon`     | Component                   | Lucide icon component (e.g., `Home` from lucide-react-native) |
| `badge`    | string \| number \| boolean | Badge content                                                 |
| `disabled` | boolean                     | Whether the tab is disabled                                   |
| `onPress`  | function                    | Callback when tab is pressed                                  |

### TabsProvider

| Prop            | Type     | Description                     |
| --------------- | -------- | ------------------------------- |
| `defaultIndex`  | number   | Initial tab index               |
| `forcedIndex`   | number   | Externally controlled tab index |
| `onChangeIndex` | function | Callback when tab changes       |
