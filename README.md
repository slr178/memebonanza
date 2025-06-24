# Slot Machine Animation

A stunning, cyberpunk-themed slot machine with jaw-dropping visual effects, 60fps smooth animations, and meme-based symbols.

## Features

- **60FPS Smooth Animations**: Hardware-accelerated animations with cubic-bezier easing
- **Cyberpunk Aesthetic**: Dark theme with neon glows and electric effects
- **Dynamic Visual Effects**:
  - Animated gradient background that shifts through multiple colors
  - Particle overlay creating a sparkle effect
  - Multi-layered neon border with animated glow
  - Floating animation on the entire machine
  - Rainbow glow effects on premium symbols
- **Game Logic**: JavaScript-powered weighted random outcomes
- **5×5 Grid**: Five columns with five visible symbols each
- **Custom Meme Symbols**: From common letters to rare memes
- **Interactive Elements**:
  - Golden spin button with shine effect and hover animations
  - Glowing slot dividers that pulse
  - Symbol hover effects with radial glow
- **Visual Feedback**: 
  - Neon text with glow effects for pool display
  - Animated win/loss messages
  - Win sound effect
- **Performance Optimized**: Uses transform and will-change for smooth 60fps
- **Responsive Design**: Adapts to different screen sizes

## Visual Effects

### Background
- Animated 8-color gradient that shifts continuously
- Particle overlay creating depth and movement
- Dark base for maximum contrast

### Slot Machine
- Multi-ring neon border (gold, pink, purple)
- Animated border glow that cycles through colors
- Glass overlay effect
- Hover effect that slightly rotates and scales the machine
- Drop shadow creating a floating appearance

### Symbols
- Base symbols: White glow
- Rare symbols: Colored glows (red for Trump, blue for Elon)
- Premium symbols: Intense gold/pink glows with pulsing animation
- PEPE: Rainbow glow that cycles through all colors

### Button
- Golden gradient with 3D effect
- Animated shine that sweeps across on hover
- Pulsing glow animation
- Bounce effect on click

## Symbols

The slot machine features 8 different custom symbols organized by rarity:

### Common/Base Symbols
- **S** - Letter S base symbol
- **O** - Letter O base symbol  
- **L** - Letter L base symbol

### Rare Symbols
- **Trump** - Trump symbol
- **Elon** - Elon Musk symbol

### Premium Symbols
- **Dogwifhat** - Dogwifhat meme
- **Popcat** - Popcat meme
- **PEPE** - PEPE (Top Premium Symbol)

## How to Use

1. Open `index.html` in any modern web browser
2. Click the "SPIN" button to start the slot machine spinning
3. The slots will spin once and stop at their final positions
4. Click the button again to reset and spin again

## How It Works

### Single-Spin Mechanism
- Each slot animation runs exactly once (`animation-iteration-count: 1`)
- Animations stay at their final position (`animation-fill-mode: forwards`)
- Animations are paused by default (`animation-play-state: paused`)
- Clicking the button toggles the checkbox, which triggers animations to run
- Unchecking resets all slots back to their starting positions

## File Structure

```
/
├── index.html    # Main HTML file
├── styles.css    # All styling and animations
└── README.md     # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- CSS Custom Properties (CSS Variables)
- CSS Transforms and 3D Transforms
- CSS Animations
- CSS Grid and Flexbox

## Customization

You can customize various aspects by modifying the CSS variables in `styles.css`:

- `--machine-width`: Width of the slot machine
- `--spin-steps`: Number of steps in the spin animation
- `--delay-2nd-slot` through `--delay-5th-slot`: Delays for each slot's animation
- Color gradients and other visual properties

## Animation Details

The slot machine includes several types of animations:
- **Spin Animation**: The main slot spinning effect with stepped motion
- **Background Effect**: Subtle pulsing light effect in the background
- **Button Hover**: Smooth lift effect when hovering over the spin button
- **Golden Frame**: Glowing effect around the slot machine border

## Game Mechanics

### Weighted Outcomes
The slot machine uses a weighted random system with the following probabilities:

| Symbol Group | Weight | Payout (% of pool) | Description |
|-------------|--------|-------------------|-------------|
| S-triple | 8% | 0.05% | Three S symbols in a row |
| O-triple | 5% | 0.10% | Three O symbols in a row |
| L-triple | 3% | 0.30% | Three L symbols in a row |
| Trump/Elon | 1% | 1.00% | Three Trump or Elon symbols |
| Popcat/Dog | 0.2% | 10.00% | Three Popcat or Dogwifhat symbols |
| No Win | 82.8% | 0% | No matching symbols |

**Note**: PEPE (figure-8) is the top premium symbol but is not included in the weighted outcomes system. It only appears randomly as a "loser" symbol, making it extremely rare to get multiple PEPEs in a winning line.

### Winning Mechanics
- Wins occur when 3 matching symbols appear in the middle row (row 3) in columns 2-4
- If 4 symbols match: payout is scaled by 4/3
- If 5 symbols match: payout is scaled by 5/3
- Win sound effect plays on successful matches

Enjoy your modern slot machine! 🎰 