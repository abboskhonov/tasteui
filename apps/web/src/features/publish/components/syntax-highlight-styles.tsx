export function SyntaxHighlightStyles() {
  return (
    <style>{`
      :root {
        --code-text: #1e293b;
        --code-comment: #64748b;
        --code-punctuation: #475569;
        --code-property: #be185d;
        --code-string: #15803d;
        --code-operator: #0f766e;
        --code-keyword: #1d4ed8;
        --code-function: #b45309;
        --code-variable: #c2410c;
      }

      .dark {
        --code-text: #e2e8f0;
        --code-comment: #64748b;
        --code-punctuation: #94a3b8;
        --code-property: #f472b6;
        --code-string: #86efac;
        --code-operator: #67e8f9;
        --code-keyword: #93c5fd;
        --code-function: #fbbf24;
        --code-variable: #fdba74;
      }

      code[class*="language-"],
      pre[class*="language-"] {
        color: var(--code-text);
        background: none;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.875rem;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        line-height: 1.5;
        tab-size: 2;
        hyphens: none;
      }

      .token.comment,
      .token.prolog,
      .token.doctype,
      .token.cdata {
        color: var(--code-comment);
      }

      .token.punctuation {
        color: var(--code-punctuation);
      }

      .token.namespace {
        opacity: .7;
      }

      .token.property,
      .token.tag,
      .token.boolean,
      .token.number,
      .token.constant,
      .token.symbol,
      .token.deleted {
        color: var(--code-property);
      }

      .token.selector,
      .token.attr-name,
      .token.string,
      .token.char,
      .token.builtin,
      .token.inserted {
        color: var(--code-string);
      }

      .token.operator,
      .token.entity,
      .token.url,
      .language-css .token.string,
      .style .token.string {
        color: var(--code-operator);
      }

      .token.atrule,
      .token.attr-value,
      .token.keyword {
        color: var(--code-keyword);
      }

      .token.function,
      .token.class-name {
        color: var(--code-function);
      }

      .token.regex,
      .token.important,
      .token.variable {
        color: var(--code-variable);
      }

      .token.important,
      .token.bold {
        font-weight: bold;
      }

      .token.italic {
        font-style: italic;
      }

      .token.entity {
        cursor: help;
      }
    `}</style>
  )
}
