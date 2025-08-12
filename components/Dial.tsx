import React, { useCallback } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, Defs, ClipPath, Rect } from 'react-native-svg';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    useDerivedValue,
    useAnimatedProps,
    interpolate,
} from 'react-native-reanimated';
import { cartesian2Canvas, ReText } from 'react-native-redash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const BALL_SIZE = 50;

const { width, height } = Dimensions.get('window');

const CIRCLE_LENGTH = 1000;

const RADIUS: number = CIRCLE_LENGTH / (2 * Math.PI);

const CENTER_X: number = width / 2;

const CENTER_Y: number = height / 2;

export default function Dial() {
    const colorScheme = useColorScheme();

    const ANGLES_DEGREES: number[] = [
        0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34,
    ];

    const progress = useSharedValue(0);
    const translationX = useSharedValue(
        cartesian2Canvas({ x: -25, y: 0 }, { x: CENTER_X, y: CENTER_Y }).x,
    );
    const translationY = useSharedValue(
        cartesian2Canvas({ x: 0, y: RADIUS + 25 }, { x: CENTER_X, y: CENTER_Y }).y,
    );
    const prevTranslationX = useSharedValue(
        cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).x,
    );
    const prevTranslationY = useSharedValue(
        cartesian2Canvas({ x: 0, y: 0 }, { x: CENTER_X, y: CENTER_Y }).y,
    );
    const prevTriggerredAngle = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateX: translationX.value }, { translateY: translationY.value }],
    }));

    const sendRequest = useCallback(async () => {
        try {
            const response = await axios.post('/api/endpoint', {
                data: progress.value,
                headers: {
                    Authorization: `Bearer YOUR_ACCESS_TOKEN`,
                },
            });
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error sending request:', error);
        }
    }, []);

    // const angleTextTheme = ;

    const progressText = useDerivedValue(() => {
        let _progress = Math.floor(progress.value);
        return `${(_progress / 10).toFixed(0)} ${Math.floor(_progress / 10) < 2 ? 'minute' : 'minutes'}`;
    });

    // Function to trigger haptics safely
    function triggerHaptic() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const pan = Gesture.Pan()
        .minDistance(1)
        .minPointers(1)
        .maxPointers(1)
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
            let angleDeg = ((angle * 180) / Math.PI + 90 + 360) % 360; // Normalize and adjust for top

            // Ensure angle is always positive (0° to 302°)
            if (angleDeg > 300) return;

            progress.value = angleDeg;

            // Haptic/vibration feedback upon knob rotation of 20 degrees
            if (Math.abs(angleDeg - prevTriggerredAngle.value) >= 20) {
                runOnJS(triggerHaptic)(); // Ensure it's executed on the JS thread
                prevTriggerredAngle.value = angleDeg;
            }

            const newX = CENTER_X + RADIUS * Math.cos(angle);
            const newY = CENTER_Y + RADIUS * Math.sin(angle);

            translationX.value = newX - 25;
            translationY.value = newY - 25;
        });

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value / 360),
    }));

    const waterLevel = useDerivedValue(() => Math.max(1, progress.value), [progress]);

    const WaterContainerComponent = Animated.createAnimatedComponent(Rect);

    const dynamicHeight = useAnimatedProps(() => ({
        height: interpolate(waterLevel.value, [1, 330], [1, RADIUS * 2]),
    }));

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={styles.container}>
                {ANGLES_DEGREES.map((angle) => (
                    <View
                        key={angle}
                        style={{
                            position: 'absolute',
                            top: cartesian2Canvas(
                                { x: 0, y: RADIUS * Math.cos((angle * 10 * Math.PI) / 180) + 10 },
                                { x: CENTER_X, y: CENTER_Y },
                            ).y,
                            left: cartesian2Canvas(
                                { x: RADIUS * Math.sin((angle * 10 * Math.PI) / 180) - 10, y: 0 },
                                { x: angle === 0 ? CENTER_X + 5 : CENTER_X, y: CENTER_Y },
                            ).x,
                            zIndex: 2,
                        }}
                    >
                        <Text
                            style={[
                                {
                                    color: colorScheme === 'dark' ? 'white' : 'black',
                                    textAlign: 'center',
                                },
                            ]}
                        >
                            {angle}
                        </Text>
                    </View>
                ))}
                {/* <TouchableOpacity style={{...styles.buttonStyle, borderColor: colorScheme === 'dark' ? 'white' : 'black' }}>
                    <ReText style={{ ...styles.animatedButtonTextStyle, color: colorScheme === 'dark' ? 'white' : 'black' }} text={progressText} />
                </TouchableOpacity> */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        position: 'absolute',
                        top: 50,
                    }}
                >
                    <ReText
                        style={{
                            ...styles.animatedButtonTextStyle,
                            color: colorScheme === 'dark' ? 'white' : 'black',
                        }}
                        text={progressText}
                    />
                    <MaterialIcons
                        name="fiber-manual-record"
                        size={30}
                        color={'red'}
                        style={{
                            // textShadowColor: online ? '#00ff00' : '#ff0000',
                            textShadowColor: '#ff0000',
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: 10, // glow effect
                            margin: 5,
                        }}
                    />
                </View>
                <GestureDetector gesture={pan}>
                    <Svg>
                        <AnimatedCircle
                            cx={CENTER_X}
                            cy={CENTER_Y}
                            stroke={'#FF8A00'}
                            strokeWidth={50}
                            r={RADIUS}
                            fill={'none'}
                            strokeDasharray={CIRCLE_LENGTH}
                            strokeLinecap={'round'}
                            transform={`rotate(271, ${CENTER_X}, ${CENTER_Y})`}
                            animatedProps={animatedProps}
                        />
                        <Animated.View
                            style={[
                                {
                                    ...styles.ballStyle,
                                    borderColor: colorScheme === 'dark' ? 'white' : 'black',
                                },
                                animatedStyles,
                            ]}
                        />
                        <Defs>
                            {/* Define a ClipPath to clip the filling effect */}
                            <ClipPath id="clip">
                                <Circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS - 25} />
                            </ClipPath>
                        </Defs>
                        <Circle
                            cx={CENTER_X}
                            cy={CENTER_Y}
                            r={RADIUS - 25}
                            fill={'none'}
                            strokeWidth={2}
                            stroke={colorScheme === 'dark' ? 'white' : 'black'}
                        />
                        <Circle
                            cx={CENTER_X}
                            cy={CENTER_Y}
                            r={RADIUS + 25}
                            fill={'none'}
                            strokeWidth={2}
                            stroke={colorScheme === 'dark' ? 'white' : 'black'}
                        />
                        <WaterContainerComponent
                            fill={'#00BFFF'}
                            x={CENTER_X - RADIUS}
                            y={CENTER_Y - RADIUS}
                            height={100}
                            width={RADIUS * 2}
                            clipPath="url(#clip)"
                            transform={`rotate(180, ${CENTER_X}, ${CENTER_Y})`}
                            animatedProps={dynamicHeight}
                        />
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
        borderWidth: 2,
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: BALL_SIZE / 2,
    },
    buttonStyle: {
        position: 'absolute',
        top: CENTER_Y,
        width: 170,
        height: 70,
        left: CENTER_X - 170 / 2,
        borderWidth: 3,
        borderRadius: 30,
        zIndex: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animatedButtonTextStyle: {
        fontSize: 30,
        textAlign: 'center',
    },
    dialContainer: {
        borderWidth: 1,
        height,
        width,
    },
    buttonContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
});
