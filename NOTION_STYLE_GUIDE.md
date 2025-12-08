# Notion Style Guide for StudyHub

## Design System

### Colors
- **Primary**: #2383E2 (Notion Blue)
- **Text Primary**: #37352F (Dark Gray)
- **Text Secondary**: #787774 (Medium Gray)
- **Background**: #FFFFFF (White)
- **Background Secondary**: #F7F6F3 (Light Beige)
- **Border**: #E9E9E7 (Light Gray)
- **Hover**: #F7F6F3

### Dark Mode
- **Background**: #191919
- **Card Background**: #252525
- **Border**: #3F3F3F
- **Text**: #E6E6E6
- **Text Secondary**: #9B9A97

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Apple Color Emoji', 'Arial', sans-serif
- **Font Sizes**:
  - Heading 1: 32px, font-weight: 700
  - Heading 2: 24px, font-weight: 600
  - Heading 3: 18px, font-weight: 600
  - Body: 14px, line-height: 1.5
  - Small: 13px

### Spacing
- **Page Padding**: 24px (desktop), 12px (mobile)
- **Card Padding**: 16px
- **Element Spacing**: 8px, 12px, 16px, 24px
- **Max Content Width**: 900px

### Components

#### Buttons
```css
.notion-button {
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 3px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
}

.notion-button-primary {
  background: #2383E2;
  color: #FFFFFF;
}
```

#### Cards
```css
.notion-card {
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 3px;
  padding: 16px;
}

.notion-card:hover {
  background: #F7F6F3;
}
```

#### Inputs
```css
.notion-input {
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 3px;
  padding: 8px 12px;
  font-size: 14px;
}

.notion-input:focus {
  border-color: #2383E2;
  box-shadow: 0 0 0 1px #2383E2;
}
```

### Shadows
- **Light**: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px
- **Medium**: rgba(15, 15, 15, 0.1) 0px 3px 6px
- **Heavy**: rgba(15, 15, 15, 0.2) 0px 9px 24px

### Border Radius
- **Small**: 3px
- **Medium**: 6px
- **Large**: 12px

### Transitions
- **Duration**: 150ms
- **Easing**: ease

## Implementation

### CSS Classes Available
- `.notion-card` - Card component
- `.notion-button` - Button component
- `.notion-button-primary` - Primary button
- `.notion-input` - Input field
- `.notion-text` - Body text
- `.notion-text-secondary` - Secondary text
- `.notion-heading` - Heading text
- `.notion-shadow` - Box shadow

### Usage Example
```tsx
<div className="notion-card">
  <h2 className="notion-heading text-2xl mb-4">Title</h2>
  <p className="notion-text mb-4">Content goes here</p>
  <button className="notion-button-primary">
    Click me
  </button>
</div>
```
