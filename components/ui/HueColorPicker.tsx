import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    runOnJS,
    withSpring
} from 'react-native-reanimated';

// Helper: Hue to Hex (S=1, L=0.5 for vibrant colors)
function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert Hex to Hue (approximate)
function hexToHue(hex: string): number {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;

    if (max === min) {
        return 0;
    } else {
        const d = max - min;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    return h;
}

interface HueColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    width?: number;
}

export function HueColorPicker({ color, onChange, width = Dimensions.get('window').width - 64 }: HueColorPickerProps) {
    // Constants
    const PICKER_HEIGHT = 40;
    const KNOB_SIZE = 48; // Larger touch area

    // Shared Values for Animation
    const positionX = useSharedValue(0);

    // Initialize position from color prop (Hue)
    useEffect(() => {
        const hue = hexToHue(color);
        const pos = (hue / 360) * width;
        positionX.value = withSpring(Math.max(0, Math.min(pos, width)));
    }, []); // Run once on mount to set initial position, or when color changes externally if needed (careful of loops)

    // Update Color Logic
    const updateColor = (x: number) => {
        const clampedX = Math.max(0, Math.min(x, width));
        const hue = (clampedX / width) * 360;
        const newHex = hslToHex(hue, 100, 50);
        onChange(newHex);
    };

    // Gesture Handler
    const gesture = Gesture.Pan()
        .onChange((e) => {
            positionX.value = Math.max(0, Math.min(positionX.value + e.changeX, width));
            runOnJS(updateColor)(positionX.value);
        });

    // Tap Gesture (optional, but pan covers drags)
    // We can treat direct touch as pan start logic if we wrap in a view that detects tap location?
    // Pan accounts for "start" at point?
    // Actually Pan is continuous. For a slider, we usually want "tap to jump" too.
    // Implementation details: React Native Gesture Handler Pan tracks movement. 
    // To handle tap, we might need a TapGesture composed or just use `onBegin`.
    // `onBegin` gives absolute coordinates relative to the view? 
    // Let's stick to dragging for now, or add `onTouchesDown` if needed.

    /* Actually, to support tapping anywhere on the bar:
       We can wrap specific logic or just trust the user to drag the knob.
       For better UX, let's allow dragging the knob.
    */

    const animatedKnobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: positionX.value - KNOB_SIZE / 2 }],
    }));

    return (
        <View style={[styles.container, { width }]}>
            <LinearGradient
                colors={[
                    '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.gradient, { height: PICKER_HEIGHT, borderRadius: PICKER_HEIGHT / 2 }]}
            />

            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.knobContainer, animatedKnobStyle, { width: KNOB_SIZE, height: KNOB_SIZE, top: (PICKER_HEIGHT - KNOB_SIZE) / 2 }]}>
                    <View style={styles.knobInner} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        marginBottom: 20
    },
    gradient: {
        width: '100%',
    },
    knobContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0,0,0,0.1)', // Debug hit box
    },
    knobInner: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: 'rgba(0,0,0,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5
    }
});
