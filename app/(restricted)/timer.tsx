import { Button } from '@/components';
import Dial from '@/components/Dial';
import { Alert, Platform, StyleSheet, Text, useColorScheme, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { api } from '@/api';
import { AxiosResponse } from 'axios';

export default function Timer() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const [state, setState] = useState<'on' | 'off'>('off');
    const [isDeviceActivated, setIsDeviceActivated] = useState(false);
    const [activeUntilTime, setActiveUntilTime] = useState<Date | null>(null);
    const progressText = useRef('');

    useFocusEffect(() => {
        (async () => {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                router.replace('/(auth)/login');
                return;
            }
            const ws = new WebSocket(`ws://${Platform.OS === 'android' ? '10.0.2.2:8080' : 'localhost:8080'}/api/v1/ws`);

            ws.onopen = () => {
                console.log('WebSocket connected!');
                ws.send(token); // Send the token after connection is established
            };

            ws.onmessage = (event: { data: 'on' | 'off' }) => {
                console.log('Received message:', event.data);
                setState(event?.data || 'off');
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = (msg) => {
                console.log('WebSocket connection closed: ', msg.code, msg.reason);
                if(msg.code === 1008) {
                    SecureStore.deleteItemAsync('authToken'); // Clear token on unauthorized access
                    router.replace('/(auth)/login');
                    return;
                }
            };
        })();
    });

    return (
        <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? 'black' : 'white' }}>
            {!isDeviceActivated && !activeUntilTime ?
                <>
                    <Dial state={state} onProgressChange={(progress) => progressText.current = progress} />
                    <View style={styles.buttonContainerStyle}>
                        <Button
                            title="GO"
                            onPress={async () => {
                                console.log('Activating device...', progressText.current);
                                const token = await SecureStore.getItemAsync('authToken');
                                console.log('token: ', token)
                                await api.post('/activate', {
                                    device_id: 1,
                                    duration: progressText.current.split(' ')[0],
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                })
                                    .catch((error) => {
                                        console.error('Error activating device:', error);
                                    });

                                setIsDeviceActivated(true);

                                const statusRes: AxiosResponse<{
                                    device_id: number;
                                    status: string;
                                    active_until?: string;
                                }> = await api.get('/device/1/status', {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    }
                                });

                                console.log('Device status response:', statusRes.data);

                                if (statusRes.data) {
                                    setActiveUntilTime(new Date(statusRes.data.active_until ?? '') || null);
                                }
                            }}
                            viewStyle={{
                                width: '40%',
                                padding: 20
                            }}
                        />
                        <Button title='Logout' onPress={async () => {
                            await SecureStore.deleteItemAsync('authToken');
                            router.replace('/(auth)/login');
                        }} viewStyle={{
                                width: '40%',
                                padding: 20
                            }} />
                    </View></> : <Text>{activeUntilTime?.toString()}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainerStyle: {
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingBottom: 20,
        flexDirection: 'row',
    },
});
