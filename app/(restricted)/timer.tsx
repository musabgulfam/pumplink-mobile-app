import { Button } from '@/components';
import Dial from '@/components/Dial';
import { useColorScheme, View } from 'react-native';
import { StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function Timer() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    return (
        <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? 'black' : 'white' }}>
            <Dial />
            <View style={styles.buttonContainerStyle}>
                <Button
                    title="GO"
                    onPress={async () => {
                        await SecureStore.deleteItemAsync('authToken');
                        router.replace('/(auth)/login');
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
});
