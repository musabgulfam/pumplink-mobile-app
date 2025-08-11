import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const router = useRouter();

//   useEffect(() => {
//     (async () => {
//       const token = await SecureStore.getItemAsync("authToken");
//       if (token) {
//         setIsLoggedIn(true);
//         router.replace("/private");
//       } else {
//         setIsLoggedIn(false);
//         router.replace("/login");
//       }
//     })();
//   }, []);

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="private" />
    </Stack>
  );
}
