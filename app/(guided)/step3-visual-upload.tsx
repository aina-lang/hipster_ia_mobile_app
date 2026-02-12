import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { useCreationStore } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonButton } from '../../components/ui/NeonButton';
import { Upload, X, Sparkles } from 'lucide-react-native';

export default function Step3VisualUploadScreen() {
    const router = useRouter();
    const { uploadedImage, setUploadedImage } = useCreationStore();
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission requise',
                    'Nous avons besoin de votre permission pour accéder à vos photos.'
                );
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setUploadedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
    };

    const handleGenerate = () => {
        if (!uploadedImage) {
            Alert.alert('Image requise', 'Veuillez sélectionner une image avant de continuer.');
            return;
        }
        router.push('/(guided)/step3-result');
    };

    return (
        <GuidedScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Upload image ou produit</Text>
                    <Text style={styles.subtitle}>Ajoutez une image pour personnaliser votre création</Text>
                </View>

                {/* Upload Area */}
                <View style={styles.uploadSection}>
                    {uploadedImage ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: uploadedImage }} style={styles.imagePreview} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => setUploadedImage(null)}
                                activeOpacity={0.8}
                            >
                                <X size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={pickImage}
                            activeOpacity={0.8}
                        >
                            <Upload size={48} color={colors.primary.main} />
                            <Text style={styles.uploadText}>Sélectionner une image</Text>
                            <Text style={styles.uploadHint}>JPG, PNG jusqu'à 10MB</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Change Image Button */}
                {uploadedImage && (
                    <TouchableOpacity
                        style={styles.changeButton}
                        onPress={pickImage}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.changeButtonText}>Changer l'image</Text>
                    </TouchableOpacity>
                )}

                {/* Generate Button */}
                <View style={styles.footer}>
                    <NeonButton
                        onPress={handleGenerate}
                        title="Générer avec Hipster•IA"
                        variant="premium"
                        size="lg"
                        icon={<Sparkles size={18} color={colors.text.primary} />}
                        disabled={!uploadedImage}
                    />
                </View>
            </View>
        </GuidedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 32,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    uploadSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadButton: {
        width: '100%',
        aspectRatio: 1,
        maxHeight: 400,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.primary.main,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    uploadText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 8,
    },
    uploadHint: {
        fontSize: 14,
        color: colors.text.muted,
    },
    imagePreviewContainer: {
        width: '100%',
        aspectRatio: 1,
        maxHeight: 400,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeButton: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    changeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary.main,
    },
    footer: {
        marginTop: 24,
    },
});
