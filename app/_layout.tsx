import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { Provider, useDispatch } from 'react-redux';
import store from '../store';
import { setInitialState } from '../store/slices/authSlice';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userStr = await AsyncStorage.getItem("user");
        let user = null;
        if (userStr) {
          user = JSON.parse(userStr);
        }
        dispatch(setInitialState({ token, user }));
      } catch (e) {
        console.error("Failed to load auth state", e);
        dispatch(setInitialState({ token: null, user: null }));
      } finally {
        setIsReady(true);
      }
    };

    loadAuthState();
  }, [dispatch]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}
