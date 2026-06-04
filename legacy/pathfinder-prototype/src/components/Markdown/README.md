# Markdown Renderer System - Developer Handoff

## Installation

Install required dependencies:

```bash
npm install react-markdown remark-gfm rehype-raw rehype-sanitize lucide-react
```

## Quick Start

```tsx
import { MarkdownRenderer } from './components/Markdown/MarkdownRenderer';

function ChatMessage({ message }) {
  return (
    <MarkdownRenderer
      content={message.content}
      streaming={message.isStreaming}
      messageId={message.id}
      onCopy={(text) => console.log('Copied:', text)}
    />
  );
}
```

## Component API

### MarkdownRenderer

Main component for rendering markdown content.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `content` | `string` | ✓ | - | Markdown content to render |
| `theme` | `'dark' \| 'light'` | ✗ | `'dark'` | Theme variant |
| `streaming` | `boolean` | ✗ | `false` | Show streaming cursor indicator |
| `messageId` | `string` | ✗ | - | Unique message identifier for footnote anchors |
| `onCopy` | `(text: string) => void` | ✗ | - | Callback when code is copied |

**Example:**

```tsx
<MarkdownRenderer
  content="# Hello\n\nThis is **bold** text."
  theme="dark"
  streaming={false}
  messageId="msg-123"
  onCopy={(text) => toast.success('Copied!')}
/>
```

## Supported Markdown Features

### 1. Headings

- **H1** (`#`): Largest, 32px, with section divider
- **H2** (`##`): Major section, 24px, with section divider
- **H3** (`###`): Subsection, 20px, no divider

All headings have proper spacing and distinct visual hierarchy.

### 2. Lists

**Unordered lists:**
```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested
    - Third level
```

**Ordered lists:**
```markdown
1. First item
2. Second item
   1. Nested numbered
   2. Another
```

Features:
- Custom bullets (●, ○, ▪) for up to 3 nesting levels
- Blue accent color (#5B9FFF) for bullets/numbers
- Progressive indentation
- Proper spacing

### 3. Code

**Inline code:**
```markdown
Use `const value = 42` for inline code
```

**Fenced code blocks:**
````markdown
```javascript
function hello() {
  return "world";
}
```
````

Features:
- Language label display
- Persistent copy button with success feedback
- Dark contrast panel (#1A1A1A background)
- Horizontal scroll for long lines
- Monospace font (Menlo, Monaco, Courier New)

### 4. Blockquotes

```markdown
> This is a blockquote
> with multiple lines
> 
> > Nested quote
```

Features:
- Left blue accent bar (#5B9FFF)
- Muted italic text
- Nested blockquote support
- Rounded corners

### 5. Tables

```markdown
| Name | Age | Role |
|------|:---:|-----:|
| Alice | 30 | Dev |
| Bob | 25 | Designer |
```

Features:
- Visible white/gray borders on dark background
- Header row with darker background (#2B2B2B)
- Column alignment (left/center/right)
- Horizontal scroll on mobile
- Hover effects on rows

### 6. Images

```markdown
![Alt text](https://example.com/image.jpg "Image title")
```

Features:
- Click to open modal (lightbox)
- Caption from alt or title text
- Responsive sizing
- Keyboard accessible (Enter/Space to open)
- Close with X button or click outside

### 7. Abbreviations

Automatically detected from pattern: `ABBR (Full Text)`

Example:
```markdown
HTML (HyperText Markup Language) is used for structure.
CSS (Cascading Style Sheets) handles styling.
```

Features:
- Auto-detection of abbreviations
- Abbreviations legend rendered at message bottom
- Blue accent color for abbreviation terms

### 8. Footnotes

```markdown
Text with footnote[^1]

[^1]: This is the footnote text
```

Features:
- Collapsible panel at message bottom
- Shows count: "Footnotes (3)"
- Numbered circles with blue accent
- Expand/collapse with chevron icon
- Unique IDs per message

### 9. Links

```markdown
[Link text](https://example.com)
```

Features:
- Blue color (#5B9FFF)
- Underline on hover
- Opens in new tab (target="_blank")
- Secure rel attributes (noopener noreferrer)

### 10. Text Formatting

```markdown
**Bold text** or __bold__
*Italic text* or _italic_
```

Features:
- Bold: White color (#FFFFFF), weight 600
- Italic: Lighter color (#D1D1D1)

## Design Tokens

### Colors

```css
--md-bg-primary: #1C1C1C      /* Main background */
--md-bg-secondary: #232323    /* Panel background */
--md-bg-tertiary: #262626     /* Hover states */
--md-bg-elevated: #2B2B2B     /* Elevated surfaces */
--md-bg-code: #1A1A1A         /* Code blocks */

--md-text-primary: #F7F7F7    /* Primary text */
--md-text-secondary: #D1D1D1  /* Secondary text */
--md-text-muted: #A0A0A0      /* Muted text */
--md-text-accent: #FFFFFF     /* Headings */

--md-accent-blue: #5B9FFF     /* Interactive elements */
--md-accent-success: #4CAF50  /* Success states */
```

### Spacing Scale

```css
--md-space-xs: 4px
--md-space-sm: 8px
--md-space-md: 12px
--md-space-lg: 16px
--md-space-xl: 24px
--md-space-2xl: 32px
--md-space-3xl: 48px
```

### Typography

```css
--md-font-xs: 12px
--md-font-sm: 13px
--md-font-base: 14px
--md-font-lg: 16px
--md-font-xl: 20px
--md-font-2xl: 24px
--md-font-3xl: 32px
```

### Border Radius

```css
--md-radius-sm: 4px
--md-radius-md: 6px
--md-radius-lg: 8px
--md-radius-xl: 12px
```

## Component Architecture

```
components/Markdown/
├── MarkdownRenderer.tsx      # Main renderer component
├── CodeBlock.tsx              # Code blocks with copy button
├── TableRenderer.tsx          # Responsive tables
├── ImageRenderer.tsx          # Images with modal
├── FootnotesPanel.tsx         # Collapsible footnotes
├── utils/
│   └── parseMarkdown.ts       # Parsing utilities
└── README.md                  # This file
```

## Security

### Input Sanitization

The renderer uses `rehype-sanitize` to prevent XSS attacks:

```tsx
import rehypeSanitize from 'rehype-sanitize';

// Whitelist safe tags and attributes
const sanitizeSchema = {
  tagNames: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 
             'code', 'pre', 'em', 'strong', 'a', 'img', 'table', 
             'thead', 'tbody', 'tr', 'th', 'td', 'abbr', 'figure'],
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    abbr: ['title'],
    code: ['className']
  }
};
```

**Important:**
- All HTML is sanitized before rendering
- External links open in new tabs with `rel="noopener noreferrer"`
- Image sources should be validated server-side
- No `dangerouslySetInnerHTML` is used

## Streaming Support

### Progressive Rendering

When `streaming={true}`:
1. Shows animated cursor indicator (blinking blue bar)
2. Content updates progressively
3. No layout jumps during updates

**Best practices:**
- Debounce streaming updates to 100-200ms
- Use unique `messageId` for each message
- Handle partial markdown gracefully

**Example:**

```tsx
function StreamingMessage({ content, isComplete }) {
  return (
    <MarkdownRenderer
      content={content}
      streaming={!isComplete}
      messageId={`msg-${Date.now()}`}
    />
  );
}
```

## Accessibility

✓ Keyboard navigation for all interactive elements
✓ Focus indicators (blue outline)
✓ ARIA labels and roles
✓ Semantic HTML (proper heading hierarchy)
✓ Alt text for images
✓ Color contrast meets WCAG AA standards
✓ Screen reader friendly

**Keyboard shortcuts:**
- `Enter`/`Space`: Open image modal, toggle footnotes
- `Escape`: Close modals (implement in parent)
- `Tab`: Navigate interactive elements

## Performance

### Optimizations

1. **Memoization**: Use `React.memo()` for frequently updated messages
2. **Code splitting**: Import components lazily if needed
3. **Image lazy loading**: Supported via native `loading="lazy"`
4. **Virtual scrolling**: For long message lists (implement in parent)

**Example with memoization:**

```tsx
const MemoizedRenderer = React.memo(MarkdownRenderer);

function Message({ content, ...props }) {
  return <MemoizedRenderer content={content} {...props} />;
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Clipboard API for copy functionality
- CSS custom properties (IE11 not supported)
- ES6+ JavaScript

## Customization

### Override Styles

All components use inline styles, so you can override with className:

```tsx
<MarkdownRenderer
  content={content}
  className="custom-markdown"
/>

<style>{`
  .custom-markdown .md-h1 {
    color: #YOUR_COLOR !important;
  }
`}</style>
```

### Custom Components

Extend the renderer with custom components:

```tsx
// In MarkdownRenderer.tsx, add to components prop:
components={{
  // ... existing components
  
  // Custom component for task lists
  input: ({ node, checked, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      disabled
      {...props}
    />
  )
}}
```

## Known Limitations

1. **Syntax highlighting**: Not included by default. To add:
   ```bash
   npm install prismjs react-syntax-highlighter
   ```

2. **Math equations**: Not supported. To add:
   ```bash
   npm install remark-math rehype-katex
   ```

3. **Task lists**: Checkboxes render but are not interactive

4. **Emoji**: Uses system emoji (no custom emoji picker)

## Troubleshooting

### Issue: Code not copying

**Solution**: Ensure HTTPS or localhost (Clipboard API requirement)

### Issue: Images not loading

**Solution**: Check CORS headers and validate image URLs

### Issue: Tables not scrolling on mobile

**Solution**: Ensure parent has `overflow-x: auto`

### Issue: Footnotes not linking

**Solution**: Provide unique `messageId` prop

## Examples

### Complete Chat Integration

```tsx
import { useState } from 'react';
import { MarkdownRenderer } from './components/Markdown/MarkdownRenderer';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [streamingId, setStreamingId] = useState(null);

  return (
    <div className="chat-container">
      {messages.map((msg) => (
        <div key={msg.id} className="message">
          <MarkdownRenderer
            content={msg.content}
            streaming={streamingId === msg.id}
            messageId={msg.id}
            onCopy={(text) => {
              console.log('Copied:', text);
              toast.success('Code copied!');
            }}
          />
        </div>
      ))}
    </div>
  );
}
```

### Complex Markdown Example

```markdown
# Full-Stack Development Guide

This guide covers **everything** you need to know.

## Prerequisites

Before starting, ensure you understand:

1. HTML (HyperText Markup Language) basics
2. CSS (Cascading Style Sheets) fundamentals
3. JavaScript ES6+ syntax

### Installation

Install dependencies:

```bash
npm install react react-dom
npm install -D typescript @types/react
```

## Core Concepts

> **Important**: Master the fundamentals before moving to frameworks.
>
> > Practice makes perfect!

### Tech Stack Comparison

| Framework | Language | Difficulty | Performance |
|-----------|:--------:|:----------:|:-----------:|
| React | JavaScript | ⭐⭐ | High |
| Vue | JavaScript | ⭐ | High |
| Angular | TypeScript | ⭐⭐⭐ | High |

### Code Example

```javascript
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

Check out the [official docs](https://react.dev) for more.

![React Logo](https://example.com/react.png "React Framework")

---

## References

Read more about modern web development[^1].

[^1]: "Modern Web Development Best Practices", 2024. Available at: https://webdev.guide
```

## Support

For issues or questions:
- Check this documentation
- Review component source code
- Test with provided examples
- Verify all dependencies are installed

## License

Part of PAI (Pathfinder AI) project. All rights reserved.
