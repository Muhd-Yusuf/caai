import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── RDC-IHRA format detection & verdict extraction ───────────────────────────

function isRDCIHRAFormat(content: string): boolean {
  return /Application of IHRA|Applying IHRA|IHRA Rules? Violated|No IHRA rules/i.test(content);
}

type Verdict = 'antisemitic' | 'not antisemitic' | 'potentially antisemitic' | 'inconclusive';

function extractVerdict(content: string): Verdict {
  // Find the Conclusion section
  const conclusionMatch = content.match(/Conclusion[:\s]*([\s\S]+)/i);
  if (!conclusionMatch) return 'inconclusive';

  const conclusion = conclusionMatch[1].toLowerCase();

  // Order matters: check "not antisemitic" before "antisemitic"
  if (/is not antisemitic|does not violate|not antisemitic/.test(conclusion)) {
    return 'not antisemitic';
  }
  if (/potentially antisemitic/.test(conclusion)) {
    return 'potentially antisemitic';
  }
  if (/antisemitic|violates rdc-ihra|can be considered antisemitic/.test(conclusion)) {
    return 'antisemitic';
  }

  return 'inconclusive';
}

const VERDICT_STYLES: Record<Verdict, { bg: string; text: string; label: string }> = {
  'antisemitic': {
    bg: 'bg-red-600',
    text: 'text-white',
    label: 'Antisemitic',
  },
  'potentially antisemitic': {
    bg: 'bg-orange-500',
    text: 'text-white',
    label: 'Potentially Antisemitic',
  },
  'not antisemitic': {
    bg: 'bg-green-600',
    text: 'text-white',
    label: 'Not Antisemitic',
  },
  'inconclusive': {
    bg: 'bg-gray-500',
    text: 'text-white',
    label: 'Inconclusive',
  },
};

// ─── Legacy structured-field format (kept for backward compatibility) ──────────

interface ParsedSection {
  type: 'classification' | 'confidence' | 'category' | 'severity' | 'explanation' | 'recommendation' | 'text';
  label: string;
  value: string;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  none: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
};

const CLASSIFICATION_COLORS: Record<string, { bg: string; text: string }> = {
  antisemitic: { bg: 'bg-red-600', text: 'text-white' },
  'potentially antisemitic': { bg: 'bg-orange-500', text: 'text-white' },
  'not antisemitic': { bg: 'bg-green-600', text: 'text-white' },
  inconclusive: { bg: 'bg-gray-500', text: 'text-white' },
};

function addIHRASpacing(text: string): string {
  return text.replace(
    /(?<!\n\n)(^|\n)((?:\*{0,2})(?:IHRA\s+(?:Category|Rule|Example|Violation)|Category\s*\d|Example\s*\d|(?:Category|Rule)\s*#?\s*\d))/gim,
    '$1\n$2'
  );
}

function parseStructuredContent(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = content.split('\n');
  let remainingText: string[] = [];
  let i = 0;

  const fieldPatterns: Array<{ regex: RegExp; type: ParsedSection['type']; label: string }> = [
    { regex: /^\*{0,2}classification\*{0,2}\s*:\s*(.+)/i, type: 'classification', label: 'Classification' },
    { regex: /^\*{0,2}confidence\s*(?:level|score)?\*{0,2}\s*:\s*(.+)/i, type: 'confidence', label: 'Confidence' },
    { regex: /^\*{0,2}(?:ihra\s+)?category\*{0,2}\s*:\s*(.+)/i, type: 'category', label: 'IHRA Category' },
    { regex: /^\*{0,2}severity\s*(?:level)?\*{0,2}\s*:\s*(.+)/i, type: 'severity', label: 'Severity' },
    { regex: /^\*{0,2}recommendation\*{0,2}\s*:\s*(.+)/i, type: 'recommendation', label: 'Recommendation' },
  ];

  while (i < lines.length) {
    const trimmedLine = lines[i].trim();
    let matched = false;

    for (const pattern of fieldPatterns) {
      const match = trimmedLine.match(pattern.regex);
      if (match) {
        if (remainingText.length > 0) {
          const text = remainingText.join('\n').trim();
          if (text) {
            sections.push({ type: 'text', label: '', value: addIHRASpacing(text) });
          }
          remainingText = [];
        }
        sections.push({
          type: pattern.type,
          label: pattern.label,
          value: match[1].replace(/\*{1,2}/g, '').trim(),
        });
        matched = true;
        break;
      }
    }

    if (!matched) {
      remainingText.push(lines[i]);
    }

    i++;
  }

  if (remainingText.length > 0) {
    const text = remainingText.join('\n').trim();
    if (text) {
      sections.push({ type: 'text', label: '', value: addIHRASpacing(text) });
    }
  }

  return sections;
}

function getSeverityStyle(value: string) {
  const lower = value.toLowerCase();
  for (const [key, style] of Object.entries(SEVERITY_COLORS)) {
    if (lower.includes(key)) return style;
  }
  return SEVERITY_COLORS.medium;
}

function getClassificationStyle(value: string) {
  const lower = value.toLowerCase();
  for (const [key, style] of Object.entries(CLASSIFICATION_COLORS)) {
    if (lower.includes(key)) return style;
  }
  return { bg: 'bg-gray-600', text: 'text-white' };
}

function getConfidenceColor(value: string): string {
  const num = parseInt(value);
  if (!isNaN(num)) {
    if (num >= 80) return 'text-red-600';
    if (num >= 50) return 'text-orange-600';
    return 'text-green-600';
  }
  const lower = value.toLowerCase();
  if (lower.includes('high')) return 'text-red-600';
  if (lower.includes('medium') || lower.includes('moderate')) return 'text-orange-600';
  return 'text-green-600';
}

// ─── Shared markdown prose classes ────────────────────────────────────────────

const proseClasses = `prose prose-sm max-w-none font-sans
  prose-p:my-1.5 prose-p:leading-relaxed
  prose-headings:mt-3 prose-headings:mb-1 prose-headings:font-semibold
  prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
  prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
  prose-strong:font-semibold
  prose-code:bg-gray-300 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
  prose-pre:bg-gray-700 prose-pre:text-gray-100 prose-pre:rounded-md prose-pre:my-2 prose-pre:p-3
  prose-a:text-blue-600 prose-a:underline
  prose-blockquote:border-l-4 prose-blockquote:border-gray-400 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:my-2
  text-gray-800`;

// ─── Main component ────────────────────────────────────────────────────────────

const StructuredOutput: React.FC<{ content: string }> = ({ content }) => {
  // ── RDC-IHRA format ──
  if (isRDCIHRAFormat(content)) {
    const verdict = extractVerdict(content);
    const style = VERDICT_STYLES[verdict];

    // Normalize single * emphasis to ** bold for IHRA output
    // The AI sometimes outputs *Heading:* instead of **Heading:**
    const normalizedContent = content
      .replace(/\*\*(.+?)\*\*/g, '!!BOLD!!$1!!ENDBOLD!!')  // protect existing **
      .replace(/\*([^*]+?)\*/g, '!!BOLD!!$1!!ENDBOLD!!')   // promote single * to bold
      .replace(/!!BOLD!!/g, '**').replace(/!!ENDBOLD!!/g, '**');

    return (
      <div className="space-y-3">
        {/* Verdict badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Verdict</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>

        {/* Full analysis rendered as markdown */}
        <div className={proseClasses}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {normalizedContent}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  // ── Legacy field-label format ──
  const sections = parseStructuredContent(content);
  const hasStructuredFields = sections.some(s => s.type !== 'text');

  if (!hasStructuredFields) {
    return (
      <div className={proseClasses}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => {
        switch (section.type) {
          case 'classification': {
            const style = getClassificationStyle(section.value);
            return (
              <div key={idx} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section.label}</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                  {section.value}
                </span>
              </div>
            );
          }

          case 'severity': {
            const style = getSeverityStyle(section.value);
            return (
              <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${style.bg} ${style.border}`}>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section.label}</span>
                <span className={`text-sm font-semibold ${style.text}`}>{section.value}</span>
              </div>
            );
          }

          case 'confidence': {
            const color = getConfidenceColor(section.value);
            return (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section.label}</span>
                <span className={`text-sm font-bold ${color}`}>{section.value}</span>
              </div>
            );
          }

          case 'category':
            return (
              <div key={idx} className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section.label}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {section.value}
                </span>
              </div>
            );

          case 'recommendation':
            return (
              <div key={idx} className="mt-2 px-3 py-2 rounded-md bg-blue-50 border border-blue-200">
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide block mb-0.5">{section.label}</span>
                <span className="text-sm text-blue-900">{section.value}</span>
              </div>
            );

          case 'text':
            return (
              <div key={idx} className={`mt-2 ${proseClasses}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section.value}
                </ReactMarkdown>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default StructuredOutput;
