# ChatInput Component Usage Guide

## Overview

The `ChatInput` component is a reusable chat input interface that includes:

- Multi-line text input with typing placeholder
- Image attachment preview and removal
- Send button with loading state
- Disabled state support

## Import

```typescript
import { ChatInput } from '../components/ChatInput';
```

## Props

| Prop              | Type                     | Required | Default                    | Description                          |
| ----------------- | ------------------------ | -------- | -------------------------- | ------------------------------------ |
| `inputValue`      | `string`                 | Yes      | -                          | Current input text value             |
| `onChangeText`    | `(text: string) => void` | Yes      | -                          | Callback when text changes           |
| `selectedImage`   | `string \| null`         | Yes      | -                          | URI of selected image or null        |
| `onImageSelect`   | `() => void`             | Yes      | -                          | Callback to trigger image picker     |
| `onImageRemove`   | `() => void`             | Yes      | -                          | Callback to remove selected image    |
| `onSend`          | `() => void`             | Yes      | -                          | Callback when send button is pressed |
| `isGenerating`    | `boolean`                | Yes      | -                          | Whether content is being generated   |
| `isDisabled`      | `boolean`                | No       | `false`                    | Whether input is disabled            |
| `placeholderText` | `string`                 | No       | `'Décrivez votre idée...'` | Placeholder text                     |
| `maxLength`       | `number`                 | No       | `500`                      | Maximum input length                 |

## Basic Usage Example

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ChatInput } from '../components/ChatInput';

export default function MyScreen() {
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    setIsGenerating(true);
    try {
      // Your send logic here
      console.log('Sending:', inputValue, selectedImage);
    } finally {
      setIsGenerating(false);
      setInputValue('');
      setSelectedImage(null);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ChatInput
        inputValue={inputValue}
        onChangeText={setInputValue}
        selectedImage={selectedImage}
        onImageSelect={pickImage}
        onImageRemove={() => setSelectedImage(null)}
        onSend={handleSend}
        isGenerating={isGenerating}
        isDisabled={false}
        placeholderText="Tapez votre message..."
        maxLength={500}
      />
    </View>
  );
}
```

## Advanced Usage with Disabled State

```typescript
const isInputDisabled = isGenerating || hasReachedLimit;

<ChatInput
  inputValue={inputValue}
  onChangeText={setInputValue}
  selectedImage={selectedImage}
  onImageSelect={pickImage}
  onImageRemove={() => setSelectedImage(null)}
  onSend={handleSend}
  isGenerating={isGenerating}
  isDisabled={isInputDisabled}
  placeholderText="Décrivez votre idée..."
  maxLength={1000}
/>
```

## Screens Using This Component

- `app/(drawer)/index.tsx` - Main chat screen
- Add other screens here as you integrate the component

## Dependencies

This component requires:

- `TypingPlaceholder` component from `./TypingPlaceholder`
- `colors` from `../theme/colors`
- `lucide-react-native` icons
