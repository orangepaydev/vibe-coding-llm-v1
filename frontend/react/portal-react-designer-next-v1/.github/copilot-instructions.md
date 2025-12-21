# Designer Page Architecture

## Overview
The `/react/designer` page is a visual UI design tool with a three-panel layout for creating and configuring user interfaces.

## Panel Structure

### UI Component Panel (Left - 15%)
**Purpose**: Component library and selection
- **Location**: Left side of the screen
- **Width**: 15% (collapsible to 0%)
- **Functionality**: 
  - Displays available UI components that can be added to the design
  - Acts as a component palette/library
  - Users can browse, search, and select components to drag onto the canvas
  - May include categorized component groups (e.g., Buttons, Forms, Layouts, Navigation)
- **State**: Controlled by `isLeftPanelCollapsed` state variable
- **Interaction**: Toggle button to collapse/expand

### UI Design Panel (Center - 70%)
**Purpose**: Main design canvas and workspace
- **Location**: Center of the screen
- **Width**: 70% (expands when side panels collapse)
- **Functionality**:
  - Primary workspace where users compose and arrange UI components
  - Visual canvas for designing user interfaces
  - Drop zone for components from the UI Component Panel
  - Supports component selection, positioning, and arrangement
  - Main focus area for the design work
- **Behavior**: 
  - Expands to 85% when one side panel is collapsed
  - Expands to 100% when both side panels are collapsed

### UI Property Panel (Right - 15%)
**Purpose**: Component configuration and properties editor
- **Location**: Right side of the screen
- **Width**: 15% (collapsible to 0%)
- **Functionality**:
  - Displays properties of currently selected component(s) in the design panel
  - Allows editing of component attributes (e.g., text, colors, spacing, styles)
  - Shows configuration options for the selected element
  - May include tabs for different property categories (Properties, Styles, Events)
- **State**: Controlled by `isRightPanelCollapsed` state variable
- **Interaction**: Toggle button to collapse/expand

## Workflow
1. User selects a component from the **UI Component Panel**
2. User places/arranges the component in the **UI Design Panel**
3. User configures the component using the **UI Property Panel**
4. Side panels can be collapsed to provide more space for the design canvas

## Technical Details
- Built with Next.js 14+ App Router
- Uses React Client Components (`'use client'`)
- Implements smooth transitions (300ms duration) for panel collapse/expand
- Responsive layout with Tailwind CSS
- Icons from `lucide-react` for UI controls
- Full-height viewport design (`h-screen`)

## Key Features
- Collapsible side panels for maximum workspace
- Smooth animations and transitions
- Accessible toggle buttons with proper ARIA labels
- Flexible width allocation that adjusts dynamically
- Clean, modern UI with proper borders and shadows
