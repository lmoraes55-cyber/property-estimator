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

## 6. BUTTONS & CTA SYSTEM

### Primary Green CTA Button
```jsx
// For main actions: Continue, Primary CTAs, "Get in Touch", etc.
className="transition-all duration-300 hover:-translate-y-0.5 hover:brightness-103"
style={{
  background: "linear-gradient(135deg, #1B5E4A 0%, #2F7D63 100%)",
  color: "#FFF",
  boxShadow: "0 8px 20px rgba(27, 94, 74, 0.3)",
  borderRadius: "rounded-2xl",
  padding: "1rem 2rem",
  fontWeight: "700",
  transitionDuration: "250ms"
}}
```

### Premium Gold CTA Button
```jsx
// For premium actions: "Generate Report", "Find Operator", "Contact for Quote", etc.
className="transition-all duration-300 hover:-translate-y-0.5 hover:brightness-103"
style={{
  background: "linear-gradient(135deg, #B88A44 0%, #D4AF6A 100%)",
  color: "#FFF",
  boxShadow: "0 8px 20px rgba(184, 138, 68, 0.3)",
  borderRadius: "rounded-2xl",
  padding: "1rem 2rem",
  fontWeight: "700",
  transitionDuration: "250ms"
}}
```

### Secondary Outline Button
```jsx
// For secondary actions: "Learn More", "Back", optional CTAs, etc.
className="transition-all duration-300 hover:-translate-y-0.5"
style={{
  background: "transparent",
  color: colors.primary,
  border: "1px solid " + colors.primary,
  borderRadius: "rounded-xl",
  padding: "1rem 2rem",
  fontWeight: "600",
  transitionDuration: "250ms"
}}
```

### Ghost Button (Legacy)
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

### Button Hover Effects
```
Transform:    translateY(-2px)      (lift effect)
Brightness:   brightness(1.03)      (subtle glow)
Duration:     250ms                 (smooth transition)
Easing:       ease (default)        (natural feel)
Shadow:       Increase via brightness effect
No bouncing, no elastic effects (Apple aesthetic)
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

## 12. GRADIENTS & BRAND SYSTEM

### Primary Green CTA Gradient
```
Purpose:      Main action buttons, primary CTAs
Direction:    135deg
Start:        #1B5E4A (Brand Green)
End:          #2F7D63 (Lighter Green)
Example:      linear-gradient(135deg, #1B5E4A 0%, #2F7D63 100%)
Text Color:   #FFFFFF
Shadow:       0 8px 20px rgba(27, 94, 74, 0.3)
Hover:        translateY(-2px), brightness(1.03), 250ms transition
Usage:        "Find a Leasing Agent", "Continue", "Get in Touch"
```

### Gold/Brown Premium CTA Gradient
```
Purpose:      Premium actions, opportunity cards, recommendations
Direction:    135deg
Start:        #B88A44 (Brand Gold)
End:          #D4AF6A (Lighter Gold)
Example:      linear-gradient(135deg, #B88A44 0%, #D4AF6A 100%)
Text Color:   #FFFFFF
Shadow:       0 8px 20px rgba(184, 138, 68, 0.3)
Hover:        translateY(-2px), brightness(1.03), 250ms transition
Usage:        "Generate My Report", "Find My Best Operator", "Contact for Quote"
```

### Mixed Brand Gradient (Signature)
```
Purpose:      Hero cards, featured sections, premium banners (use sparingly)
Direction:    90deg (horizontal)
Stops:        #1B5E4A (0%), #4D7A4E (40%), #8A8442 (70%), #B88A44 (100%)
Example:      linear-gradient(90deg, #1B5E4A 0%, #4D7A4E 40%, #8A8442 70%, #B88A44 100%)
Matches:      GroundWorks headline gradient (green to gold transition)
Effect:       Premium, elegant, wealth-focused
```

### Light Brand Gradient (Subtle Backgrounds)
```
Purpose:      Recommendation sections, summary cards, insight panels
Direction:    135deg
Start:        rgba(27, 94, 74, 0.08)   (Brand green, 8% opacity)
End:          rgba(184, 138, 68, 0.08) (Brand gold, 8% opacity)
Example:      linear-gradient(135deg, rgba(27,94,74,0.08) 0%, rgba(184,138,68,0.08) 100%)
Usage:        Card backgrounds, information panels, insight cards
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

## 27. PREMIUM OPERATOR PROFILES

### Operator Card Structure
```
1. Company Logo Section (Gradient Header Background)
   - Logo container: 120px x 120px
   - White background, subtle border, rounded corners (16px)
   - Logo placeholder or company initials
   - Padding: 32px
   - Gradient background: linear-gradient(bgMain → bgSection)

2. Company Information
   - Company Name: 2xl font, bold
   - Tagline: sm font, muted color
   - Website Link: Clickable with globe icon 🌐
   - Opens in new tab

3. Trust Indicators (Badges)
   - Established [Year]
   - Licensed Operator
   - Dubai-Based
   - Style: primary + "15" background, primary text
   - Rounded full (pill shape)

4. Google Ratings
   - Rating number: 2xl font, bold
   - Stars display (★★★★★)
   - Review count with source

5. Match Badges (if applicable)
   - Smaller version of trust badges
   - Color: isBest ? secondary : primary
```

### Contact Information Section
```jsx
// Premium contact card container
style={{
  background: colors.bgMain,
  border: "1px solid " + colors.border,
  borderRadius: "12px",
  padding: "24px"
}}

// Each contact line
- 📱 Phone (clickable tel: link)
- ✉️ Email (clickable mailto: link)
- 🌐 Website (clickable, opens new tab)

Font: 14px, professional
Icons: Simple emoji (📱✉️🌐)
Hover: opacity 0.8, smooth transition
```

### Key Metrics Grid
```
3-column grid:
- Commission: X–Y%
- Onboarding: N week(s)
- Portfolio: N+ units

Card styling:
- Background: bgMain
- Border: subtle
- Text center-aligned
- Padding: 16px (p-4)
```

### OTA Platform Coverage
```
Display each platform as badge:
- Listed platforms: primary + "15" background, primary border
- Unlisted: bgMain background, muted text
- Show rating if available (★4.8)

Grid: flex wrap, gap-2
Padding: px-4 py-2
Font: 12px, medium weight
Rounded: lg (12px)
```

### Action Buttons
```
Two-button layout (if website available):

Button 1 - Visit Website:
- Style: Outline (transparent bg, primary border, primary text)
- Hover: translate-y-0.5, opacity transition
- Opens website in new tab

Button 2 - Contact / Learn More:
- Top Operator: Gold gradient (premium, prominent)
- Regular: Green gradient
- Hover: translate-y-0.5, brightness(1.03)
- Gradient CTA patterns

If no website: Button 2 spans full width
```

### Card Container
```
Rounded corners: 24px
Padding: 32px (p-8)
Spacing between sections: space-y-8
Background: bgSection
Border: subtle
Shadows: shadowSm + shadowMd
Feel: LinkedIn company profile
```

### Design Principles
✅ Professional company profile aesthetic
✅ Trust signals prominent (established, licensed, Dubai-based)
✅ Contact information easily accessible
✅ Logo/branding area premium and centered
✅ Visual hierarchy clear and intentional
✅ Brand colors for CTAs and highlights
✅ Website links and contact info clickable
✅ Opens links in new tabs for better UX
✅ Premium spacing and typography
✅ Similar to Property Finder, Bayut, LinkedIn

---

## 28. VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.4 | 2026-06-08 | Premium operator profiles for credibility |
| - | - | Operator card structure: logo, info, trust signals |
| - | - | Company branding area with logo container |
| - | - | Contact information section (phone, email, website) |
| - | - | Trust indicators (established, licensed, Dubai-based) |
| - | - | Professional action buttons (Visit Website + Contact) |
| - | - | Enhanced OTA platform coverage display |
| - | - | Similar to LinkedIn, Property Finder, Bayut |
| 1.3 | 2026-06-08 | Premium chart system for investor intelligence |
| - | - | Revenue chart: area + line, premium gradients |
| - | - | Occupancy chart: area + line with 75% benchmark |
| - | - | Custom premium tooltips (dark theme, soft shadows) |
| - | - | Seasonal context labels (peak/low season) |
| - | - | Data point markers with glow effects |
| - | - | Subtle gridlines (rgba, minimal visual weight) |
| - | - | Inspired by Stripe, Bloomberg, TradingView |
| 1.2 | 2026-06-08 | Brand gradient system for CTA buttons added |
| - | - | Green primary gradient (#1B5E4A → #2F7D63) specifications |
| - | - | Gold premium gradient (#B88A44 → #D4AF6A) specifications |
| - | - | Mixed brand gradient (green-to-gold horizontal) |
| - | - | Light brand gradient for subtle backgrounds (8% opacity) |
| - | - | Button hover effects (translateY, brightness, 250ms) |
| - | - | CTA card patterns and design language |
| - | - | Icon treatment rules for different button types |
| 1.1 | 2026-06-08 | Premium table component patterns added |
| - | - | Icon system specifications (professional SVG line icons) |
| - | - | Revenue progress bars, occupancy color coding |
| - | - | Net To Landlord visual dominance patterns |
| - | - | Alternating row backgrounds, sticky headers |
| 1.0 | 2026-06-08 | Initial premium design system |
| - | - | Stripe + Apple + Property Finder Premium aesthetic |
| - | - | Comprehensive typography, color, shadow, and animation specs |

---

## 24. CTA CARD PATTERNS & DESIGN LANGUAGE

### Green CTA Card Container
```jsx
// For agent/operator recommendations, primary call-to-actions
style={{
  background: `linear-gradient(135deg, ${colors.bgSection} 0%, ${colors.bgWhite} 100%)`,
  border: `1px solid ${colors.border}`,
  boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`,
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  padding: "40px"
}}
```

### Gold Premium CTA Card Container
```jsx
// For premium insights, opportunity highlights, recommendations
style={{
  background: `linear-gradient(135deg, ${colors.secondary}15 0%, ${colors.secondary}08 100%)`,
  border: `1px solid ${colors.border}`,
  boxShadow: `${colors.shadowSm}, ${colors.shadowMd}, ${colors.shadowLg}`,
  backdropFilter: "blur(20px)"
}}
```

### CTA Card Content Hierarchy
```
1. Overline/Label (12px, font-bold, text-muted, uppercase, 0.15em spacing)
2. Headline (32px, font-bold, text-main or secondary)
3. Description (14px, text-muted, line-height 1.6)
4. CTA Button (inline-flex, gap-2, rounded-2xl, full-width or auto)
```

### Icon Treatment in Buttons
```
Green buttons:         White icons (#FFF)
Gold buttons:          White icons (#FFF)
Outline buttons:       Brand green icons (#1B5E4A)
Never use random colors — follow button color scheme
```

---

## 25. PREMIUM CHART SYSTEM

### Revenue Chart (Area + Line)
```jsx
// Premium revenue visualization
type: "natural"                    // Smooth curved lines
stroke: #1B5E4A                   // Brand green
strokeWidth: 3px                  // Premium thickness
fill: "url(#revenueGradient)"     // Soft gradient fill

Gradient Definition:
- Start: rgba(27,94,74,0.35)     // 35% opacity green
- End:   rgba(27,94,74,0.03)     // 3% opacity fade

Data Point Markers:
- Default: 4px circle, white stroke
- Highest Revenue: 6px, glow effect
- Lowest Revenue: 6px, glow effect
- Hover: 7px, enhanced visibility

Custom Tooltip:
- Background: rgba(26,26,26,0.95)
- Border: 1px solid rgba(255,255,255,0.1)
- Shadow: 0 8px 32px rgba(0,0,0,0.2)
- Content: Month, Revenue, % of annual
```

### Occupancy Chart (Area + Line)
```jsx
// Premium occupancy visualization
type: "natural"                    // Smooth curved lines
stroke: #B88A44                   // Brand gold
strokeWidth: 3px                  // Premium thickness
fill: "url(#occupancyGradient)"   // Subtle gradient fill

Gradient Definition:
- Start: rgba(184,138,68,0.2)    // 20% opacity gold
- End:   rgba(184,138,68,0.02)   // 2% opacity fade

Data Point Markers:
- Default: 4px circle, white stroke
- Above 75%: 5px, glow effect (premium performance)
- Hover: 7px, enhanced visibility

Benchmark Line:
- Reference: 75% occupancy threshold
- Style: Dashed (6px dash, 4px gap)
- Color: #B88A44 (brand gold)
- Label: "75% Benchmark"
- Helps owners understand performance target

Custom Tooltip:
- Background: rgba(26,26,26,0.95)
- Border: 1px solid rgba(255,255,255,0.1)
- Shadow: 0 8px 32px rgba(0,0,0,0.2)
- Content: Month, Occupancy %, Revenue
```

### Chart Gridlines
```
Style: Minimal, subtle
Color: rgba(27,94,74,0.08)        // Revenue charts
        rgba(184,138,68,0.08)     // Occupancy charts
Direction: Horizontal only (vertical={false})
Dash: None (solid but very subtle)
Purpose: Provide reference without dominating chart
```

### Chart Margins & Layout
```jsx
Margins: {
  top: 20,      // Space for legend/labels
  right: 20,    // Space on right
  left: -20,    // Negative for compact view
  bottom: 20    // Space for x-axis labels
}

Height: 280px              // Generous chart area
Padding: p-10              // 40px card padding
Border Radius: 24px        // Premium corners
Shadows: Full stack        // Premium depth
Container Backdrop: blur(20px)
```

### Seasonal Context Labels
```
Revenue Chart:
- Peak Season: Nov–Apr
- Low Season: Jun–Aug
- Label position: Below chart
- Font size: 12px
- Color: Muted, with emphasis on season label

Occupancy Chart:
- Benchmark context: "75% Strong Performance"
- Helps owners understand target
- Font size: 12px
```

### Chart Interactions
```
Hover Effects:
- Data point enlarges (4px → 7px)
- Tooltip appears with smooth fade
- Active dot glow effect
- Smooth transition (300ms)

Tooltip Appearance:
- Dark semi-transparent background
- Soft white border
- Premium shadow
- Padding: 16px
- Border-radius: 12px
- Font: 11-12px, professional
```

### Design Inspiration
```
Stripe Analytics:
- Clean, minimal data visualization
- Focus on data, not decoration
- Premium typography and spacing

Bloomberg (Simplified):
- Professional, institutional feel
- Clear hierarchy and legibility
- Data-focused design

TradingView:
- Smooth curves, premium lines
- Interactive tooltips
- Benchmark lines for context

Wealth Management Dashboards:
- Premium appearance, high trust
- Clear performance indicators
- Institutional color schemes
```

---

## 26. BRAND GRADIENT USAGE GUIDE

### When to Use Each Gradient

**Green Primary Gradient (#1B5E4A → #2F7D63)**
- Main action buttons: "Continue", "Get Started"
- Agent/Leasing CTAs: "Find a Leasing Agent", "Get in Touch"
- Primary navigation and flows
- Recommended actions

**Gold Premium Gradient (#B88A44 → #D4AF6A)**
- Report generation: "Generate My Report"
- Operator selection: "Find My Best Operator"
- Premium services: "Contact for Quote"
- Opportunity highlights
- Recommendations

**Mixed Brand Gradient (Green → Gold horizontal)**
- Hero banners (use sparingly)
- Featured sections
- Premium recommendations
- Featured cards (max 1-2 per page)

**Light Brand Gradient (subtle, 8% opacity)**
- Card backgrounds
- Information panels
- Recommendation sections
- Supporting content areas

### Design Principles
✅ Premium, elegant aesthetic
✅ Wealth-focused, luxury real estate vibe
✅ Subtle, not aggressive
✅ Consistent with GroundWorks headline gradient
✅ High trust and institutional feel
✅ Not a colorful SaaS startup
✅ Not neon or bright

---

## 29. QUESTIONS & UPDATES

To maintain consistency:
1. **Before creating new components**: Check this document
2. **When unsure about colors**: Reference Section 1 (Color Palette)
3. **When styling buttons**: Use Section 6 (Buttons & CTA System) patterns
4. **When adding animations**: Follow Section 8 (Animation) guidelines
5. **When uncertain about spacing**: Use Section 4 (Spacing Scale)
6. **When building tables**: Reference Section 18 (Premium Table Component)
7. **When creating icons**: Use Section 19 (Icon System) patterns
8. **When applying gradients**: Reference Section 12 (Gradients & Brand System)
9. **When designing CTA cards**: Reference Section 24 (CTA Card Patterns)
10. **When creating charts**: Reference Section 25 (Premium Chart System)
11. **When designing dashboards**: Follow Section 26 (Brand Gradient Usage Guide)
12. **When building operator profiles**: Reference Section 27 (Premium Operator Profiles)

**This is the source of truth. All UI changes must align with these standards.**

---

*Last Updated: 2026-06-08*  
*Design Authority: Claude Haiku 4.5*  
*Brand: GroundWorks Dubai Property Intelligence Platform*
