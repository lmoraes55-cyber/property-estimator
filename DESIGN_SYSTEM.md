# GroundWorks Design System

**Source of Truth for All UI Changes**

This document defines the complete design system for the GroundWorks property intelligence platform. All UI implementations must adhere to these standards.

---

## 1. COLOR PALETTE

### Primary Colors
```
Primary Green:        #1B5E4A  (Deep luxury green)
Primary Light:        #2A7A62  (Lighter variant for hovers/accents)
Primary Hover:        #0F3E33  (Darker for interactive states)
```

### Accent Colors
```
Gold Accent:          #B88A44  (Premium gold)
Gold Light:           #D4A574  (Light gold variant)
Gold Dark:            #8B6F3F  (Dark gold variant)
```

### Background Colors
```
Warm Premium White:   #F8F5EF  (Main background)
Ultra Soft Off-White: #FDFBF8  (Card/section backgrounds)
Pure White:           #FFFFFF  (Maximum contrast when needed)
```

### Text Colors
```
Premium Black:        #1A1A1A  (Main text)
Sophisticated Gray:   #6B6B6B  (Muted text)
Light Gray:           #8E8E8E  (Light/secondary text)
```

### Utility Colors
```
Premium Border:       #E8E6E1  (Use instead of primary for borders)
Success:              #4A7A68  (Muted green)
Warning:              #B88A44  (Gold, same as accent)
Error:                #C75A5A  (Red tone)
```

---

## 2. TYPOGRAPHY SYSTEM

### Font Family
```
Primary:    Geist (system-ui, -apple-system, sans-serif fallback)
Mono:       Geist Mono (for code/technical content)
```

### Heading Hierarchy

#### h1 (Headlines)
```
Size:         clamp(2rem, 6vw, 4rem)
Weight:       700 (bold)
Line Height:  1.1
Letter Spacing: -0.02em
Usage:        Page titles, major section headers
```

#### h2 (Section Headers)
```
Size:         clamp(1.5rem, 4vw, 2.25rem)
Weight:       700 (bold)
Line Height:  1.2
Letter Spacing: -0.01em
Usage:        Subsection headers, card titles
```

#### h3 (Subsection Headers)
```
Size:         clamp(1.125rem, 3vw, 1.5rem)
Weight:       600 (semibold)
Line Height:  1.3
Usage:        Cards, component headers
```

#### h4-h6
```
Weight:       600 (semibold)
Line Height:  1.4
Usage:        Secondary headers, labels
```

### Body Text
```
Line Height:  1.6
Letter Spacing: 0.3px
Weight:       400 (regular)
Size:         1rem (16px) base
```

### Small Text / Labels
```
Size:         0.75rem (12px)
Weight:       500-600 (medium to semibold)
Tracking:     0.1em to 0.15em (all-caps labels)
```

---

## 3. SHADOW SYSTEM

### CSS Variables
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,.04);
--shadow-md: 0 12px 32px rgba(0,0,0,.06);
--shadow-lg: 0 24px 48px rgba(0,0,0,.04);
```

### Complete Shadow Stack (Premium Cards)
```css
box-shadow: 
  0 1px 2px rgba(0,0,0,.04),
  0 12px 32px rgba(0,0,0,.06),
  0 24px 48px rgba(0,0,0,.04);
```

### Application
- **Cards/Containers**: Use complete stack (all three shadows)
- **Hover State**: Slightly increase md shadow (0.08 opacity)
- **Buttons**: Use md shadow, increase on hover
- **Modals/Overlays**: Use lg shadow only
- **Input Focus**: Use sm shadow with color tint

---

## 4. SPACING & BORDER RADIUS

### Border Radius
```
Small Components:     12px (rounded-lg)
Cards/Containers:     24px (rounded-2xl) — MINIMUM
Large Sections:       32px (rounded-3xl)
Buttons:              24px (rounded-2xl)
Input Fields:         20px (rounded-2xl)
```

### Spacing Scale
```
xs:   4px
sm:   8px
md:   12px
lg:   16px
xl:   24px
2xl:  32px
3xl:  40px
4xl:  48px
```

### Component Spacing
```
Card padding:         2.5rem (40px) - 2.5rem (40px)
Button padding:       1rem (16px) vertical, 2rem (32px) horizontal
Input padding:        1rem (16px) vertical, 1.25rem (20px) horizontal
Section gap:          2.5rem (40px) vertical, 3rem (48px) horizontal
```

---

## 5. CARDS & CONTAINERS

### Premium Card Definition
```jsx
style={{
  background: colors.bgSection,
  border: "1px solid " + colors.border,
  borderRadius: "24px",
  boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`,
  backdropFilter: "blur(20px)"
}}
```

### Card Hover State
```jsx
className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
style={{
  // ... card styles above
  transform: "translateY(-4px)"  // on hover
}}
```

### Glass Morphism Effect
```jsx
backdropFilter: "blur(20px)"
background: "rgba(255, 255, 255, 0.9)"  // or color variant
border: "1px solid " + colors.border
```

---

## 6. BUTTONS

### Primary Button
```jsx
style={{
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  color: "#FFF",
  boxShadow: `0 8px 20px ${colors.primary}30`,
  borderRadius: "24px",
  padding: "1rem 2rem",
  fontWeight: "700"
}}
className="transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
```

### Secondary Button
```jsx
style={{
  background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
  color: colors.textMain,
  boxShadow: `0 8px 20px ${colors.secondary}30`,
  borderRadius: "24px",
  padding: "1rem 2rem",
  fontWeight: "700"
}}
className="transition-all duration-300 hover:-translate-y-0.5"
```

### Ghost Button
```jsx
style={{
  background: colors.primary + "08",
  color: colors.primary,
  border: "1px solid " + colors.primary + "20",
  borderRadius: "24px",
  padding: "1rem 2rem",
  fontWeight: "600"
}}
className="transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
```

### Button States
```
Default:    Full shadow, normal position
Hover:      Slightly increased shadow, translateY(-2px)
Active:     Reduced shadow, translateY(0)
Disabled:   opacity: 0.25, no shadow, no hover effect
```

---

## 7. INPUT FIELDS

### Focus State
```jsx
style={{
  border: `1px solid ${focused ? colors.secondary : colors.border}`,
  boxShadow: focused ? `0 0 0 3px ${colors.secondary}15` : "none",
  outline: "none"
}}
className="rounded-2xl px-5 py-4 text-sm transition-all focus:ring-2"
```

### Filled State
```jsx
border: `1px solid ${value ? colors.secondary : colors.border}`
```

---

## 8. ANIMATION & MOTION

### Global Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}
```

#### Slide Down
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-down {
  animation: slideDown 0.6s ease-out;
}
```

### Animation Timing
```
Duration:     0.6s (entrance), 0.3s (transitions)
Easing:       ease-out (entrance), ease (transitions)
Stagger:      +0.1s per element (max 0.3s)
```

### Transition Properties
```
All transitions:   transition-all duration-300
Hover states:      Smooth, no jarring effects
No bounce/elastic: Apple aesthetic (not startup)
```

---

## 9. BACKGROUNDS

### Page Background
```jsx
style={{
  background: `radial-gradient(ellipse 900px 700px at 50% 35%, ${colors.secondary}12 0%, transparent 60%), linear-gradient(135deg, #FFFFFF 0%, ${colors.bgMain} 30%, ${colors.bgSection} 100%)`
}}
```

### Radial Gradient (Depth)
```
Center:       50% horizontal, 35-40% vertical
Size:         900px x 700px ellipse
Color:        ${colors.secondary}12 or ${colors.secondary}08 (subtle tint)
Fade:         transparent at 60% radius
Purpose:      Subtle depth, luxury feel
```

### Linear Gradient (Overall)
```
Direction:    135deg (diagonal top-left to bottom-right)
Colors:       #FFFFFF → bgMain → bgSection
Distribution: 0% → 30% → 100%
Purpose:      Warm, inviting color progression
```

---

## 10. COMPONENT PATTERNS

### Metric Card (Fintech Dashboard)
```jsx
// Icon with glow
style={{
  fontSize: "24px",
  filter: `drop-shadow(0 4px 12px ${colors.secondary}40)`
}}
className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"

// Large value text
className="text-3xl font-bold"
style={{ color: colors.primary }}

// Premium card container
className="group rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
```

### Hero Headline with Gradient
```jsx
style={{
  background: `linear-gradient(135deg, ${colors.textMain} 0%, ${colors.primary} 100%)`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontSize: "clamp(2.5rem, 8vw, 4rem)",
  fontWeight: "700",
  lineHeight: "1.1"
}}
```

### Top Bar / Navigation
```jsx
style={{
  background: colors.bgMain + "f0",  // 94% opacity
  borderBottom: "1px solid " + colors.border,
  backdropFilter: "blur(20px)",
  position: "sticky",
  top: 0,
  zIndex: 10
}}
```

### Step Pills / Tab Navigation
```jsx
// Active state
style={{
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  color: "#FFF",
  letterSpacing: "0.05em"
}}

// Inactive state
style={{
  background: "transparent",
  color: colors.textLight,
  border: "1px solid " + colors.border
}}
```

---

## 11. GLASS MORPHISM

### Standard Glass Effect
```jsx
backdropFilter: "blur(20px)"
background: colors.bgSection  // Already has transparency
border: "1px solid " + colors.border
```

### Enhanced Glass (Stronger Effect)
```jsx
backdropFilter: "blur(30px)"
background: "rgba(255, 255, 255, 0.95)"
border: "1px solid rgba(255, 255, 255, 0.2)"
```

---

## 12. GRADIENTS

### Button Gradient
```
Direction:    135deg
Start:        Primary color (0%)
End:          Primary Light (100%)
Example:      `linear-gradient(135deg, #1B5E4A 0%, #2A7A62 100%)`
```

### Headline Gradient
```
Direction:    135deg
Start:        Text Main (0%)
End:          Primary (100%)
Purpose:      Visual interest while maintaining readability
```

### Background Radial
```
Shape:        Ellipse
Size:         900px x 700px
Position:     50% horizontal, 35% vertical
Color:        Secondary tinted (12% opacity) fading to transparent
Purpose:      Subtle luxury depth without obvious pattern
```

---

## 13. HOVER & INTERACTIVE STATES

### Card Hover
```
Transform:    translateY(-4px)
Shadow:       Increase md shadow opacity to 0.08
Duration:     300ms ease
Transition:   transition-all duration-300
```

### Button Hover
```
Transform:    translateY(-2px)
Shadow:       Increase md shadow
Glow:         If primary, maintain 30% opacity color glow
Duration:     300ms ease
```

### Input Focus
```
Border:       Change to secondary color
Shadow:       Add color tint shadow (secondary at 15% opacity)
Transition:   300ms ease
```

### Icon Hover (in Cards)
```
Scale:        110% (scale-110)
Rotation:     -6 degrees
Duration:     300ms ease
Glow:         drop-shadow(0 4px 12px color@40%)
```

---

## 14. BEST PRACTICES

### DO ✅
- ✅ Use border-radius minimum of 24px on all cards/buttons
- ✅ Apply complete shadow stack to premium containers
- ✅ Use glass morphism (blur: 20px) on overlays/cards
- ✅ Apply animations to entrance only (fade in, slide up)
- ✅ Use gradient backgrounds for primary CTAs
- ✅ Use professional line icons instead of emojis
- ✅ Maintain 1.6 line-height for body text
- ✅ Use backdrop filters for layered depth
- ✅ Apply hover state animations (300ms duration)
- ✅ Maintain color consistency (primary green, gold accent)
- ✅ Use sticky headers in data tables
- ✅ Add progress bars for percentage-based metrics
- ✅ Color-code occupancy thresholds (75%+, 67-74%, <67%)
- ✅ Emphasize key columns (Net To Landlord) with borders and backgrounds

### DON'T ❌
- ❌ Use border-radius smaller than 24px on cards
- ❌ Apply harsh, high-opacity shadows
- ❌ Use flat colors instead of gradients for buttons
- ❌ Create bouncing or elastic animations (not Apple-like)
- ❌ Mix different blur values (always use 20px standard)
- ❌ Use primary color for borders (use border color instead)
- ❌ Create animations longer than 0.6s
- ❌ Apply multiple hover effects at once (choose one main effect)
- ❌ Add decorative patterns or textures
- ❌ Change core colors without updating DESIGN_SYSTEM.md
- ❌ Use colorful or decorative emojis (professional icons only)
- ❌ Remove columns or change table structure
- ❌ Remove or hide data values
- ❌ Use bright colors for occupancy indicators (<67% should be soft amber)

---

## 15. IMPLEMENTATION CHECKLIST

When building any new UI component, verify:

### Visual Design
- [ ] Uses correct border-radius (24px minimum)
- [ ] Applies premium shadow stack if container
- [ ] Color palette matches (primary, secondary, text colors)
- [ ] Typography hierarchy is clear (h1-h6)
- [ ] Spacing follows grid (4px, 8px, 12px, etc.)

### Interactive Design
- [ ] Hover state is smooth (300ms ease)
- [ ] Transform is subtle (translateY, scale)
- [ ] Shadows update on interaction
- [ ] Focus states visible for accessibility
- [ ] No jarring or bouncy animations

### Background & Depth
- [ ] Uses glass morphism if overlay
- [ ] Background gradient matches page style
- [ ] Radial gradient adds subtle depth
- [ ] Border colors use border color variable
- [ ] Backdrop filters are consistent (20px blur)

### Motion
- [ ] Entrance animations fade in (0.6s)
- [ ] Staggered animations (0.1s delay per element)
- [ ] No unnecessary motion
- [ ] Easing is ease-out or ease (never bounce)
- [ ] Duration matches standard (0.3s or 0.6s)

---

## 16. COLOR USAGE QUICK REFERENCE

| Element | Color | Alternative |
|---------|-------|-------------|
| Primary Buttons | Gradient (primary → primaryLight) | - |
| Secondary Buttons | Gradient (secondary → secondaryLight) | - |
| Headlines | Textual gradient or secondary | primary |
| Body Text | textMain | textMuted |
| Muted Text | textMuted | textLight |
| Card Backgrounds | bgSection | bgWhite |
| Card Borders | border | NOT primary |
| Accent Elements | secondary | primary |
| Icons | secondary | primary |
| Badges | primary + "08" background | secondary + "08" |
| Shadows | Use CSS variables | - |

---

## 17. TYPOGRAPHY QUICK REFERENCE

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| h1 | 2-4rem | 700 | 1.1 |
| h2 | 1.5-2.25rem | 700 | 1.2 |
| h3 | 1.125-1.5rem | 600 | 1.3 |
| Body | 1rem | 400 | 1.6 |
| Small/Labels | 0.75rem | 500-600 | auto |
| UPPERCASE LABEL | 0.75rem | 600 | auto, 0.1-0.15em tracking |

---

## 18. PREMIUM TABLE COMPONENT

### Container & Header
```jsx
// Table container
className="rounded-3xl overflow-hidden"
style={{
  border: "1px solid " + colors.border,
  boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`,
  backdropFilter: "blur(20px)"
}}

// Header section
style={{
  background: colors.bgSection,
  borderBottom: "1px solid " + colors.border,
  padding: "24px 32px"
}}
```

### Table Head (Sticky)
```jsx
<thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
  <tr style={{
    background: colors.bgSection,
    borderBottom: "2px solid " + colors.primary
  }}>
    <th className="px-6 py-4 text-left text-xs font-semibold"
      style={{
        color: colors.textMuted,
        letterSpacing: "0.05em",
        background: colors.bgSection
      }}>
      Header Text
    </th>
  </tr>
</thead>
```

### Data Row (Alternating)
```jsx
// White rows (i % 2 === 0)
style={{
  background: "#FFFFFF",
  borderBottom: "1px solid " + colors.border,
  transition: "background-color 0.2s"
}}

// Cream rows (i % 2 === 1)
style={{
  background: "#FCFAF7",
  borderBottom: "1px solid " + colors.border
}}

// Cell padding
className="px-6 py-5"
```

### Revenue Column with Progress Bar
```jsx
<td className="px-6 py-5">
  <div className="space-y-2">
    <div>
      <p className="text-sm font-medium" style={{ color: colors.primary }}>
        AED {value}
      </p>
      <p className="text-xs" style={{ color: colors.textMuted }}>
        {percentage}% of annual
      </p>
    </div>
    {/* Progress bar */}
    <div style={{
      width: "100%",
      height: "4px",
      background: colors.border,
      borderRadius: "2px",
      overflow: "hidden"
    }}>
      <div style={{
        width: `${percentage}%`,
        height: "100%",
        background: colors.primary,
        borderRadius: "2px",
        transition: "width 0.3s"
      }} />
    </div>
  </div>
</td>
```

### Occupancy Column with Color-Coded Progress
```jsx
<td className="px-6 py-5">
  <div className="space-y-2">
    <p className="text-sm font-medium" style={{ color: occupancyColor }}>
      {occupancyRate.toFixed(0)}%
    </p>
    {/* Color rules:
        75%+ = #1B5E4A (primary green)
        67-74% = #B88A44 (gold)
        <67% = #A0826D (soft amber)
    */}
    <div style={{
      width: "100%",
      height: "4px",
      background: colors.border,
      borderRadius: "2px",
      overflow: "hidden"
    }}>
      <div style={{
        width: `${Math.min(rate, 100)}%`,
        height: "100%",
        background: occupancyColor,
        borderRadius: "2px",
        transition: "background-color 0.3s, width 0.3s"
      }} />
    </div>
  </div>
</td>
```

### Net To Landlord Column (Dominant)
```jsx
<td className="px-6 py-5"
  style={{
    background: `${colors.primary}08`,
    borderLeft: `3px solid ${colors.primary}`
  }}>
  <p className="text-sm font-bold" style={{
    color: colors.primary,
    fontSize: "16px"
  }}>
    AED {value}
  </p>
</td>
```

### Secondary Columns (Softer)
```jsx
<td className="px-6 py-5" style={{ color: colors.textLight }}>
  <p className="text-sm">AED {value}</p>
</td>
```

### Total Row (Conclusion)
```jsx
<tr style={{
  background: "#F5F2ED",
  borderTop: "2px solid " + colors.primary,
  borderBottom: "none"
}}>
  <td className="px-6 py-6 font-bold"
    style={{
      color: colors.textMain,
      fontSize: "15px"
    }}>
    TOTAL
  </td>
  {/* All numeric cells use font-bold, larger font (text-base) */}
  <td className="px-6 py-6">
    <p className="text-base font-bold" style={{ color: colors.primary }}>
      AED {totalValue}
    </p>
  </td>
  {/* Net To Landlord total gets strongest emphasis */}
  <td className="px-6 py-6" style={{
    background: colors.primary,
    borderLeft: `3px solid ${colors.primary}`
  }}>
    <p className="text-lg font-bold" style={{ color: "#FFF" }}>
      AED {totalNetValue}
    </p>
  </td>
</tr>
```

---

## 19. ICON SYSTEM (Professional Line Icons)

### Icon Circle Background
```jsx
style={{
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  background: "#E8F3EE",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1B5E4A",
  flexShrink: 0
}}
```

### Icon SVG Properties
```jsx
<svg width="24" height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
```

### Icon Mapping
- Annual Revenue (Gross) → Chart Line / Bar Icon
- Net To Landlord → User / Owner Icon
- Management Fees → Pie Chart Icon
- Utilities + Maintenance → Wrench / Tools Icon
- Gross Yield → Stacked Coins Icon
- Net Yield → Percentage Icon
- STR vs LTR Delta → Trending Up Icon
- Average Daily Rate → Calendar Icon

### Hover State
```jsx
className="transition-transform duration-300 group-hover:scale-110"
// Icons scale up slightly on card hover
```

---

## 20. GLOBAL CSS CLASSES

```css
.animate-fade-in { animation: fadeIn 0.6s ease-out; }
.animate-slide-up { animation: slideUp 0.6s ease-out; }
.animate-slide-down { animation: slideDown 0.6s ease-out; }

/* Smooth transitions for all interactive elements */
* { transition: all 0.3s ease; }
```

---

## 22. VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-06-08 | Premium table component patterns added |
| - | - | Icon system specifications (professional SVG line icons) |
| - | - | Revenue progress bars, occupancy color coding |
| - | - | Net To Landlord visual dominance patterns |
| - | - | Alternating row backgrounds, sticky headers |
| 1.0 | 2026-06-08 | Initial premium design system |
| - | - | Stripe + Apple + Property Finder Premium aesthetic |
| - | - | Comprehensive typography, color, shadow, and animation specs |

---

## 23. QUESTIONS & UPDATES

To maintain consistency:
1. **Before creating new components**: Check this document
2. **When unsure about colors**: Reference Section 1 (Color Palette)
3. **When styling buttons**: Use Section 6 (Buttons) patterns
4. **When adding animations**: Follow Section 8 (Animation) guidelines
5. **When uncertain about spacing**: Use Section 4 (Spacing Scale)
6. **When building tables**: Reference Section 18 (Premium Table Component)
7. **When creating icons**: Use Section 19 (Icon System) patterns

**This is the source of truth. All UI changes must align with these standards.**

---

*Last Updated: 2026-06-08*  
*Design Authority: Claude Haiku 4.5*  
*Brand: GroundWorks Dubai Property Intelligence Platform*
