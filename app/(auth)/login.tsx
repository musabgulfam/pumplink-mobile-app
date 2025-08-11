import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from '@/components';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        // Normally you’d validate credentials with an API
        if (email && password) {
            await SecureStore.setItemAsync('authToken', 'dummy-token');
            router.replace('/(restricted)/timer');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back 👋</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={() => {}} />
            <Button title="Go to Register" onPress={() => router.push('/register')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF4F9', padding: 20, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '700', color: '#FF69B4', marginBottom: 20 },
    input: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#FFD6E8',
    },
});
