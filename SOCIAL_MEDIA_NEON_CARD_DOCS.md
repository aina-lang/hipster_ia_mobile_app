# 🎨 Social Media Neon Card - Effet Neon Animé

## Fonctionnalités

Ce composant `SocialMediaNeonCard` ajoute un **effet de bordure neon animée** sur vos cartes de réseaux sociaux quand l'utilisateur appuie dessus.

### ✨ Caractéristiques

```
┌─────────────────────────────┐
│                             │
│  🎬 LinearGradient animé   │  ← Traverse de gauche à droite (2400ms)
│  ↔️ défilement infini       │
│                             │
│   💎 Glow multi-couches     │
│     • bloomMid (shadowRadius: 12)
│     • bloomFar (shadowRadius: 24)
│     • floorGlow (ombre au sol)
│                             │
│  🪀 Spring Animation        │
│     • Scale: 0.95 on press
│     • Smooth rebound on release
│                             │
└─────────────────────────────┘
```

## Installation

Le composant est déjà créé dans:
```
components/ui/SocialMediaNeonCard.tsx
```

## Utilisation

### Importation
```typescript
import { SocialMediaNeonCard } from '../../components/ui/SocialMediaNeonCard';
```

### Exemple basique
```typescript
<SocialMediaNeonCard
  onPress={() => setSelectedStyle('Premium')}
  isActive={selectedStyle === 'Premium'}
  cardWidth={160}
>
  <View style={styles.styleCard}>
    <Image source={itemImage} style={styles.cardImage} />
    <View style={styles.footer}>
      <Text style={styles.label}>Premium</Text>
      <Text style={styles.description}>Noir & blanc luxe</Text>
    </View>
  </View>
</SocialMediaNeonCard>
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `React.ReactNode` | - | Contenu de la carte |
| `onPress` | `() => void` | - | Callback au press |
| `isActive` | `boolean` | `false` | Active l'animation neon |
| `cardBg` | `string` | `'#030814'` | Couleur de fond interne |
| `cardWidth` | `number` | `160` | Largeur de la carte (pour durée animation) |

## Comportement

### État Normal (pas sélectionné)
- Pas de bordure neon
- Pas de glow
- Prêt à être saisi

### État Active (sélectionné)
- ✨ Gradient neon qui traverse la bordure continuellement
- 💫 Glow multi-couches autour
- 📳 Spring animation au press

### Animation Neon
- **Durée**: 2400ms par cycle
- **Easing**: Linear (défilement régulier)
- **Couleurs**: 
  - `#00eaff` (Neon Blue)
  - `#1e9bff` (Neon Blue Dark)

### Spring Animation au Press
- **Scale**: 1 → 0.95 → 1
- **Damping**: 15 (smooth)
- **Timing**: ~150ms

## Exemple Complet d'Implémentation

```typescript
// Step3-Personalize - Cartes de style social media
{selectedCategory === 'Social' ? (
  <View style={s.section}>
    <Text style={s.sectionLabel}>DIRECTION ARTISTIQUE</Text>
    <Text style={s.sectionSub}>Sélectionnez l'ambiance de votre contenu</Text>
    
    <View style={s.stylesGrid}>
      {VISUAL_STYLES.map((item) => {
        const isSelected = selectedStyle === item.label;
        
        return (
          <SocialMediaNeonCard
            key={item.label}
            onPress={() => setStyle(item.label as any)}
            isActive={isSelected}
            cardWidth={160}
          >
            <View style={[s.styleCard, isSelected && s.styleCardSelected]}>
              <Image source={item.image} style={s.styleCardImage} />
              <View style={[s.styleCardFooter, isSelected && s.styleCardFooterSelected]}>
                <Text style={s.styleCardLabel}>{item.label}</Text>
                <Text style={s.styleCardDesc}>{item.description}</Text>
              </View>
            </View>
          </SocialMediaNeonCard>
        );
      })}
    </View>
  </View>
) : null}
```

## Où l'effet est appliqué

### ✅ Déjà implémenté dans:
- **step3-personalize.tsx** - Cartes de direction artistique pour réseaux sociaux
  - Sélection de style (Premium, Hero, Minimal, etc.)
  - Affichage en grille

### 💡 Peut être appliqué sur:
- Cartes de sélection de plateforme (Instagram, TikTok, LinkedIn)
- Cartes de type de contenu
- Cartes de modèles/templates
- Tout composant de sélection

## Personnalisation

### Modifier la couleur du glow
Modifiez dans le fichier `SocialMediaNeonCard.tsx`:
```typescript
const NEON_BLUE = '#FF0080'; // Changer la couleur neon
const NEON_BLUE_DARK = '#FF6600'; // Changer la couleur secondaire
```

### Modifier la durée de l'animation
```typescript
duration: 2400, // En ms - augmenter = plus lent
```

### Modifier l'intensité du glow
```typescript
bloomMid: {
  shadowOpacity: 0.45, // Réduire pour moins de glow
  shadowRadius: 12,    // Réduire pour ombre plus serrée
}
```

## Dépendances requises

```typescript
// dans package.json
{
  "react-native": "...",
  "react-native-reanimated": "...",
  "expo-linear-gradient": "..."
}
```

## Performance

- **GPU accelerated**: Utilise `useNativeDriver: true`
- **Optimisé**: Animation ne tourne que quand `isActive`
- **Pas de re-renders inutiles**: Gestion d'état avec `useState` et `useRef`

## Notes Techniques

1. Le composant est un `Animated.View` wrappé avec `createAnimatedComponent(TouchableOpacity)`
2. L'animation neon utilise `Animated.loop()` avec `Animated.timing()`
3. Le spring animation pour le press utilise React Native Reanimated `withSpring()`
4. Les shadow layers créent l'effet de glow multi-profondeur

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2026-04-07
