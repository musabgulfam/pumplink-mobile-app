import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import Svg from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS, useDerivedValue } from 'react-native-reanimated';
import { cartesian2Canvas, ReText } from 'react-native-redash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const BALL_SIZE = 50;

const { width, height } = Dimensions.get('window');

const CIRCLE_LENGTH = 1000;

const RADIUS: number = CIRCLE_LENGTH / (2 * Math.PI);

export default function Knob() {

    let colorScheme = useColorScheme();

    const CENTER_X: number = width / 2;

    const CENTER_Y: number = height / 2;

    const ANGLES_DEGREES: number[] = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];

    const progress = useSharedValue(0);

    const translationX = useSharedValue(cartesian2Canvas({ x: -25, y: 0 }, { x: CENTER_X, y: CENTER_Y }).x);
    const translationY = useSharedValue(cartesian2Canvas({ x: 0, y: RADIUS + 25 }, { x: CENTER_X, y: CENTER_Y }).y);
    const prevTranslationX = useSharedValue(cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).x);
    const prevTranslationY = useSharedValue(cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).y);
    const prevTriggerredAngle = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [
            { translateX: translationX.value },
            { translateY: translationY.value },
        ],
    }));

    const progressText = useDerivedValue(() => {
        let _progress = Math.floor(progress.value)
        return `${(_progress/10).toFixed(0)} ${_progress <= 1 ? 'minute' : 'minutes'}`;
    });

    // Function to trigger haptics safely
    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    };

    const pan = Gesture.Pan()
        .minDistance(1)
        .shouldCancelWhenOutside(true)
        .onStart(() => {
            prevTranslationX.value = translationX.value;
            prevTranslationY.value = translationY.value;
        })
        .onUpdate((event) => {
            // Calculate new angle based on user movement
            const deltaX = event.translationX + prevTranslationX.value - CENTER_X;
            const deltaY = event.translationY + prevTranslationY.value - CENTER_Y;

            let angle = Math.atan2(deltaY, deltaX); // Calculate angle in radians
            
            // Adjust angle by +90 degrees to make 0° start from the top of the dial
            let angleDeg = ((angle * 180) / Math.PI + 90 + 360) % 360;  // Normalize and adjust for top
            
            // Ensure angle is always positive (0° to 302°)
            if (angleDeg > 302) return;
            
            progress.value = angleDeg;

            // Haptic/vibration feedback upon knob rotation of 20 degrees
            if(Math.abs(angleDeg - prevTriggerredAngle.value) >= 20) {
                runOnJS(triggerHaptic)(); // Ensure it's executed on the JS thread
                prevTriggerredAngle.value = angleDeg
            }

            const newX = CENTER_X + RADIUS * Math.cos(angle);
            const newY = CENTER_Y + RADIUS * Math.sin(angle);

            translationX.value = newX - 25;
            translationY.value = newY - 25;
        })

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={styles.container}>
                <TouchableOpacity
                    onPress={() => {
                        console.log(progress.value)
                    }}
                    style={{
                        width: 200,
                        height: 80,
                        borderWidth: 3,
                        borderColor: colorScheme === 'dark' ? 'white' : 'black',
                        position: 'absolute',
                        bottom: 70,
                        right: CENTER_X - 200/2,
                        padding: 20,
                        zIndex: 3,
                        borderRadius: 50
                    }}
                >
                    <Text style={{
                        color: colorScheme === 'dark' ? 'white' : 'black',
                        fontSize: 20,
                        textAlign: 'center'
                    }}>Go</Text>
                </TouchableOpacity>
                {
                    ANGLES_DEGREES.map(angle => <View key={angle} style={{
                        position: 'absolute',
                        top:
                            cartesian2Canvas({ x: 0, y: RADIUS * Math.cos((angle * 10 + 2) * Math.PI / 180) - 16 }, { x: CENTER_X, y: CENTER_Y }).y,
                        left:
                            cartesian2Canvas({ x: (RADIUS * Math.sin((angle * 10 + 2) * Math.PI / 180) - 6), y: 0 }, { x: CENTER_X, y: CENTER_Y }).x,
                        zIndex: 2
                    }}>
                        <Text style={{
                            color: colorScheme === 'dark' ? 'white' : 'black',
                            textAlign: 'center'
                        }}>{angle}</Text>
                    </View>)
                }
                <ReText style={{
                    color: colorScheme === 'dark' ? 'white' : 'black',
                    fontSize: 30,
                    position: 'absolute',
                    top: CENTER_Y,
                    left: CENTER_X - 70,
                    textAlign: 'center'
                }} text={progressText} />
                <GestureDetector gesture={pan}>
                    <Svg>
                        <Animated.View style={[{...styles.ballStyle, borderColor: colorScheme === 'dark' ? 'white' : 'black'}, animatedStyles]} />
                    </Svg>
                </GestureDetector>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ballStyle: {
        borderColor: 'white',
        borderWidth: 3,
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: 25,
    }
});