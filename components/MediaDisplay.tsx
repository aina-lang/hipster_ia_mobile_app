import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Modal,
    Platform,
} from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import {
    Play,
    Box,
    Film,
    Download,
    Maximize2,
    Plus,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { ModalType } from './ui/GenericModal';

interface MediaDisplayProps {
    type: string;
    url: string;
    showModal: (type: ModalType, title: string, message: string) => void;
}

export const MediaDisplay = ({ type, url, showModal }: MediaDisplayProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const handleDownload = async () => {
        let notificationId: string | null = null;
        try {
            setDownloading(true);

            // Request permissions
            const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
            const { status: notifStatus } = await Notifications.requestPermissionsAsync();

            if (mediaStatus !== 'granted') {
                showModal('warning', 'Permission requise', "Veuillez autoriser l'accès à la galerie.");
                return;
            }

            // Start notification
            notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Téléchargement en cours...",
                    body: `Préparation du fichier ${type}`,
                    sound: false,
                },
                trigger: null,
            });

            const urlWithoutQuery = url.split('?')[0];
            const filename = urlWithoutQuery.split('/').pop() || 'download';
            const docDir = FileSystem.documentDirectory;
            if (!docDir) throw new Error('Document directory not available');
            const fileUri = docDir.endsWith('/') ? `${docDir}${filename}` : `${docDir}/${filename}`;
            const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
            const result = await downloadResumable.downloadAsync();

            if (result) {
                if (Platform.OS === 'ios') {
                    await Sharing.shareAsync(result.uri);
                    await Notifications.dismissNotificationAsync(notificationId);
                } else {
                    const asset = await MediaLibrary.createAssetAsync(result.uri);
                    try {
                        await MediaLibrary.createAlbumAsync('Hipster IA', asset, false);
                    } catch (albumError) {
                        console.warn('Could not create album, asset saved to default gallery:', albumError);
                    }

                    // Finish notification
                    await Notifications.dismissNotificationAsync(notificationId);
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Téléchargement terminé !",
                            body: "Le média a été ajouté à votre galerie.",
                            data: { type },
                        },
                        trigger: null,
                    });
                }
            }
        } catch (e) {
            console.error(e);
            if (notificationId) await Notifications.dismissNotificationAsync(notificationId);
            showModal('error', 'Erreur', 'L\'opération a échoué.');
        } finally {
            setDownloading(false);
        }
    };

    const togglePlayback = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
        } else {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlaying(false);
                }
            });
        }
    };

    const ActionButtons = () => (
        <View className="absolute bottom-2 right-2 flex-row gap-2">
            <TouchableOpacity
                onPress={handleDownload}
                disabled={downloading}
                className="rounded-full bg-black/60 p-2 backdrop-blur-sm">
                {downloading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Download size={16} color="#FFF" />
                )}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setIsFullscreen(true)}
                className="rounded-full bg-black/60 p-2 backdrop-blur-sm">
                <Maximize2 size={16} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const FullscreenView = () => (
        <Modal visible={isFullscreen} transparent animationType="fade">
            <View className="flex-1 bg-black items-center justify-center">
                <TouchableOpacity
                    className="absolute top-12 right-6 z-50 rounded-full bg-white/10 p-3"
                    onPress={() => setIsFullscreen(false)}>
                    <Plus size={24} color="#FFF" style={{ transform: [{ rotate: '45deg' }] }} />
                </TouchableOpacity>

                {type === 'image' && (
                    <Image source={{ uri: url }} className="w-full h-full" resizeMode="contain" />
                )}

                {type === 'video' && (
                    <Video
                        source={{ uri: url }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={isFullscreen}
                        useNativeControls
                        style={{ width: '100%', height: '100%' }}
                    />
                )}

                {type === '3d' && (
                    <View className="w-full h-full items-center justify-center">
                        <Box size={120} color={colors.primary.main} opacity={0.3} />
                        <Text className="text-white/60 mt-4">Visualiseur 3D plein écran (Mock)</Text>
                    </View>
                )}
            </View>
        </Modal>
    );

    if (type === 'image') {
        return (
            <View className="overflow-hidden rounded-lg mt-2 mb-1 relative">
                <Image source={{ uri: url }} style={{ width: 250, height: 250, borderRadius: 8 }} resizeMode="cover" />
                <ActionButtons />
                <FullscreenView />
            </View>
        );
    }
    if (type === 'video') {
        return (
            <View className="mt-2 mb-1 w-64 overflow-hidden rounded-xl border border-white/10 bg-black/40 relative">
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setIsFullscreen(true)}
                    className="h-40 w-full items-center justify-center bg-white/5">
                    <Film size={32} color={colors.primary.main} opacity={0.8} />
                    <View className="absolute inset-0 items-center justify-center">
                        <View className="rounded-full bg-black/40 p-3 backdrop-blur-sm">
                            <Play size={24} color="#FFF" fill="#FFF" />
                        </View>
                    </View>
                </TouchableOpacity>

                <ActionButtons />
                <FullscreenView />
            </View>
        );
    }
    if (type === 'audio') {
        return (
            <View className="mt-2 mb-1 w-64 flex-row items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 relative">
                <TouchableOpacity
                    onPress={togglePlayback}
                    className="h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Play
                        size={18}
                        color={colors.primary.main}
                        fill={isPlaying ? colors.primary.main : 'transparent'}
                        style={isPlaying ? { transform: [{ scale: 0.9 }] } : {}}
                    />
                </TouchableOpacity>
                <View className="flex-1 gap-1 mr-8">
                    <View className="h-1 w-full rounded-full bg-white/10">
                        <View className="h-full w-1/3 rounded-full bg-primary" />
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-[10px] text-white/60">{isPlaying ? 'Playing...' : '0:12'}</Text>
                        <Text className="text-[10px] text-white/60">-1:48</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleDownload}
                    disabled={downloading}
                    className="absolute right-3 top-3">
                    {downloading ? (
                        <ActivityIndicator size="small" color={colors.primary.main} />
                    ) : (
                        <Download size={16} color={colors.text.muted} />
                    )}
                </TouchableOpacity>
            </View>
        );
    }
    if (type === '3d') {
        return (
            <View className="mt-2 mb-1 w-64 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 relative">
                <View className="h-48 w-full items-center justify-center">
                    <View className="absolute z-10 top-3 left-3 rounded-full bg-black/50 px-3 py-1">
                        <Text className="text-xs font-bold text-white">3D VIEW</Text>
                    </View>
                    <Box size={48} color={colors.primary.light} strokeWidth={1} />
                </View>

                <ActionButtons />
                <FullscreenView />
            </View>
        );
    }
    return null;
};
