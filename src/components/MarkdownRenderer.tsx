/**
 * Simple markdown renderer for chat messages
 * Handles basic formatting: bold, lists, line breaks, paragraphs
 */
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  // Handle content that might not have double line breaks
  // Split by double line breaks first, then handle single line breaks
  let normalizedContent = content;
  
  // If content doesn't have double line breaks, try to split intelligently
  if (!normalizedContent.includes('\n\n')) {
    // Split by patterns like "**Erklärung:**" or "💡 Tipp:" or "**Example:**"
    normalizedContent = normalizedContent.replace(/\n(\*\*[^*]+:\*\*|💡|🚀|📝)/g, '\n\n$1');
  }
  
  // Split content into paragraphs
  const paragraphs = normalizedContent.split('\n\n').filter(p => p.trim());
  
  const renderParagraph = (text: string) => {
    // Split by single line breaks but preserve structure
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        elements.push(<br key={`br-${lineIndex}`} />);
        return;
      }
      
      // Check if it's a list item
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        const listContent = trimmedLine.substring(2);
        elements.push(
          <li key={`li-${lineIndex}`} className="ml-4 mb-1">
            {renderInlineFormatting(listContent)}
          </li>
        );
        return;
      }
      
      // Check if it's a numbered list item
      const numberedMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)$/);
      if (numberedMatch) {
        elements.push(
          <li key={`li-${lineIndex}`} className="ml-4 mb-1 list-decimal">
            {renderInlineFormatting(numberedMatch[2])}
          </li>
        );
        return;
      }
      
      // Regular paragraph line
      elements.push(
        <p key={`p-${lineIndex}`} className="mb-2 last:mb-0">
          {renderInlineFormatting(trimmedLine)}
        </p>
      );
    });
    
    return elements;
  };
  
  const renderInlineFormatting = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Patterns to match: **bold**, `code`, regular text
    const patterns = [
      { regex: /\*\*([^*]+)\*\*/g, render: (match: string) => (
        <strong key={`bold-${lastIndex}`} className="font-semibold text-foreground">
          {match}
        </strong>
      )},
      { regex: /`([^`]+)`/g, render: (match: string) => (
        <code key={`code-${lastIndex}`} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
          {match}
        </code>
      )},
    ];
    
    // Find all matches
    const matches: Array<{ index: number; length: number; type: 'bold' | 'code'; content: string }> = [];
    
    patterns.forEach((pattern, patternIndex) => {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          type: patternIndex === 0 ? 'bold' : 'code',
          content: match[1],
        });
      }
    });
    
    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);
    
    // Render text with formatting
    matches.forEach((match) => {
      // Add text before the match
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push(textBefore);
        }
      }
      
      // Add formatted content
      if (match.type === 'bold') {
        parts.push(
          <strong key={`bold-${match.index}`} className="font-semibold text-foreground">
            {match.content}
          </strong>
        );
      } else {
        parts.push(
          <code key={`code-${match.index}`} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
            {match.content}
          </code>
        );
      }
      
      lastIndex = match.index + match.length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }
    
    // If no formatting found, return original text
    if (parts.length === 0) {
      return text;
    }
    
    return <>{parts}</>;
  };
  
  return (
    <div className={`markdown-content ${className}`}>
      {paragraphs.map((paragraph, index) => {
        const isList = paragraph.split('\n').some(line => 
          line.trim().startsWith('- ') || 
          line.trim().startsWith('• ') ||
          /^\d+[.)]\s+/.test(line.trim())
        );
        
        if (isList) {
          return (
            <ul key={`para-${index}`} className="list-disc list-inside mb-3 space-y-1">
              {renderParagraph(paragraph)}
            </ul>
          );
        }
        
        return (
          <div key={`para-${index}`} className="mb-3 last:mb-0">
            {renderParagraph(paragraph)}
          </div>
        );
      })}
    </div>
  );
};

