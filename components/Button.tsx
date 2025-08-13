import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

export function Button({ title, onPress, viewStyle }: { title: string; onPress: () => void; viewStyle?: ViewStyle }) {
    return (
        <TouchableOpacity style={[styles.buttonStyle, { backgroundColor: title === 'Logout' ? '#555' : '#FF8A00' }, viewStyle]} onPress={onPress}>
            <Text style={styles.buttonTextStyle}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonStyle: {
        backgroundColor: '#FF8A00',
        borderRadius: 20,
        padding: 20,
        paddingHorizontal: 40,
        shadowColor: '#FF8A00',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonTextStyle: {
        color: 'white',
        // fontSize: 18,
        fontWeight: 'bold',
    },
});
