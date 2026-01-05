⚪ KINETIC-ZERO DESIGN SYSTEM

1. THE UX PHILOSOPHY: "Glanceability is King"

This system is built on The 0.5 Second Rule. If a user cannot understand the screen while jogging in bright sunlight in half a second, the design has failed.

Massive Typography: Data (Speed/Balance) is the hero.

Bottom-Heavy Ergonomics: The "Thumb Zone." All interactive elements sit in the bottom 30% of the screen. The top 70% is purely for visualization (Map).

Haptic UI: We design "Tactile Feedback" as a core component. The phone vibrates differently for "Loop Closed" vs "Trail Severed."

1. THE PALETTE: "International Safety"

We use a High-Albedo White base for maximum sunlight readability, paired with "Safety" colors used in aviation and motorsports.

The Foundations

TokenValueFunctionZero White#FFFFFFThe Canvas. Pure, #FFF. Maximizes screen brightness outdoors.Obsidian#000000The Data. Pure black text. Maximum contrast ratio (21:1).Fog#F3F4F6The Structure. Subtle dividers and secondary backgrounds.

The Active States (The "Triggers")

We use one accent color per state to avoid confusion.

TokenValueFunctionHyper-Volt#D4FF00Velocity. Used for your active trail and speed. It screams "Energy."Signal Red#FF2E00Warfare. Used for Enemy Trails and the "Sever" alert. Primal danger.Cobalt#0047FFEconomy. Used for Stacks (STX), Wallet, and Power-ups. Trustworthy but bold.3. TYPOGRAPHY: "Variable Speed"

We use a Variable Font that changes weight based on the user's speed. This is a unique, immersive "delighter."

Primary Font: Unbounded (or Sora)

Why: It’s geometric, quirky, and highly legible. It feels "Web3" without being "Matrix code."

The "Speed" Mechanic:

Walking (0-5km/h): Font Weight 400 (Regular).

Running (10km/h+): Font Weight 800 (Extra Bold) + Slanted (Italic).

Effect: The faster you run, the "heavier" and faster the numbers look.

1. UI COMPONENTS: "The Dynamic Deck"

We don't use floating buttons scattered everywhere. We use a Single "Deck" at the bottom of the screen.

A. The "Action Deck" (Bottom Sheet)

A solid White card with rounded top corners that sits at the bottom of the screen. It houses all controls.

Shadow: Deep, sharp shadow (0px -10px 40px rgba(0,0,0,0.1)) to separate it from the map.

Content:

Left: A circular "Radar" showing nearby STX nodes.

Right: A massive "Connect Wallet" or "Start" button.

Center: Your stats (Balance/Rank).

B. The "Slide-to-Engage" (Functionality)

Problem: Tapping a button while running is hard. You might miss or double-tap.

Solution: Slide interactions.

To Start Game: Slide a "Volt" circle from left to right.

To Buy Shield: Slide up.

Benefit: Prevents accidental clicks and feels physically satisfying.

C. The "Smart" Map Markers

Don't use pins. Pins obscure the map.

Use "Beacons":

STX Nodes: Vertical beams of Cobalt light fading up into the sky.

Territory: The ground inside a loop is shaded with a diagonal hatch pattern (like architectural drawings) in Black at 10% opacity. It’s distinct but doesn't block the road view.

1. IMMERSIVE MOMENT: The "Loop Closure"

This is the dopamine hit. Make it special.

Visual: When user creates a loop, the line snaps shut. A ripple of "Hyper-Volt" color travels along the perimeter of the loop.

Sound: A sharp "vacuum seal" sound effect (like an airlock closing).

UI: The Map flashes inverted (Black background, White lines) for 0.1 seconds (a camera flash effect) to signify the "Capture."

1. VISUALIZATION (The Active Run Screen)

The Layout Strategy:

Top 10% (The Status Bar):

Transparent background.

Left: LIVE • 3 RUNNERS (Blinking Red Dot).

Right: GPS: STRONG (Signal bars).

Middle 60% (The Viewport):

The Map. White roads, light grey blocks.

Your trail is a Thick Black Line (like a marker).

Your position is a Pulsing Hyper-Volt Circle.

Bottom 30% (The Dashboard):

Solid White Deck.

Massive Number: 14.2 (Speed).

Secondary Number: 0.05 STX (Earnings).

Action: A slide-bar at the very bottom saying ||| SLIDE TO END |||.

1. DEVELOPER HANDOFF (Tailwind Config)

This config enforces the "High Contrast" system.

JavaScript

module.exports = {

theme: {

extend: {

colors: {

// The Canvas

base: '#FFFFFF',

subtle: '#F4F4F5',

// The Ink

ink: '#09090B', // Zinc-950 (Not quite pitch black, softer on OLED)

// The Triggers

volt: '#CCFF00', // The Hero Color

alert: '#FF3B30', // Apple System Red

crypto: '#0055FF', // International Klein Blue

},

fontFamily: {

// Unbounded for "Tech/Crypto" feel, Inter for utility

display: ['Unbounded', 'cursive'],

body: ['Inter', 'sans-serif'],

},

boxShadow: {

'deck': '0 -8px 30px rgba(0, 0, 0, 0.08)', // The bottom sheet lift

'marker': '0 0 0 4px rgba(204, 255, 0, 0.4)', // The GPS pulse

}

},

},

}
