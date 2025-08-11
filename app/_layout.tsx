import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  return <Stack screenOptions={{
    headerShown: false
  }} />;
}
