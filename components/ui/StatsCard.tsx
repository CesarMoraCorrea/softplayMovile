import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardProps {
    title: string;
    value: string | number;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
}

export default function StatsCard({ title, value, change, changeType, icon, description }: StatsCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color="#4F46E5" />
                </View>
                <View style={[
                    styles.badge,
                    changeType === 'positive' && styles.badgePositive,
                    changeType === 'negative' && styles.badgeNegative,
                    changeType === 'neutral' && styles.badgeNeutral,
                ]}>
                    <Text style={[
                        styles.badgeText,
                        changeType === 'positive' && styles.badgeTextPositive,
                        changeType === 'negative' && styles.badgeTextNegative,
                        changeType === 'neutral' && styles.badgeTextNeutral,
                    ]}>{change}</Text>
                </View>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        backgroundColor: '#EEF2FF', // Indigo 50
        padding: 10,
        borderRadius: 10,
    },
    title: {
        fontSize: 14,
        color: '#6B7280', // Gray 500
        fontWeight: '500',
        marginBottom: 4,
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827', // Gray 900
        marginBottom: 8,
    },
    description: {
        fontSize: 12,
        color: '#9CA3AF', // Gray 400
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    badgePositive: { backgroundColor: '#DEF7EC' },
    badgeTextPositive: { color: '#03543F' },
    badgeNegative: { backgroundColor: '#FDE8E8' },
    badgeTextNegative: { color: '#9B1C1C' },
    badgeNeutral: { backgroundColor: '#F3F4F6' },
    badgeTextNeutral: { color: '#374151' },
});
