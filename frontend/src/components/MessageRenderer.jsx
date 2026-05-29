import React, { useState } from 'react';
import { Copy, CheckCircle, Code } from 'lucide-react';

const MessageRenderer = ({ content, theme = 'dark', onInsertCode = null }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const colors = {
    dark: {
      text: '#E0E0E0',
      codeBg: '#2D2D2D',
      codeText: '#D4D4D4',
      buttonHover: '#3E3E42',
      success: '#4EC9B0',
      border: '#3E3E42',
    },
    light: {
      text: '#2D2D2D',
      codeBg: '#F5F5F5',
      codeText: '#36454F',
      buttonHover: '#E0E0E0',
      success: '#16A34A',
      border: '#E0E0E0',
    },
  };

  const c = colors[theme];

  // Parse markdown-like content with code blocks
  const parseContent = (text) => {
    const parts = [];
    let lastIndex = 0;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  // Format markdown in text (bold, italic, lists)
  const formatText = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentIndex = 0;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Numbered lists (1. 2. etc.)
      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.+)/);
        if (match) {
          elements.push(
            <div 
              key={`${idx}-numbered`}
              style={{ 
                marginLeft: '1.5rem', 
                marginTop: '0.5rem',
                display: 'flex',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontWeight: '600', color: c.text, minWidth: '1.5rem' }}>
                {match[1]}.
              </span>
              <span>{formatInlineMarkdown(match[2])}</span>
            </div>
          );
          return;
        }
      }

      // Headings (#, ##, ###)
      if (/^#{1,6}\s/.test(trimmed)) {
        const levelMatch = trimmed.match(/^(#{1,6})\s(.+)$/);
        if (levelMatch) {
          const level = levelMatch[1].length;
          const content = levelMatch[2];
          const fontSize = level === 1 ? '1.5rem' : level === 2 ? '1.25rem' : '1.05rem';
          const marginTop = level === 1 ? '1rem' : '0.75rem';
          const lineHeight = level === 1 ? '1.2' : '1.3';
          elements.push(
            <div
              key={`${idx}-heading`}
              style={{
                marginTop,
                fontWeight: '700',
                fontSize,
                color: c.text,
                lineHeight,
                letterSpacing: '-0.01em'
              }}
            >
              {formatInlineMarkdown(content)}
            </div>
          );
          return;
        }
      }

      // Bullet points (- or *)
      if (/^[-*]\s/.test(trimmed)) {
        const content = trimmed.replace(/^[-*]\s/, '');
        elements.push(
          <div 
            key={`${idx}-bullet`}
            style={{ 
              marginLeft: '1.5rem', 
              marginTop: '0.5rem',
              display: 'flex',
              gap: '0.75rem'
            }}
          >
            <span style={{ color: c.success, fontWeight: '700' }}>•</span>
            <span>{formatInlineMarkdown(content)}</span>
          </div>
        );
        return;
      }

      // Empty lines
      if (!trimmed) {
        elements.push(<div key={`${idx}-empty`} style={{ height: '0.5rem' }} />);
        return;
      }

      // Regular text with inline formatting
      elements.push(
        <div key={`${idx}-text`} style={{ marginTop: '0.5rem' }}>
          {formatInlineMarkdown(trimmed)}
        </div>
      );
    });

    return elements;
  };

  // Format inline markdown (bold, italic, code)
  const formatInlineMarkdown = (text) => {
    const parts = [];
    let lastIndex = 0;

    // Pattern for bold **text**, italic *text*, and inline code `text`
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add formatted text
      if (match[1]) {
        // Bold
        parts.push(
          <strong key={`bold-${match.index}`} style={{ color: c.text, fontWeight: '700' }}>
            {match[1]}
          </strong>
        );
      } else if (match[2]) {
        // Italic
        parts.push(
          <em key={`italic-${match.index}`} style={{ color: c.text, fontStyle: 'italic' }}>
            {match[2]}
          </em>
        );
      } else if (match[3]) {
        // Inline code
        parts.push(
          <code 
            key={`code-${match.index}`}
            style={{
              backgroundColor: c.codeBg,
              padding: '0.2rem 0.4rem',
              borderRadius: '3px',
              fontFamily: "'Monaco', 'Menlo', monospace",
              fontSize: '0.85em',
              color: c.codeText,
              wordBreak: 'break-all'
            }}
          >
            {match[3]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length === 0 ? text : parts;
  };

  const escapeHtml = (value) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const tokenizeCode = (code) => {
    const rules = [
      {
        type: 'comment',
        regex: /\/\/.*$/gm,
      },
      {
        type: 'comment',
        regex: /\/\*[\s\S]*?\*\//g,
      },
      {
        type: 'string',
        regex: /(['"])(?:\\[\s\S]|(?!\1).)*\1/g,
      },
      {
        type: 'include',
        regex: /#include\s*<[^>]+>/g,
      },
      {
        type: 'keyword',
        regex: /\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|throw|catch|try|class|extends|constructor|static|import|from|export|default|async|await|typeof|instanceof|void|delete|public|private|protected|interface|enum|template|using|namespace|typedef)\b/g,
      },
      {
        type: 'type',
        regex: /\b(?:int|float|double|char|bool|void|size_t|long|short|unsigned|signed)\b/g,
      },
      {
        type: 'builtin',
        regex: /\b(?:true|false|null|undefined|std|cout|cin|endl|string|vector|map|unordered_map|set|unordered_set)\b/g,
      },
      {
        type: 'number',
        regex: /\b\d+(?:\.\d+)?\b/g,
      },
      {
        type: 'function',
        regex: /\b([a-zA-Z_][\w]*)\s*(?=\()/g,
      },
    ];

    const tokens = [];
    let remaining = code;

    while (remaining.length > 0) {
      let earliestMatch = null;
      let earliestRule = null;

      rules.forEach((rule) => {
        rule.regex.lastIndex = 0;
        const match = rule.regex.exec(remaining);
        if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
          earliestMatch = match;
          earliestRule = rule;
        }
      });

      if (!earliestMatch) {
        tokens.push({ type: 'plain', content: remaining });
        break;
      }

      if (earliestMatch.index > 0) {
        tokens.push({ type: 'plain', content: remaining.slice(0, earliestMatch.index) });
      }

      tokens.push({ type: earliestRule.type, content: earliestMatch[0] });
      remaining = remaining.slice(earliestMatch.index + earliestMatch[0].length);
    }

    return tokens;
  };

  const getTokenStyle = (type) => {
    switch (type) {
      case 'comment':
        return { color: '#6A9955' };
      case 'string':
        return { color: '#CE9178' };
      case 'include':
        return { color: '#C586C0', fontWeight: 700 };
      case 'keyword':
        return { color: '#569CD6', fontWeight: 700 };
      case 'type':
        return { color: '#4EC9B0', fontWeight: 600 };
      case 'builtin':
        return { color: '#9CDCFE' };
      case 'number':
        return { color: '#B5CEA8' };
      case 'function':
        return { color: '#DCDCAA' };
      default:
        return { color: c.codeText };
    }
  };

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parts = parseContent(content);

  return (
    <div style={{ color: c.text, lineHeight: '1.6' }}>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <div
              key={index}
              style={{
                backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F3F4F6',
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                marginTop: '0.75rem',
                marginBottom: '0.75rem',
                overflow: 'hidden',
                borderLeft: '4px solid #007ACC',
              }}
            >
              {/* Code Header */}
              <div
                style={{
                  backgroundColor: theme === 'dark' ? '#252526' : '#E5E7EB',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: c.text,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{part.language}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onInsertCode && (
                    <button
                      onClick={() => onInsertCode(part.content, part.language)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        color: c.text,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = c.buttonHover)
                      }
                      onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                      title="Insert into editor"
                    >
                      <Code size={12} />
                      Insert
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyCode(part.content, index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '3px',
                      color: copiedIndex === index ? c.success : c.text,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = c.buttonHover)
                    }
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    title="Copy code"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle size={12} />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <pre
                style={{
                  padding: '0.75rem',
                  margin: 0,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  color: c.codeText,
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  lineHeight: '1.5',
                  maxHeight: '300px',
                  backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                }}
              >
                <code>
                  {tokenizeCode(part.content).map((token, tokenIndex) => (
                    <span key={tokenIndex} style={getTokenStyle(token.type)}>
                      {token.content}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          );
        }

        return (
          <div key={index} style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
            {formatText(part.content)}
          </div>
        );
      })}
    </div>
  );
};

export default MessageRenderer;
