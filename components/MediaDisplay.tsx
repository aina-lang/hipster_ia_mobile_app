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
    Pause,
    Box,
    Film,
    Download,
    Maximize2,
    X,
    Music,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { ModalType } from './ui/GenericModal';
import { LinearGradient } from 'expo-linear-gradient';

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
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

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

            let lastUpdate = 0;
            const callback = ({ totalBytesWritten, totalBytesExpectedToWrite }: any) => {
                const progress = totalBytesWritten / totalBytesExpectedToWrite;
                const percentage = Math.round(progress * 100);
                const now = Date.now();

                // Throttle updates to once per second to avoid UI lag
                if (now - lastUpdate > 1000 || percentage === 100) {
                    lastUpdate = now;
                    Notifications.scheduleNotificationAsync({
                        identifier: notificationId!,
                        content: {
                            title: "Téléchargement en cours...",
                            body: `${percentage}% - Téléchargement du fichier ${type}`,
                            sound: false,
                        },
                        trigger: null,
                    });
                }
            };

            const downloadResumable = FileSystem.createDownloadResumable(url, fileUri, {}, callback);
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
                            body: "Le média a été ajouté à votre galerie. Appuyez pour ouvrir.",
                            data: { type, fileUri: result.uri },
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
                if (status.isLoaded) {
                    setPosition(status.positionMillis);
                    setDuration(status.durationMillis || 0);
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        setPosition(0);
                    }
                }
            });
        }
    };

    const ActionButtons = () => (
        <View className="absolute bottom-3 right-3 flex-row gap-2">
            <TouchableOpacity
                onPress={handleDownload}
                disabled={downloading}
                className="rounded-full bg-black/70 p-2.5 backdrop-blur-md shadow-lg"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                }}>
                {downloading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Download size={18} color="#FFF" strokeWidth={2} />
                )}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setIsFullscreen(true)}
                className="rounded-full bg-black/70 p-2.5 backdrop-blur-md shadow-lg"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                }}>
                <Maximize2 size={18} color="#FFF" strokeWidth={2} />
            </TouchableOpacity>
        </View>
    );

    const FullscreenView = () => (
        <Modal visible={isFullscreen} transparent animationType="fade">
            <View className="flex-1 bg-black items-center justify-center">
                <TouchableOpacity
                    className="absolute top-14 right-6 z-50 rounded-full bg-white/10 p-3 backdrop-blur-md"
                    onPress={() => setIsFullscreen(false)}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 10,
                    }}>
                    <X size={24} color="#FFF" strokeWidth={2.5} />
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
                        onPlaybackStatusUpdate={(status) => {
                            if (status.isLoaded) {
                                setPosition(status.positionMillis);
                                setDuration(status.durationMillis || 0);
                            }
                        }}
                    />
                )}

                {type === '3d' && (
                    <View className="w-full h-full items-center justify-center">
                        <Box size={140} color={colors.primary.main} opacity={0.4} strokeWidth={2} />
                        <Text className="text-white/70 mt-6 text-base font-medium">
                            Visualiseur 3D plein écran
                        </Text>
                    </View>
                )}
            </View>
        </Modal>
    );

    if (type === 'image') {
        return (
            <View className="overflow-hidden rounded-2xl mt-2 mb-1 relative shadow-xl">
                <Image
                    source={{ uri: url }}
                    style={{
                        width: 280,
                        height: 280,
                        borderRadius: 16
                    }}
                    resizeMode="cover"
                />
                {/* Gradient overlay pour meilleure visibilité des boutons */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 96,
                    }}
                />
                <ActionButtons />
                <FullscreenView />
            </View>
        );
    }

    if (type === 'video') {
        return (
            <View className="mt-2 mb-1 w-72 overflow-hidden rounded-2xl border border-white/15 relative shadow-2xl">
                <LinearGradient
                    colors={['#0f172a', '#1e293b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setIsFullscreen(true)}
                    className="h-48 w-full items-center justify-center relative">
                    {/* Background pattern */}
                    <View className="absolute inset-0 opacity-10">
                        <View className="flex-row flex-wrap">
                            {[...Array(20)].map((_, i) => (
                                <Film key={i} size={24} color={colors.primary.main} opacity={0.3} />
                            ))}
                        </View>
                    </View>

                    {/* Play button */}
                    <View className="items-center justify-center">
                        <View
                            className="rounded-full bg-white/10 p-5 backdrop-blur-lg shadow-2xl"
                            style={{
                                shadowColor: colors.primary.main,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.5,
                                shadowRadius: 20,
                                elevation: 10,
                            }}>
                            <Play size={32} color="#FFF" fill="#FFF" strokeWidth={0} />
                        </View>
                        <Text className="text-white/80 mt-4 text-sm font-medium">
                            {isPlaying && type === 'video' ? formatTime(position) : 'Appuyez pour lire'}
                        </Text>
                    </View>

                    {/* Progress bar overlay for video */}
                    {type === 'video' && duration > 0 && (
                        <View className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                            <View
                                className="h-full bg-primary"
                                style={{
                                    width: `${(position / duration) * 100}%`,
                                    backgroundColor: colors.primary.main
                                }}
                            />
                        </View>
                    )}
                </TouchableOpacity>

                <ActionButtons />
                <FullscreenView />
            </View>
        );
    }

    if (type === 'audio') {
        return (
            <View className="mt-2 mb-1 w-72 rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
                <LinearGradient
                    colors={['#0f172a', '#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                {/* Header avec icône audio */}
                <View className="px-4 pt-4 pb-3 border-b border-white/10">
                    <View className="flex-row items-center gap-3">
                        <View className="rounded-full bg-primary/20 p-2.5">
                            <Music size={20} color={colors.primary.main} strokeWidth={2} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-semibold text-base">Fichier Audio</Text>
                            <Text className="text-white/50 text-xs mt-0.5">Hipster IA</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleDownload}
                            disabled={downloading}
                            className="p-2">
                            {downloading ? (
                                <ActivityIndicator size="small" color={colors.primary.main} />
                            ) : (
                                <Download size={18} color={colors.text.muted} strokeWidth={2} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contrôles de lecture */}
                <View className="px-4 py-5">
                    <View className="flex-row items-center gap-4">
                        <TouchableOpacity
                            onPress={togglePlayback}
                            className="h-12 w-12 items-center justify-center rounded-full shadow-lg"
                            style={{
                                backgroundColor: colors.primary.main,
                                shadowColor: colors.primary.main,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.4,
                                shadowRadius: 8,
                                elevation: 8,
                            }}>
                            {isPlaying ? (
                                <Pause size={20} color="#FFF" fill="#FFF" strokeWidth={0} />
                            ) : (
                                <Play size={20} color="#FFF" fill="#FFF" strokeWidth={0} />
                            )}
                        </TouchableOpacity>

                        <View className="flex-1 gap-2">
                            {/* Barre de progression */}
                            <View className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: duration > 0 ? `${(position / duration) * 100}%` : '0%',
                                        backgroundColor: colors.primary.main,
                                        shadowColor: colors.primary.main,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.6,
                                        shadowRadius: 4,
                                    }}
                                />
                            </View>

                            {/* Temps */}
                            <View className="flex-row justify-between px-1">
                                <Text className="text-xs text-white/70 font-medium">
                                    {formatTime(position)}
                                </Text>
                                <Text className="text-xs text-white/50">
                                    {duration > 0 ? `-${formatTime(duration - position)}` : '0:00'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    if (type === '3d') {
        return (
            <View className="mt-2 mb-1 w-72 overflow-hidden rounded-2xl border border-white/15 relative shadow-2xl">
                <LinearGradient
                    colors={['#0f172a', '#1e293b', '#312e81']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <View className="h-56 w-full items-center justify-center relative">
                    {/* Badge 3D */}
                    <View
                        className="absolute z-10 top-4 left-4 rounded-full px-4 py-2 shadow-lg"
                        style={{
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            borderWidth: 1,
                            borderColor: 'rgba(99, 102, 241, 0.3)',
                        }}>
                        <Text className="text-xs font-bold text-indigo-300 tracking-wider">
                            3D VIEW
                        </Text>
                    </View>

                    {/* Grille de fond */}
                    <View className="absolute inset-0 opacity-5">
                        <View className="flex-1 flex-row flex-wrap">
                            {[...Array(50)].map((_, i) => (
                                <View
                                    key={i}
                                    className="w-8 h-8 border-r border-b border-white/20"
                                />
                            ))}
                        </View>
                    </View>

                    {/* Icône 3D */}
                    <View className="items-center">
                        <Box
                            size={64}
                            color={colors.primary.light}
                            strokeWidth={2}
                        />
                        <Text className="text-white/60 mt-4 text-sm font-medium">
                            Modèle 3D interactif
                        </Text>
                    </View>
                </View>

                <ActionButtons />
                <FullscreenView />
            </View>
        );
    }

    return null;
};