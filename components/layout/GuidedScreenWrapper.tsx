import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    TouchableOpacity,
    Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { StepIndicator } from '../ui/StepIndicator';
import { BackgroundGradientOnboarding } from '../ui/BackgroundGradientOnboarding';

interface GuidedScreenWrapperProps {
    children: React.ReactNode;
    footer?: React.ReactNode;
    scrollViewRef?: React.Ref<ScrollView>;
    onBack?: () => void;
    showBack?: boolean;
    currentStep?: number;
    totalSteps?: number;
}

export const GuidedScreenWrapper: React.FC<GuidedScreenWrapperProps> = ({
    children,
    footer,
    scrollViewRef,
    onBack,
    showBack = true,
    currentStep,
    totalSteps = 4,
}) => {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <BackgroundGradientOnboarding darkOverlay={true} blurIntensity={90} imageSource="splash">
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        {showBack && (
                            <TouchableOpacity
                                onPress={handleBack}
                                style={styles.backButton}
                                activeOpacity={0.7}
                            >
                                <ArrowLeft size={22} color={colors.text.primary} />
                            </TouchableOpacity>
                        )}

                        <View style={styles.headerContent}>
                            {currentStep !== undefined && (
                                <View style={styles.stepIndicatorContainer}>
                                    <StepIndicator
                                        currentStep={currentStep}
                                        totalSteps={totalSteps}
                                    />
                                </View>
                            )}
                        </View>
                    </View>

                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {children}
                    </ScrollView>
                    {footer && <View style={styles.footerContainer}>{footer}</View>}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </BackgroundGradientOnboarding>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 60,
        paddingBottom: 20,
        marginBottom: 40,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: Platform.OS === 'ios' ? 68 : 58,
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        zIndex: 10,
    },
    headerContent: {
        alignItems: 'center',
        width: '100%',
    },
    stepIndicatorContainer: {
        marginBottom: 10,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    footerContainer: {
    
        backgroundColor: '#000000',
    },
});
