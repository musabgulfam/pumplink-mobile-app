import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity 
} from 'react-native';
import { Button } from '@/components';
import { useRouter } from 'expo-router';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account 🌸</Text>
            <Text style={styles.subtitle}>Join our cute little community</Text>

            <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#aaa"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button
                title="Register"
                onPress={() => {
                    /* handle register */
                }}
            />

            <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.link}>Already have an account? Login 💌</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF4F9',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 5,
        color: '#FF8A00',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        color: '#555',
    },
    input: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#FFD6E8',
    },
    link: {
        marginTop: 15,
        color: '#FF69B4',
        fontWeight: '600',
    },
});
