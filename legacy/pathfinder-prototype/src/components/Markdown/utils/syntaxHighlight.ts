/**
 * Lightweight syntax highlighting utility
 * Color tokens:
 * - Keyword: #F97316 (orange)
 * - String: #34D399 (green)
 * - Type/Identifier: #60A5FA (blue)
 * - Comment: #9CA3AF (gray)
 * - Number: #A78BFA (purple)
 */

interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'type' | 'function' | 'operator' | 'text';
  value: string;
}

const KEYWORDS = new Set([
  // JavaScript/TypeScript
  'const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new',
  'class', 'extends', 'implements', 'interface', 'type', 'enum', 'public', 'private', 'protected',
  'static', 'readonly', 'export', 'import', 'from', 'default', 'as', 'namespace',
  // Python
  'def', 'lambda', 'pass', 'yield', 'with', 'assert', 'del', 'global', 'nonlocal',
  'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is',
  // Other common
  'null', 'undefined', 'this', 'super', 'void', 'typeof', 'instanceof',
]);

const TYPES = new Set([
  'string', 'number', 'boolean', 'object', 'array', 'void', 'any', 'unknown', 'never',
  'int', 'float', 'double', 'char', 'bool', 'String', 'Number', 'Boolean', 'Array', 'Object',
  'Promise', 'Map', 'Set', 'Date', 'RegExp', 'Error',
]);

/**
 * Simple tokenizer for common languages
 */
export function tokenize(code: string, language: string = ''): Token[] {
  const tokens: Token[] = [];
  const lang = language.toLowerCase();
  
  // Simple regex-based tokenizer
  const patterns = [
    // Single-line comments
    { regex: /(\/\/.*|#.*)/g, type: 'comment' as const },
    // Multi-line comments
    { regex: /(\/\*[\s\S]*?\*\/)/g, type: 'comment' as const },
    // Strings (double and single quotes)
    { regex: /(["'`](?:\\.|[^\\])*?["'`])/g, type: 'string' as const },
    // Numbers
    { regex: /\b(\d+\.?\d*)\b/g, type: 'number' as const },
  ];

  let remaining = code;
  const segments: Array<{ start: number; end: number; token: Token }> = [];

  // Extract comments, strings, and numbers first
  patterns.forEach(({ regex, type }) => {
    const matches = [...remaining.matchAll(regex)];
    matches.forEach((match) => {
      if (match.index !== undefined) {
        segments.push({
          start: match.index,
          end: match.index + match[0].length,
          token: { type, value: match[0] }
        });
      }
    });
  });

  // Sort segments by position
  segments.sort((a, b) => a.start - b.start);

  // Process remaining text (keywords, types, etc.)
  let lastEnd = 0;
  segments.forEach((seg) => {
    if (seg.start > lastEnd) {
      // Process text between segments
      const text = remaining.slice(lastEnd, seg.start);
      tokens.push(...tokenizeText(text));
    }
    tokens.push(seg.token);
    lastEnd = seg.end;
  });

  // Process remaining text
  if (lastEnd < remaining.length) {
    tokens.push(...tokenizeText(remaining.slice(lastEnd)));
  }

  return tokens;
}

function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  
  // Split by word boundaries but preserve whitespace and operators
  const wordRegex = /(\w+|\s+|[^\w\s]+)/g;
  const matches = text.matchAll(wordRegex);
  
  for (const match of matches) {
    const word = match[0];
    
    if (/^\s+$/.test(word)) {
      tokens.push({ type: 'text', value: word });
    } else if (KEYWORDS.has(word)) {
      tokens.push({ type: 'keyword', value: word });
    } else if (TYPES.has(word)) {
      tokens.push({ type: 'type', value: word });
    } else if (/^[A-Z][a-zA-Z0-9]*$/.test(word)) {
      // PascalCase - likely a type/class
      tokens.push({ type: 'type', value: word });
    } else if (/^[a-z_$][a-zA-Z0-9_$]*$/.test(word) && tokens.length > 0) {
      // Check if followed by '(' - likely a function
      const nextChar = text[match.index! + word.length];
      if (nextChar === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
    } else if (/^[+\-*/%=<>!&|^~?:;,.()\[\]{}]/.test(word)) {
      tokens.push({ type: 'operator', value: word });
    } else {
      tokens.push({ type: 'text', value: word });
    }
  }
  
  return tokens;
}

/**
 * Convert tokens to HTML with syntax highlighting
 */
export function tokensToHtml(tokens: Token[]): string {
  return tokens.map(token => {
    const escaped = escapeHtml(token.value);
    
    switch (token.type) {
      case 'keyword':
        return `<span style="color: #F97316;">${escaped}</span>`;
      case 'string':
        return `<span style="color: #34D399;">${escaped}</span>`;
      case 'comment':
        return `<span style="color: #9CA3AF; font-style: italic;">${escaped}</span>`;
      case 'number':
        return `<span style="color: #A78BFA;">${escaped}</span>`;
      case 'type':
        return `<span style="color: #60A5FA;">${escaped}</span>`;
      case 'function':
        return `<span style="color: #60A5FA;">${escaped}</span>`;
      case 'operator':
        return `<span style="color: #D1D1D1;">${escaped}</span>`;
      default:
        return escaped;
    }
  }).join('');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Highlight code with syntax colors
 */
export function highlightCode(code: string, language: string = ''): string {
  const tokens = tokenize(code, language);
  return tokensToHtml(tokens);
}
