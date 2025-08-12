import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from '@/components';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import axios, { AxiosResponse } from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

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
            <View
                style={{
                    alignItems: 'center',
                }}
            >
                <Text style={styles.link}>
                    Don't have an account yet?{' '}
                    <Text
                        onPress={() => router.push('/register')}
                        style={{
                            textDecorationLine: 'underline',
                            color: '#555',
                        }}
                    >
                        Register
                    </Text>
                </Text>
            </View>
            <View
                style={{
                    marginTop: 20,
                    alignItems: 'center',
                }}
            >
                <Button
                    title="Login"
                    onPress={() => {
                        // Normally you’d validate credentials with an API
                        axios
                            .post(
                                'https://pumplink-backend-production.up.railway.app/api/v1/login',
                                { email, password },
                            )
                            .then(
                                (
                                    response: AxiosResponse<{
                                        message: string;
                                        token: string;
                                        user: {
                                            created_at: string;
                                            email: string;
                                            id: string;
                                            updated_at: string;
                                        };
                                    }>,
                                ) => {
                                    // Handle successful login
                                    SecureStore.setItemAsync('authToken', response.data.token);
                                    router.replace('/(restricted)/timer');
                                },
                            )
                            .catch((error) => {
                                // Handle login error
                                console.error(error);
                            });
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FF8A00',
        marginBottom: 20,
    },
    input: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#555',
    },
    link: {
        marginTop: 15,
        color: '#555',
        fontWeight: '600',
    },
});
