import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StepIndicator } from '../ui/StepIndicator';
import { BackgroundGradientOnboarding } from '../ui/BackgroundGradientOnboarding';
import { NeonBackButton } from '../../components/ui/NeonBackButton';

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
        <BackgroundGradientOnboarding darkOverlay>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.header}>
                            {showBack && (
                                <View style={styles.backButtonContainer}>
                                    <NeonBackButton onPress={handleBack} />
                                </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 40 : 50,
        position: 'relative',
        marginBottom : 30
    },
    backButtonContainer: {
        position: 'absolute',
        left: 16,
        top: Platform.OS === 'ios' ? 40 : 50,
        zIndex: 10,
    },
    headerContent: {
        alignItems: 'center',
        width: '100%',
    },
    stepIndicatorContainer: {
        marginBottom: 10,
    },
    footerContainer: {
        backgroundColor: '#000000',
    },
});
