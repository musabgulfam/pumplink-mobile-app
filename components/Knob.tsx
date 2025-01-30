import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, useDerivedValue } from 'react-native-reanimated';
import { cartesian2Canvas, ReText } from 'react-native-redash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appearance, useColorScheme } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';


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

    const translationX = useSharedValue(cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).x - 25);
    const translationY = useSharedValue(cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).y - RADIUS - 25);
    const prevTranslationX = useSharedValue(cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).x);
    const prevTranslationY = useSharedValue(cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).y);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [
            { translateX: translationX.value },
            { translateY: translationY.value },
        ],
    }));

    const progressText = useDerivedValue(() => {
        return `${Math.floor(progress.value * 100)}`;
    });

    const pan = Gesture.Pan()
        .minDistance(1)
        // .failOffsetX([10, 10])
        // .failOffsetY([10, 10])
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

            // Convert angle to degrees and ensure it's positive
            // let angleDeg = (angle * 180) / Math.PI;
            progress.value = angle;

            // Convert angle back to X, Y based on the circle's radius
            const newX = CENTER_X + RADIUS * Math.cos(angle);
            const newY = CENTER_Y + RADIUS * Math.sin(angle);

            // Update translation values
            translationX.value = newX - 25;
            translationY.value = newY - 25;

            // Normalize angle for progress (convert radians to percentage)
            // progress.value = (angle) / (2 * Math.PI); // Normalize to 0-1 range
        })

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={styles.container}> 
                {
                    ANGLES_DEGREES.map(angle => <View key={angle} style={{
                        position: 'absolute',
                        top:
                            cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).y -
                            RADIUS * Math.cos((angle * 10 + 2) * Math.PI / 180) + 20,
                        left:
                            cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).x +
                            RADIUS * Math.sin((angle * 10 + 2) * Math.PI / 180) - 10,
                        zIndex: 2
                    }}>
                        <Text style={{
                            color: 'white',
                            textAlign: 'center'
                        }}>{angle}</Text>
                    </View>)
                }
                <ReText style={{
                    color: colorScheme === 'dark' ? 'white' : 'black',
                    // textAlign: 'center',
                    fontSize: 30,
                    position: 'absolute',
                    top: CENTER_Y,
                    left: CENTER_X - 35
                }} text={progressText} />
                <GestureDetector gesture={pan}>
                    <Svg>
                        <Circle
                            cx={CENTER_X}
                            cy={CENTER_Y}
                            stroke={'#303858'}
                            strokeWidth={50}
                            r={RADIUS}
                            fill={'none'}
                        />
                        <Animated.View style={[{
                            borderColor: 'white',
                            borderWidth: 3,
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                        }, animatedStyles]} />
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
        // height: '100%',
    },
    // ball: {
    //     width: BALL_SIZE,
    //     height: BALL_SIZE,
    //     borderRadius: BALL_SIZE / 2,
    //     // borderColor: 'black',
    //     borderWidth: 1
    //     // cursor: 'grab',
    // },
    // knob: {
    //     // width: KNOB_DIAMETER,
    //     // height: KNOB_DIAMETER,
    //     borderRadius: RADIUS,
    //     borderWidth: 3,
    //     // borderColor: 'black',
    // },
});