# Frontend Design & UI Specification: Impeccable Style

## 1. Design Philosophy
Transform the current interface from generic 'AI Slop' into a high-fidelity, minimal, and 'impeccable' workspace. The aesthetic should mirror **Notion's** functional minimalism—prioritizing content, typography, and purposeful whitespace over decorative elements.

### The "Impeccable" Core Principles:
- **Quiet UI**: Elements only appear when needed. Use subtle hover states rather than constant borders.
- **Information Hierarchy**: Bold headings, muted metadata, and high-contrast primary actions.
- **Precision**: Consistent 4px/8px grid, refined 1px borders, and generous padding.

---

## 2. Psychological Color Palette (The "Focus & Trust" System)
*Based on color theory to enhance productivity, reduce eye strain, and build professional trust.*

| Layer | Color Name | Hex | Psychology |
| :--- | :--- | :--- | :--- |
| **Background** | Ivory Cloud | `#FAFAFA` | Neutrality and clarity; less harsh than pure white. |
| **Surface (Cards)** | Optical White | `#FFFFFF` | Focus and purity of content. |
| **Primary Accent** | Deep Slate Cobalt | `#2563EB` | Confidence, intelligence, and stability. |
| **Success/Progress** | Forest Moss | `#059669` | Growth, calmness, and completion. |
| **Critical/Alert** | Crimson Ash | `#DC2626` | Urgency without causing panic (muted red). |
| **Text (Primary)** | Obsidian Ink | `#111827` | Authority and maximum readability. |
| **Text (Secondary)** | Storm Grey | `#6B7280` | Reduced cognitive load for secondary info. |
| **Borders** | Mist | `#E5E7EB` | Structure without visual noise. |

---

## 3. UI Component Specifications

### Sidebar (The Navigation Hub)
- **Style**: Fixed, translucent background (`backdrop-blur`) or solid Ivory Cloud.
- **Items**: Minimal icons (Lucide-React) with 13pt Geist/Inter font.
- **State**: Subtle background highlight on hover (`#F3F4F6`); vertical bar on the left for active state.

### Kanban Board (The "Notion" Style)
- **Columns**: No background fill. Use a simple bottom-border for headers.
- **Cards**: Flat white surface, 1px border. No heavy shadows.
- **Typography**: Task titles in Semi-bold Obsidian Ink.
- **Priority Labels**: Pill-shaped badges with desaturated backgrounds (e.g., Low: `#F3F4F6`, High: `#FEE2E2`).

### Buttons & Inputs
- **Primary Button**: Solid Deep Slate Cobalt with white text. 6px border-radius.
- **Secondary/Ghost**: Mist border, Obsidian Ink text. Subtle lift on hover.
- **Inputs**: Minimalist underline or 1px border that turns Blue on focus.

---

## 4. GitHub Copilot / Codex Prompt Guide

**Instructions for Codex:**
*When generating or refactoring React components, adhere to the following rules:*

1. **Tailwind Class Logic**:
   - Use `bg-slate-50` for page backgrounds and `bg-white` for cards.
   - Use `border-slate-200` for all separators. 
   - Avoid `shadow-lg` or `shadow-xl`. Use `shadow-sm` or a custom `0 1px 2px rgba(0,0,0,0.05)`.
   - Text sizes: `text-[13px]` for metadata, `text-[15px]` for body, `text-xl` for headers.

2. **The "Impeccable" Refactor Prompt**:
   > "Refactor the following React component to follow a 'Notion-esque' minimal design. Remove all rounded-xl or rounded-2xl classes and replace with `rounded-md`. Use a strict color palette of `#FAFAFA` for backgrounds and `#111827` for primary text. Ensure all padding is mathematically consistent (multiples of 4). Simplify the DOM structure; remove unnecessary wrapper divs. Use `lucide-react` for icons and ensure they are size 18 and color `text-slate-500` unless active."

3. **Layout Implementation**:
   - Implement the `AppLayout` with a slim 240px sidebar.
   - Use a 'Glassmorphism' effect for the Topbar: `bg-white/80 backdrop-blur-md sticky top-0 z-10`.

---

## 5. Screen-Specific Design Notes

### Dashboard
- **Metric Cards**: Large typography for numbers (`text-3xl font-bold`), minimal labels. 
- **Charts**: Use Recharts with desaturated 'Forest Moss' and 'Deep Slate Cobalt'. No grid lines.

### Canvas
- **Interface**: Full-screen mode. Tools should be a floating, minimal dock at the bottom center or a slim vertical bar on the left. 
- **Sticky Notes**: Use desaturated pastel tones (Soft Lemon: `#FEF9C3`, Soft Rose: `#FFE4E6`).

### Settings
- **Layout**: Vertical tabs on the left, clean form fields on the right. Group related settings with `h3` headers and 1px top-borders.