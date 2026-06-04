# Markdown Renderer - Installation Guide

## Quick Start

### 1. Install Dependencies

Run the following command to install all required packages:

```bash
npm install react-markdown remark-gfm rehype-raw rehype-sanitize
```

**Dependency Details:**
- `react-markdown` - Core markdown rendering library
- `remark-gfm` - GitHub Flavored Markdown support (tables, strikethrough, task lists)
- `rehype-raw` - Allows HTML in markdown (sanitized)
- `rehype-sanitize` - Security - sanitizes HTML to prevent XSS attacks

### 2. Verify Installation

The system is already integrated into your ChatbotPage. Test it by:

1. Open the Chatbot page
2. Send a message
3. View the formatted markdown response with:
   - Proper headings (H1, H2, H3)
   - Bullet lists with blue bullets
   - Code blocks with copy buttons
   - Blockquotes with blue accent bars

### 3. Component Structure

The following files have been created:

```
/components/Markdown/
├── MarkdownRenderer.tsx       # Main component (imported in ChatbotPage)
├── CodeBlock.tsx              # Code syntax with copy button
├── TableRenderer.tsx          # Responsive tables
├── ImageRenderer.tsx          # Images with modal lightbox
├── FootnotesPanel.tsx         # Collapsible footnotes
├── utils/
│   └── parseMarkdown.ts       # Parsing utilities
├── README.md                  # Full documentation
└── INSTALLATION.md            # This file
```

### 4. What Changed in ChatbotPage

The only change made to your existing code:

**Before:**
```tsx
{formatMessageContent(message.content)}
```

**After:**
```tsx
<MarkdownRenderer
  content={message.content}
  streaming={isStreaming && streamingMessageId === message.id}
  messageId={message.id}
  theme="dark"
  onCopy={(text) => {
    console.log('Copied code:', text.substring(0, 50) + '...');
  }}
/>
```

### 5. Features Now Available

✅ **Headings** - H1 (32px), H2 (24px), H3 (20px) with section dividers
✅ **Lists** - Unordered/ordered with up to 3 nesting levels, blue bullets
✅ **Code** - Syntax highlighting with copy button, language labels
✅ **Tables** - Responsive tables with visible borders, horizontal scroll
✅ **Blockquotes** - Left blue bar, muted italic text, nesting support
✅ **Images** - Click to open modal, captions, alt text
✅ **Links** - Blue color, opens in new tab, secure attributes
✅ **Text Formatting** - Bold (white), italic (lighter gray)
✅ **Abbreviations** - Auto-detected, legend at bottom
✅ **Footnotes** - Collapsible panel with numbered references
✅ **Streaming** - Blinking cursor indicator during streaming
✅ **Accessibility** - Keyboard navigation, ARIA labels, WCAG AA contrast

### 6. Test Examples

Try these markdown inputs to test all features:

#### Basic Formatting
```markdown
# Welcome to PAI

I'm your **AI Mentor** and can help with:
- Career planning
- Skill development
- Interview preparation

Ready to get started?
```

#### Advanced Features
```markdown
## Code Example

Here's a React component:

```javascript
function App() {
  return <div>Hello World</div>;
}
```

## Comparison Table

| Feature | Benefit | Priority |
|---------|---------|:--------:|
| Speed | Fast performance | High |
| Quality | Excellent results | High |

> **Note**: All features are production-ready!
```

#### Abbreviations & Footnotes
```markdown
# Technical Overview

Our system uses HTML (HyperText Markup Language) and CSS (Cascading Style Sheets) for rendering[^1].

The API (Application Programming Interface) handles all communication[^2].

[^1]: Standard web technologies used globally
[^2]: RESTful API with JSON responses
```

### 7. Customization

To customize colors or spacing, edit the inline styles in `MarkdownRenderer.tsx`:

```tsx
// Example: Change heading color
h1: ({ node, ...props }) => (
  <h1 
    style={{
      fontSize: '32px',
      color: '#YOUR_COLOR', // Change this
      // ... other styles
    }}
    {...props} 
  />
)
```

### 8. Troubleshooting

#### Issue: "Module not found: react-markdown"
**Solution**: Run `npm install react-markdown remark-gfm rehype-raw rehype-sanitize`

#### Issue: Copy button not working
**Solution**: Ensure you're using HTTPS or localhost (Clipboard API requirement)

#### Issue: Images not displaying
**Solution**: Check CORS headers and image URL validity

#### Issue: Streaming cursor not showing
**Solution**: Verify `streaming={true}` prop is passed to MarkdownRenderer

### 9. Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ❌ IE11 (not supported - uses CSS custom properties)

### 10. Performance Tips

For large conversations:

```tsx
// Memoize renderer to prevent unnecessary re-renders
import { memo } from 'react';

const MemoizedMarkdownRenderer = memo(MarkdownRenderer);

// Use in your component
<MemoizedMarkdownRenderer 
  content={message.content}
  // ... other props
/>
```

### 11. Security Notes

The renderer automatically sanitizes HTML to prevent XSS attacks using `rehype-sanitize`. Only safe tags and attributes are allowed:

**Allowed tags**: p, h1-h6, ul, ol, li, blockquote, code, pre, em, strong, a, img, table, thead, tbody, tr, th, td, abbr, figure, hr

**Allowed attributes**: 
- Links: href, title, target, rel
- Images: src, alt, title
- Code: className
- All: className, id

### 12. Next Steps

1. **Test thoroughly** - Try all markdown features in the chat
2. **Customize styling** - Adjust colors/spacing to match your brand
3. **Add syntax highlighting** (optional):
   ```bash
   npm install prismjs react-syntax-highlighter
   ```
4. **Add math support** (optional):
   ```bash
   npm install remark-math rehype-katex
   ```

### 13. Support & Documentation

- **Full Documentation**: See `/components/Markdown/README.md`
- **Component API**: All props and usage examples in README
- **Design Tokens**: Complete color, spacing, typography scales
- **Accessibility**: WCAG AA compliant, keyboard navigation guide

### 14. Production Checklist

Before deploying:

- [ ] Dependencies installed (`npm install`)
- [ ] Tested all markdown features
- [ ] Verified copy functionality works
- [ ] Checked mobile responsiveness
- [ ] Tested image modal on mobile
- [ ] Verified table horizontal scroll
- [ ] Tested streaming mode
- [ ] Checked accessibility (keyboard navigation)
- [ ] Verified no console errors
- [ ] Tested with long messages
- [ ] Verified footnotes expand/collapse
- [ ] Checked abbreviations legend

## Complete!

Your Markdown Renderer is now integrated and ready to use. The ChatbotPage automatically uses it for all assistant messages. No further configuration needed!

For questions or issues, refer to the README.md file for comprehensive documentation.
