import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Image as ImageIcon, Send, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { TypingPlaceholder } from './TypingMessage';

interface ChatInputProps {
    inputValue: string;
    onChangeText: (text: string) => void;
    selectedImage: string | null;
    onImageSelect: () => void;
    onImageRemove: () => void;
    onSend: () => void;
    isGenerating: boolean;
    isDisabled?: boolean;
    placeholderText?: string;
    maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputValue,
    onChangeText,
    selectedImage,
    onImageSelect,
    onImageRemove,
    onSend,
    isGenerating,
    isDisabled = false,
    placeholderText = 'Décrivez votre idée, ajoutez une image ou un audio...',
    maxLength = 500,
}) => {
    const isSendDisabled = (!inputValue.trim() && !selectedImage) || isGenerating || isDisabled;

    return (
        <View
            className="relative rounded-2xl border border-white/10 bg-slate-900 p-4"
            style={{ opacity: isDisabled ? 0.6 : 1 }}
        >
            <TypingPlaceholder text={placeholderText} inputValue={inputValue} />
            <TextInput
                value={inputValue}
                onChangeText={onChangeText}
                multiline
                maxLength={maxLength}
                placeholderTextColor="transparent"
                className="mb-3 max-h-[100px] min-h-[24px] text-base text-white"
                editable={!isDisabled}
            />

            {selectedImage && (
                <View className="mb-4 relative w-20 h-20">
                    <Image source={{ uri: selectedImage }} className="w-full h-full rounded-xl" />
                    <TouchableOpacity
                        onPress={onImageRemove}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 shadow-lg"
                    >
                        <X size={14} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            <View className="flex-row items-center justify-between">
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="rounded-lg bg-white/5 p-2"
                        onPress={onImageSelect}
                    >
                        <ImageIcon size={20} color={selectedImage ? colors.primary.main : colors.text.secondary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={onSend}
                    disabled={isSendDisabled}
                    className="rounded-lg p-3 shadow-lg"
                    style={{
                        backgroundColor: colors.primary.main,
                        opacity: isSendDisabled ? 0.4 : 1,
                    }}>
                    {isGenerating ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <Send size={20} color={colors.text.secondary} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
