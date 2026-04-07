# 🎯 Time-Based Dynamic Pop-ups System

## Overview

A complete system that displays fun, contextual welcome messages to users based on what time they log in to the app. Messages are time-slot specific (7 slots, 8h-24h) with 10 unique variants per slot to avoid repetition.

## Architecture

### 📁 File Structure

```
hipster_ia_mobile_app/
├── constants/
│   └── timeBasedMessages.ts        # Message data, time slots, helpers
├── hooks/
│   └── useTimeBasedMessage.ts       # Message selection & persistence logic
├── store/
│   └── timeDynamicMessagesStore.ts  # Zustand store for state tracking
├── components/
│   └── TimeDynamicMessageModal.tsx  # Modal display component
└── app/
    └── _layout.tsx                  # Integration point (root layout)
```

### 🔄 Data Flow

```
User Logs In
    ↓
Auth Success (aiLogin)
    ↓
App Initializes Root Layout (_layout.tsx)
    ↓
TimeDynamicMessageModal Component Renders
    ↓
Checks: Is user authenticated? Should show? (24h frequency check)
    ↓
useTimeBasedMessage Hook:
  1. Get current hour
  2. Determine time slot
  3. Select random message from slot
  4. Check it's not same as last shown
  5. Save state to AsyncStorage
    ↓
GenericModal Displays Message (type='notification')
    ↓
Auto-closes after 4 seconds
```

## System Components

### 1️⃣ **constants/timeBasedMessages.ts** - Message Repository

Defines all 70 messages organized by 7 time slots.

**Time Slots** (2-hour windows):
```typescript
type TimeSlot = 
  | 'morning'      // 8h-10h (2 messages)
  | 'preNoon'      // 10h30-12h (10 messages)
  | 'postLunch'    // 12h30-15h (10 messages)
  | 'afternoon'    // 15h-18h (10 messages)
  | 'evening'      // 18h-20h (10 messages)
  | 'night'        // 20h-22h (10 messages)
  | 'lateNight'    // 22h-24h (10 messages)
```

**Key Functions**:
- `getCurrentTimeSlot(hour: number): TimeSlot` - Detect current slot from hour
- `getTimeSlotConfig(slot: TimeSlot): TimeSlotConfig` - Get messages for a slot

**Example Messages**:
```typescript
morning: [
  "Bon… café d'abord ou grosse idée direct ? ☕",
  "T'as déjà bossé ou on attend le café ? 😴",
  // ... 8 more variants
]

preNoon: [
  "Juste avant midi, c'est souvent là qu'on a les meilleures idées.",
  "C'est moi ou y'a un vrai truc cool qui se prépare là ? 👀",
  // ... 8 more variants
]

// 70 messages total across all slots
```

### 2️⃣ **hooks/useTimeBasedMessage.ts** - Selection & Persistence

Implements message selection logic with smart repetition avoidance.

**Features**:
- Loads last shown message from AsyncStorage
- Excludes last message from selection (same slot)
- Never shows same message twice in 24h
- Respects 24-hour frequency limit globally
- Fully typed with TypeScript

**Main Function**:
```typescript
const {
  message,           // Selected message text
  timeSlot,          // Current time slot
  isLoading,         // Loading state
  lastShownTime,     // Timestamp of last display
  initializeMessage, // Async function to select & save
  reset              // Clear state
} = useTimeBasedMessage();
```

### 3️⃣ **store/timeDynamicMessagesStore.ts** - State Management

Zustand store for tracking message display state.

**State**:
```typescript
{
  lastMessageShown: string | null,      // Text of last message
  lastMessageTime: number | null,       // Timestamp of last display
  currentSlot: TimeSlot | null,         // Current time slot
  shouldShowModal: boolean              // Modal visibility flag
}
```

**Actions**:
- `markMessageAsShown()` - Record that message was shown
- `resetLastMessage()` - Clear message tracking
- `setShouldShowModal()` - Control modal visibility
- `canShowNewMessage()` - Check 24h frequency limit

### 4️⃣ **components/TimeDynamicMessageModal.tsx** - Display Component

React component that manages modal display lifecycle.

**Features**:
- Observes authentication state
- Triggers message selection on successful login
- Displays GenericModal with notification type
- Auto-closes after 4 seconds
- Handles errors gracefully

**Usage**:
```tsx
<TimeDynamicMessageModal />
```

### 5️⃣ **app/_layout.tsx** - Integration Point

Root layout component where system is activated.

**Integration**:
```tsx
import { TimeDynamicMessageModal } from '../components/TimeDynamicMessageModal';

export default function RootLayout() {
  // ... existing code ...
  
  return (
    <SafeAreaProvider>
      {/* ... other providers ... */}
      
      {/* 🎯 Time-based dynamic pop-up messages */}
      <TimeDynamicMessageModal />
      
      {/* ... rest of layout ... */}
    </SafeAreaProvider>
  );
}
```

## How It Works

### 📌 Initialization Flow

1. **User logs in** → `aiLogin()` in authStore succeeds
2. **App renders root layout** → `_layout.tsx`
3. **TimeDynamicMessageModal mounts** → Detects `isAuthenticated: true`
4. **Calls `initializeMessage()`** hook with 800ms delay
5. **Hook checks frequency** → Is it been 24h since last message?
6. **Hook selects message** → 
   - Get current hour → Determine time slot
   - Get 10 messages for slot
   - Remove last shown message (if same slot)
   - Pick random from remainder
   - Save to AsyncStorage
7. **Modal becomes visible** → GenericModal with notification type
8. **Auto-closes** → After 4 seconds

### 🚫 Frequency Control

**24-Hour Limit Per User**:
- Message timestamp stored in AsyncStorage
- On next login, checks: `Date.now() - lastTimestamp >= 24h`
- If limit not met: Modal never triggers (no noise)
- If limit met: Normal message selection

**Same-Message Avoidance**:
- Within same time slot: excludes last message from random selection
- Different time slot: free to show any message (times change, context is different)

### 🔐 Storage

Messages saved to AsyncStorage with key `hipster_last_message_state`:

```json
{
  "message": "Bon… café d'abord ou grosse idée direct ? ☕",
  "timeSlot": "morning",
  "lastMessageIndex": 0,
  "timestamp": 1704067200000
}
```

### 🎨 Display

Uses existing `GenericModal` component:
- **Type**: `'notification'` (bell icon, info blue color)
- **Title**: "✨ Bienvenue"
- **Message**: Selected dynamic message
- **Duration**: 4000ms (4 seconds) before auto-close
- **Animation**: Inherits GenericModal's ZoomIn/FadeOut animations

## User Experience

### Timeline

```
00:00 - User logs in at 10:15 AM
        Message selected from "preNoon" slot
        Shows: "Juste avant midi, c'est souvent là qu'on a les meilleures idées."
        Modal visible for 4 seconds
        
        ↓ (scrolls down or waits)
        
00:04 - Modal auto-closes
        User continues with app

═════════════════════════════════════════════════════════

24:00+ - User logs in again (next day or 24+ hours later)
        New message selection happens
        Fresh message from time-appropriate slot
        Cycle repeats
        
Less than 24h:
        Modal never shows (frequency blocked)
        User gets smooth experience without pop-up spam
```

## Message Tone Guidelines

All 70 messages follow these principles:

✅ **DO**:
- Light, playful, human tone
- Context-aware (mentions time of day)
- Encouraging and positive
- Relatable to creator/business workflow
- Use emojis naturally (not excessively)
- Address user's situation at that hour

❌ **DON'T**:
- Heavy or serious
- Generic motivational clichés
- Weird variations or unusual language
- Spam-like repetition
- Marketing speak
- Pressure to do something

**Approved Messages Examples**:
- Morning (8-10h): "Bon… café d'abord ou grosse idée direct ? ☕"
- Pre-noon (10h30-12h): "Juste avant midi, c'est souvent là qu'on a les meilleures idées."
- Post-lunch (12h30-15h): "Bon… soyons honnêtes, là ton corps veut une sieste 😴"
- Afternoon (15h-18h): "Ok, là on peut encore sauver la journée avec un truc bien 🔥"
- Evening (18h-20h): "Alors… on clôture la journée en beauté ou on fait semblant d'avoir déjà fini ?"
- Night (20h-22h): "T'es encore en train de bosser là ? Franchement, respect 😄"
- Late Night (22h-24h): "Ok… là on est sur un niveau d'implication assez sérieux 😅"

## Testing

### Manual Testing

1. **Test frequency limit**:
   - Log in → See message
   - Log out → Log back in immediately
   - Modal should NOT show (< 24h)

2. **Test different time slots**:
   - Manually change device time
   - Log in at different hours
   - Verify correct slot messages appear

3. **Test message variety**:
   - Log in multiple times within same hour
   - See different random messages
   - Confirm same message never appears twice in row (same slot)

4. **Test modal behavior**:
   - Message appears with animation
   - Auto-closes after 4 seconds
   - Can manually tap to close early

### Debug Logging

Check console for:
```
[useTimeBasedMessage] Message generated: "..." (morning)
[TimeDynamicMessageModal] Failed to load message: ...
[useTimeBasedMessage] Frequency limit - not showing message
```

## API & Integration Points

### useTimeBasedMessage() Hook

```typescript
interface UseTimeBasedMessageReturn {
  message: string | null;                      // Current selected message
  timeSlot: TimeSlot | null;                   // Current time slot
  isLoading: boolean;                          // Async operation in progress
  lastShownTime: number | null;                // Timestamp of display
  initializeMessage: () => Promise<MessageResult | null>;
  reset: () => void;
}
```

### useTimeDynamicMessagesStore() Store

```typescript
interface TimeDynamicMessagesStore {
  lastMessageShown: string | null;
  lastMessageTime: number | null;
  currentSlot: TimeSlot | null;
  shouldShowModal: boolean;
  
  markMessageAsShown(message: string, slot: TimeSlot): void;
  resetLastMessage(): void;
  setShouldShowModal(show: boolean): void;
  canShowNewMessage(): boolean;
  getTimeSinceLastMessage(): number | null;
}
```

### GenericModal Integration

```tsx
<GenericModal
  visible={visible}
  type="notification"          // Required: notification type
  title="✨ Bienvenue"         // Can customize
  message={messageText}        // Dynamic message
  onClose={handleClose}        // Required: closes modal
  autoClose={true}             // Auto-close enabled
  duration={4000}              // 4 seconds auto-close
/>
```

## Future Enhancements

### 📈 Possible Extensions

1. **User Segmentation**:
   ```typescript
   - Different messages based on user type (AI vs Standard)
   - Different messages based on profession/industry
   - VIP/Ambassador special messages
   ```

2. **Frequency Variants**:
   ```typescript
   - Max 1 per 4 hours (more aggressive engagement)
   - Different frequency for new vs returning users
   - Weekend vs weekday messages
   ```

3. **Analytics**:
   ```typescript
   - Track which messages get highest engagement
   - A/B test message variants
   - Optimize message selection based on performance
   ```

4. **Advanced Scheduling**:
   ```typescript
   - Special messages for holidays/events
   - Time-specific limited edition messages
   - New message rotation (weekly/monthly)
   ```

5. **Personalization**:
   ```typescript
   - Reference user's name in message
   - Reference their creation type
   - Adapt based on usage patterns
   ```

## Performance Notes

- ✅ Minimal overhead (AsyncStorage writes only on login)
- ✅ Messages bundled in JS (no network calls)
- ✅ Zero impact when frequency limit blocks
- ✅ Fast selection (random from array, O(1))
- ✅ No dependencies on external APIs/analytics

## Troubleshooting

### Modal Never Shows

**Check**:
1. Is user authenticated? (`isAuthenticated === true`)
2. Has 24h passed since last message? (Check AsyncStorage key `hipster_last_message_state`)
3. Are there console errors? (Check DevTools)
4. Is component mounted in layout? (Check _layout.tsx imports)

**Fix**:
```typescript
// Clear AsyncStorage if testing
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('hipster_last_message_state');
```

### Wrong Message for Time

**Check**:
1. Device time is correct
2. Time slot boundaries are accurate

**Time Slots Reference**:
- 8-10 = morning
- 10h30-12 = preNoon
- 12h30-15 = postLunch
- 15-18 = afternoon
- 18-20 = evening
- 20-22 = night
- 22-24 = lateNight

### Same Message Repeating

**Check**:
1. Different time slots? (Different slots can have same message)
2. Same slot within 24h? (Excludes last message)
3. AsyncStorage working? (Check for save errors)

## Code Quality

- ✅ Full TypeScript type coverage
- ✅ Zero compilation errors
- ✅ Clean error handling
- ✅ Proper React hooks usage
- ✅ Memory-safe (proper cleanup)
- ✅ Modular design (easy to test/modify)
- ✅ Well-documented with comments

---

**Created**: Stack building phase for dynamic pop-ups  
**Status**: ✅ Production-ready  
**Testing**: Manual testing recommended before release
