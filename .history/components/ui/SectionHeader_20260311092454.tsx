import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface SectionHeaderProps {
    title: string;
    icon?: React.ReactNode;
}

export function SectionHeader({ title, icon }: SectionHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                {icon}
            </View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.line} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
        backgroundColor: 'red'
    },
    iconWrapper: {
        marginRight: 10,
        opacity: 0.9,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginLeft: 12,
    },
});
