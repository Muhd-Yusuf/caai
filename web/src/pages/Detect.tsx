import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import cameraIcon from '../assets/camera-icon.svg';
import { compressImage } from '../utils/imageUtils';
import { api } from '../services/api';
import StructuredOutput from '../components/StructuredOutput';

Modal.setAppElement('#root');

// Generate a new session ID each time the page loads
const sessionId = crypto.randomUUID();

const Detect: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ content: { type: string, content: string, fileSize?: string }, isUser: boolean }>>([{
    content: {
      type: 'text',
      content: 'Hello! I can help you detect antisemitic content in text or images. Please share what you\'d like me to analyze.\n\nYou may also ask me questions or direct me to expand my response. For example: Expand on the topic in relation to the last image analyzed.'
    },
    isUser: false
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  // Track which video elements have already been autoplayed to prevent replay on re-render
  const playedVideos = useRef<WeakSet<HTMLVideoElement>>(new WeakSet());

  const createLoadingElement = () => (
    <div className="flex justify-start mb-4">
      <div className="message-bubble rounded-lg bg-gray-200">
        <div className="loading-dots">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="dot" />
          ))}
        </div>
      </div>
    </div>
  );

  const createMessageElement = (message: { type: string; content: string; fileSize?: string }, isUser: boolean) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={message.type === 'image' || message.type === 'video' ? 'message-bubble' : `message-bubble rounded-lg p-3 ${
        isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
      }`}>
        {message.type === 'image' ? (
          <img
            src={message.content}
            alt="Uploaded content"
            className="uploaded-image shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
        ) : message.type === 'video' ? (
          <div className="relative">
            <video
              src={message.content}
              controls
              playsInline
              className="uploaded-image shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg"
              style={{ maxWidth: '100%', maxHeight: '300px' }}
              preload="auto"
              ref={(v) => {
                if (!v || playedVideos.current.has(v)) return;
                playedVideos.current.add(v);
                v.muted = true;
                v.play()
                  .then(() => { v.muted = false; })
                  .catch(() => { v.muted = false; });
              }}
            />
            {message.fileSize && (
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                {message.fileSize}
              </span>
            )}
          </div>
        ) : isUser ? (
          <div className="whitespace-pre-wrap font-sans">
            {message.content}
          </div>
        ) : (
          <StructuredOutput content={message.content} />
        )}
      </div>
    </div>
  );

  const toggleInputs = useCallback((disabled: boolean) => {
    const sendButton = document.querySelector('#sendButton') as HTMLButtonElement;
    const cameraLabel = document.querySelector('#cameraLabel') as HTMLLabelElement;
    const imageInput = document.querySelector('#imageInput') as HTMLInputElement;
    const messageInput = document.querySelector('#messageInput') as HTMLTextAreaElement;

    if (sendButton && cameraLabel && imageInput && messageInput) {
      sendButton.disabled = disabled;
      sendButton.className = `flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg focus:outline-none transition-colors text-sm sm:text-base self-end ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`;
      cameraLabel.className = `cursor-${disabled ? 'not-allowed' : 'pointer'} ${
        disabled ? 'bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'
      } px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center transition-colors self-end`;
      
      imageInput.disabled = disabled;
      messageInput.disabled = disabled;
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const allowedImageTypes = ['image/jpeg', 'image/bmp', 'image/png'];

  const processFile = useCallback((file: File) => {
    if (!allowedImageTypes.includes(file.type)) {
      setMessages(prev => [...prev, {
        content: { content: 'Error: Please upload a JPEG, PNG, or BMP image.', type: 'text' },
        isUser: false,
      }]);
      return;
    }

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    reader.onload = async (event) => {
      setUploadProgress(null);
      if (event.target?.result) {
        try {
          const compressedImage = await compressImage(event.target.result as string, 800, 600, 0.6);
          sendMessage(compressedImage, 'image');
        } catch (error) {
          console.error('Error compressing image:', error);
          sendMessage(event.target.result as string, 'image');
        }
      }
    };
    reader.onerror = () => {
      setUploadProgress(null);
      setIsLoading(false);
      toggleInputs(false);
      setMessages(prev => [...prev, {
        content: { content: 'Error: Failed to read the file. Please try again.', type: 'text' },
        isUser: false,
      }]);
    };
    reader.readAsDataURL(file);
  }, []);

  const sendMessage = async (content: string, type = 'text', fileSize?: string) => {
    const message = { content, type, fileSize };
    setMessages(prev => [...prev, { content: message, isUser: true }]);
    setIsLoading(true);
    toggleInputs(true);
    setHasInteracted(true); // Enable share button after first interaction

    const payload: Record<string, unknown> = {
      sessionId,
      chatInput: type === 'image' ? 'analyze this image' : type === 'video' ? 'analyze this video' : content,
    };

    if (type === 'image') {
      payload.imageData = content;
    } else if (type === 'video') {
      payload.videoData = content;
    }

    try {
      setRateLimitMessage(null);
      const data = await api.post<{ output: string }>('/act/chat', payload);

      if (!data || !data.output) {
        throw new Error('Invalid response format from server');
      }

      setMessages(prev => [...prev, {
        content: { content: data.output, type: 'text' },
        isUser: false,
      }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.status === 429) {
        setRateLimitMessage(error.message);
        setMessages(prev => [...prev, {
          content: { content: error.message, type: 'text' },
          isUser: false,
        }]);
      } else {
        setMessages(prev => [...prev, {
          content: { content: `Error: ${error.message || 'An unexpected error occurred'}`, type: 'text' },
          isUser: false,
        }]);
      }
    } finally {
      setIsLoading(false);
      toggleInputs(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageInput = document.getElementById('messageInput') as HTMLTextAreaElement;
    const message = messageInput.value.trim();
    if (message) {
      sendMessage(message);
      messageInput.value = '';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input immediately so the same file can be re-selected after an error
    e.target.value = '';
    if (file) {
      processFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const handleShareClick = () => {
    if (hasInteracted) {
      setIsShareModalOpen(true);
    }
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const generatePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const messageMaxWidth = contentWidth * 0.65; // WhatsApp-style: messages take up to 65% width
    let yPosition = margin;

    // Match app design colors
    const userBubbleColor = { r: 59, g: 130, b: 246 }; // Blue-500 (#3B82F6)
    const aiBubbleColor = { r: 229, g: 231, b: 235 }; // Gray-200 (#E5E7EB)
    const backgroundColor = { r: 249, g: 250, b: 251 }; // Gray-50 (#F9FAFB)
    const headerGradientStart = { r: 58, g: 56, b: 56 }; // #3a3838
    const headerGradientEnd = { r: 37, g: 37, b: 37 }; // #252525

    // Set background color for the entire page
    pdf.setFillColor(backgroundColor.r, backgroundColor.g, backgroundColor.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Helper function to add a new page if needed
    const checkAndAddPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        // Set background for new page
        pdf.setFillColor(backgroundColor.r, backgroundColor.g, backgroundColor.b);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        yPosition = margin;
      }
    };

    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number, fontSize: number) => {
      pdf.setFontSize(fontSize);
      return pdf.splitTextToSize(text, maxWidth);
    };

    // Add header with gradient effect (using solid color as PDF doesn't support gradients natively)
    pdf.setFillColor(headerGradientStart.r, headerGradientStart.g, headerGradientStart.b);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text('The ACT (Antisemitism Checker Tool), Created by CAAI', margin, 15);
    
    pdf.setFontSize(10);
    pdf.setTextColor(147, 197, 253); // Blue-100 for subtitle
    const timestamp = new Date().toLocaleString();
    pdf.text(timestamp, margin, 21);
    
    yPosition = 35;

    // Process each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const isUser = message.isUser;
      
      // Check if we need a new page for message container
      checkAndAddPage(40);

      if (message.content.type === 'video') {
        // Capture a thumbnail from the first frame and render it as an image in the PDF
        try {
          const thumbDataUrl = await new Promise<string>((resolve, reject) => {
            const vid = document.createElement('video');
            vid.muted = true;
            vid.preload = 'metadata';
            vid.crossOrigin = 'anonymous';
            vid.src = message.content.content;
            // Must wait for metadata before seeking, then wait for seek to complete
            vid.onloadedmetadata = () => { vid.currentTime = 1; };
            vid.onseeked = () => {
              const canvas = document.createElement('canvas');
              canvas.width = vid.videoWidth || 480;
              canvas.height = vid.videoHeight || 270;
              const ctx = canvas.getContext('2d');
              if (!ctx) return reject(new Error('canvas context unavailable'));
              ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            vid.onerror = reject;
            // Timeout fallback — if seek never fires, reject so placeholder is used
            setTimeout(() => reject(new Error('thumbnail timeout')), 5000);
          });

          const img = new Image();
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = thumbDataUrl; });

          const maxImageWidth = messageMaxWidth - 10;
          const maxImageHeight = 100;
          const ratio = Math.min(maxImageWidth / img.width, maxImageHeight / img.height, 1);
          const imgWidth = img.width * ratio;
          const imgHeight = img.height * ratio;
          const bubbleWidth = imgWidth + 10;
          const bubbleHeight = imgHeight + 22; // extra for label

          checkAndAddPage(bubbleHeight + 10);
          const bubbleX = isUser ? pageWidth - margin - bubbleWidth : margin;
          pdf.setFillColor(userBubbleColor.r, userBubbleColor.g, userBubbleColor.b);
          pdf.roundedRect(bubbleX, yPosition, bubbleWidth, bubbleHeight, 3, 3, 'F');
          pdf.addImage(thumbDataUrl, bubbleX + 5, yPosition + 5, imgWidth, imgHeight);

          // Label below thumbnail
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(219, 234, 254);
          const label = message.content.fileSize ? `[Video]  ${message.content.fileSize}` : '[Video]';
          pdf.text(label, bubbleX + 5, yPosition + 5 + imgHeight + 7);

          yPosition += bubbleHeight + 5;
        } catch {
          // Fallback: just show a placeholder
          const bw = messageMaxWidth;
          const bh = 20;
          const bx = isUser ? pageWidth - margin - bw : margin;
          pdf.setFillColor(userBubbleColor.r, userBubbleColor.g, userBubbleColor.b);
          pdf.roundedRect(bx, yPosition, bw, bh, 3, 3, 'F');
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.text('▶ Video attachment', bx + 5, yPosition + 12);
          yPosition += bh + 5;
        }
      } else if (message.content.type === 'image') {
        try {
          // For images, we'll use the original data URL directly for 100% quality
          const imgDataUrl = message.content.content;
          
          // Create temporary image to get dimensions
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imgDataUrl;
          });

          // Calculate dimensions while maintaining aspect ratio
          const maxImageWidth = messageMaxWidth - 10;
          const maxImageHeight = 100;
          let imgWidth = img.width;
          let imgHeight = img.height;
          
          const widthRatio = maxImageWidth / imgWidth;
          const heightRatio = maxImageHeight / imgHeight;
          const ratio = Math.min(widthRatio, heightRatio, 1); // Don't upscale
          
          imgWidth = imgWidth * ratio;
          imgHeight = imgHeight * ratio;

          // Tight 2px padding around the image
          const pad = 2;
          const bubbleWidth = imgWidth + pad * 2;
          const bubbleHeight = imgHeight + pad * 2;

          checkAndAddPage(bubbleHeight + 10);

          const bubbleX = isUser ? pageWidth - margin - bubbleWidth : margin;

          if (isUser) {
            pdf.setFillColor(userBubbleColor.r, userBubbleColor.g, userBubbleColor.b);
          } else {
            pdf.setFillColor(aiBubbleColor.r, aiBubbleColor.g, aiBubbleColor.b);
          }

          pdf.roundedRect(bubbleX, yPosition, bubbleWidth, bubbleHeight, 2, 2, 'F');
          pdf.addImage(imgDataUrl, bubbleX + pad, yPosition + pad, imgWidth, imgHeight);

          yPosition += bubbleHeight + 5;
          
        } catch (error) {
          console.error('Error adding image to PDF:', error);
          // Fallback for failed images
          const errorBubbleWidth = messageMaxWidth;
          const errorBubbleHeight = 20;
          
          const bubbleX = isUser ? pageWidth - margin - errorBubbleWidth : margin;
          
          pdf.setFillColor(255, 200, 200);
          pdf.roundedRect(bubbleX, yPosition, errorBubbleWidth, errorBubbleHeight, 3, 3, 'F');
          
          pdf.setTextColor(150, 50, 50);
          pdf.setFontSize(10);
          pdf.text('[Image could not be loaded]', bubbleX + 5, yPosition + 12);
          
          yPosition += errorBubbleHeight + 5;
        }
      } else {
        // Handle text messages — preserve bold markers, strip other markdown
        const messageText = message.isUser ? message.content.content : message.content.content
          .replace(/^#{1,6}\s+/gm, '')       // headers
          .replace(/\*\*(.+?)\*\*/g, '!!BOLD!!$1!!ENDBOLD!!')  // protect ** bold first
          .replace(/\*([^*]+?)\*/g, '!!BOLD!!$1!!ENDBOLD!!')   // normalize single * to bold too
          .replace(/!!BOLD!!/g, '**').replace(/!!ENDBOLD!!/g, '**') // restore as **
          .replace(/__(.+?)__/g, '**$1**')   // bold alt → normalize to **
          .replace(/_(.+?)_/g, '$1')         // italic alt
          .replace(/~~(.+?)~~/g, '$1')       // strikethrough
          .replace(/`{1,3}([^`]+)`{1,3}/g, '$1') // inline/block code
          .replace(/^[ \t]*o[ \t]+/gm, '  ')  // strip "o " bullet prefix (PDF artifact)
          .replace(/^\s*[-*+]\s+/gm, '  - ') // bullet lists
          .replace(/^\s*\d+\.\s+/gm, (m) => '  ' + m.trim() + ' ') // numbered lists
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
          .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // images
          .replace(/^>\s+/gm, '')            // blockquotes
          .replace(/\n{3,}/g, '\n\n');       // excess newlines

        // Detect IHRA verdict for AI messages
        const isIHRA = !isUser && /Application of IHRA|Applying IHRA|IHRA Rules? Violated|No IHRA rules/i.test(messageText);
        let verdict: 'antisemitic' | 'not antisemitic' | 'potentially antisemitic' | 'inconclusive' = 'inconclusive';
        if (isIHRA) {
          const conclusionMatch = messageText.match(/Conclusion[:\s]*([\s\S]+)/i);
          if (conclusionMatch) {
            const conclusion = conclusionMatch[1].toLowerCase();
            if (/is not antisemitic|does not violate|not antisemitic/.test(conclusion)) verdict = 'not antisemitic';
            else if (/potentially antisemitic/.test(conclusion)) verdict = 'potentially antisemitic';
            else if (/verdict inconclusive|is inconclusive|status is.*inconclusive|inconclusive/.test(conclusion)) verdict = 'inconclusive';
            else if (/antisemitic|violates rdc-ihra|can be considered antisemitic/.test(conclusion)) verdict = 'antisemitic';
          }
        }

        // Add spacing before IHRA section headers for readability
        const spacedText = isIHRA ? messageText.replace(
          /\n(\*\*(?:Stereotypical Allegations|Collective Blame|Classic Antisemitism Symbols|Harm or Violence|Holocaust Denial|Holocaust Exaggeration|Loyalty Allegations|Right to Self-Determination|Double Standards|Nazi Comparisons|Collective Responsibility|Conclusion):?\*\*)/g,
          '\n\n$1'
        ) : messageText;

        // Strip bold markers for wrapping calculation only
        const plainText = spacedText.replace(/\*\*(.+?)\*\*/g, '$1');
        const wrappedPlain = wrapText(plainText, messageMaxWidth - 15, 10);
        const lineHeight = 5;
        // Extra height for verdict badge if IHRA
        const verdictHeight = isIHRA ? 12 : 0;
        const bubbleHeight = wrappedPlain.length * lineHeight + 20 + verdictHeight;

        // Also wrap the text WITH bold markers to render bold segments
        const wrappedBold = wrapText(spacedText, messageMaxWidth - 15, 10);

        // Calculate bubble width based on content
        let bubbleWidth = 0;
        pdf.setFontSize(10);
        for (const line of wrappedPlain) {
          const lineWidth = pdf.getTextWidth(line);
          bubbleWidth = Math.max(bubbleWidth, lineWidth);
        }
        bubbleWidth = Math.min(bubbleWidth + 20, messageMaxWidth);

        // Position based on sender (WhatsApp style)
        const bubbleX = isUser ? pageWidth - margin - bubbleWidth : margin;

        // Render the bubble across one or more pages, splitting if it doesn't fit
        // on the remaining page space. Each page draws its own bubble rectangle and
        // the verdict badge appears only on the first chunk.
        const verdictColors: Record<string, { r: number; g: number; b: number; label: string }> = {
          'antisemitic': { r: 220, g: 38, b: 38, label: 'Antisemitic' },
          'potentially antisemitic': { r: 249, g: 115, b: 22, label: 'Potentially Antisemitic' },
          'not antisemitic': { r: 22, g: 163, b: 74, label: 'Not Antisemitic' },
          'inconclusive': { r: 107, g: 114, b: 128, label: 'Inconclusive' },
        };

        let lineIdx = 0;
        let isFirstChunk = true;
        const topPadding = 10;
        const bottomPadding = 6;

        while (lineIdx < wrappedBold.length) {
          // If barely any space left on the current page, jump to a new page first
          if (yPosition + topPadding + lineHeight + bottomPadding > pageHeight - margin) {
            pdf.addPage();
            pdf.setFillColor(backgroundColor.r, backgroundColor.g, backgroundColor.b);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            yPosition = margin;
          }

          const chunkVerdictHeight = (isFirstChunk && isIHRA) ? verdictHeight : 0;
          const availableHeight = (pageHeight - margin) - yPosition - bottomPadding - topPadding - chunkVerdictHeight;
          const linesThatFit = Math.max(1, Math.floor(availableHeight / lineHeight));
          const chunkLines = wrappedBold.slice(lineIdx, lineIdx + linesThatFit);

          // Compute exact chunk height including empty-line spacing
          let chunkContentHeight = 0;
          for (const line of chunkLines) {
            chunkContentHeight += line.trim() === '' ? 2 : lineHeight;
          }
          const chunkBubbleHeight = chunkContentHeight + topPadding + bottomPadding + chunkVerdictHeight;

          // Draw bubble for this chunk
          if (isUser) {
            pdf.setFillColor(userBubbleColor.r, userBubbleColor.g, userBubbleColor.b);
          } else {
            pdf.setFillColor(aiBubbleColor.r, aiBubbleColor.g, aiBubbleColor.b);
            pdf.setDrawColor(229, 229, 229);
            pdf.setLineWidth(0.5);
          }
          pdf.roundedRect(bubbleX, yPosition, bubbleWidth, chunkBubbleHeight, 3, 3, isUser ? 'F' : 'FD');

          let textY = yPosition + topPadding;

          // Draw verdict badge only on first chunk of an IHRA message
          if (isFirstChunk && isIHRA) {
            const vc = verdictColors[verdict];
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(107, 114, 128);
            pdf.text('VERDICT', bubbleX + 10, textY);
            const pillX = bubbleX + 10 + pdf.getTextWidth('VERDICT') + 3;
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            const pillWidth = pdf.getTextWidth(vc.label) + 8;
            pdf.setFillColor(vc.r, vc.g, vc.b);
            pdf.roundedRect(pillX, textY - 4, pillWidth, 6, 2, 2, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.text(vc.label, pillX + 4, textY);
            pdf.setFont('helvetica', 'normal');
            textY += verdictHeight;
          }

          // Render lines in this chunk
          pdf.setFontSize(10);
          if (isUser) {
            pdf.setTextColor(255, 255, 255);
          } else {
            pdf.setTextColor(31, 41, 55);
          }

          for (const line of chunkLines) {
            if (line.trim() === '') {
              textY += 2;
              continue;
            }
            const segments = line.split(/(\*\*[^*]+\*\*)/g);
            let xPos = bubbleX + 10;
            for (const segment of segments) {
              if (segment.startsWith('**') && segment.endsWith('**')) {
                const boldText = segment.slice(2, -2);
                pdf.setFont('helvetica', 'bold');
                pdf.text(boldText, xPos, textY);
                xPos += pdf.getTextWidth(boldText);
                pdf.setFont('helvetica', 'normal');
              } else if (segment) {
                pdf.setFont('helvetica', 'normal');
                pdf.text(segment, xPos, textY);
                xPos += pdf.getTextWidth(segment);
              }
            }
            textY += lineHeight;
          }

          yPosition += chunkBubbleHeight + 5;
          lineIdx += chunkLines.length;
          isFirstChunk = false;
        }
      }
    }

    // Add footer on last page
    yPosition = pageHeight - 15;
    
    // Footer with subtle gradient background effect
    pdf.setFillColor(249, 250, 251); // Gray-50
    pdf.rect(0, yPosition - 5, pageWidth, 20, 'F');
    
    // Add subtle top border for footer
    pdf.setDrawColor(229, 231, 235); // Gray-200
    pdf.setLineWidth(0.5);
    pdf.line(0, yPosition - 5, pageWidth, yPosition - 5);
    
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128); // Gray-500
    const footerText = 'Generated by The ACT (Antisemitism Checker Tool), Created by CAAI';
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, yPosition);

    // Generate filename with timestamp
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `CAAI-Chat-Analysis-${dateStr}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
  };

  const handleExportPDF = async () => {
    if (messages.length <= 1) {
      // Only has the initial greeting message
      return;
    }

    try {
      await generatePDF();
      closeShareModal();
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You could add error handling UI here if needed
    }
  };

  return (
    <main 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #3a3838 0%, #252525 100%)',
        minHeight: '100vh'
      }}
    >
      <div className="container mx-auto px-4 md:px-6 pt-24 sm:pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">
              The ACT, An AI-Powered Antisemitism Detection Tool
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 italic mb-3 sm:mb-4">
              Beta version 2.0
            </p>
            <p className="text-lg sm:text-xl text-blue-100">
              Share text or images to analyze potential antisemitic content
            </p>
          </div>

          {rateLimitMessage && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-center">
              {rateLimitMessage}
            </div>
          )}

          <div 
            className={`bg-gray-50 rounded-xl shadow-2xl overflow-hidden relative ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >

            <div className="h-[500px] sm:h-[600px] flex flex-col">
              <div className="message-container flex-1 p-4 sm:p-6 overflow-y-auto">
                {messages.map((msg, index) => createMessageElement(msg.content, msg.isUser))}
                {isLoading && createLoadingElement()}
              </div>
              
              <div className="border-t bg-gray-50" style={{ padding: '0.75rem' }}>
                {uploadProgress !== null && (
                  <div className="mb-2 px-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Uploading file...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <form id="messageForm" className="flex gap-2 sm:gap-3 items-end" onSubmit={handleSubmit}>
                  <textarea 
                    id="messageInput" 
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:border-blue-500 resize-none overflow-hidden h-20 sm:h-24 placeholder-mobile-adaptive"
                    placeholder="Paste your text or image here - you may also upload your image using the camera icon."
                    rows={1}
                    style={{
                      fontSize: 'clamp(0.75rem, 3.5vw, 1rem)',
                    }}
                  />
                  
                  {/* Vertical button container */}
                  <div className="flex flex-col gap-1 sm:gap-2 self-end">
                    {/* New button spanning full width */}
                    <button
                      onClick={handleShareClick}
                      disabled={!hasInteracted}
                      type="button"
                      className={`w-full transition-all duration-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium ${
                        hasInteracted 
                          ? 'text-white cursor-pointer' 
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                      }`}
                      style={hasInteracted ? { backgroundColor: '#2d2c2c' } : {}}
                      aria-label="Save"
                    >
                      <div className="flex w-full items-center justify-center gap-1.5">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-label=""
                          className="-ms-0.5 icon"
                        >
                          <path d="M2.66821 12.6663V12.5003C2.66821 12.1331 2.96598 11.8353 3.33325 11.8353C3.70052 11.8353 3.99829 12.1331 3.99829 12.5003V12.6663C3.99829 13.3772 3.9992 13.8707 4.03052 14.2542C4.0612 14.6298 4.11803 14.8413 4.19849 14.9993L4.2688 15.1263C4.44511 15.4137 4.69813 15.6481 5.00024 15.8021L5.13013 15.8577C5.2739 15.9092 5.46341 15.947 5.74536 15.97C6.12888 16.0014 6.62221 16.0013 7.33325 16.0013H12.6663C13.3771 16.0013 13.8707 16.0014 14.2542 15.97C14.6295 15.9394 14.8413 15.8825 14.9993 15.8021L15.1262 15.7308C15.4136 15.5545 15.6481 15.3014 15.802 14.9993L15.8577 14.8695C15.9091 14.7257 15.9469 14.536 15.97 14.2542C16.0013 13.8707 16.0012 13.3772 16.0012 12.6663V12.5003C16.0012 12.1332 16.2991 11.8355 16.6663 11.8353C17.0335 11.8353 17.3313 12.1331 17.3313 12.5003V12.6663C17.3313 13.3553 17.3319 13.9124 17.2952 14.3626C17.2624 14.7636 17.1974 15.1247 17.053 15.4613L16.9866 15.6038C16.7211 16.1248 16.3172 16.5605 15.8215 16.8646L15.6038 16.9866C15.227 17.1786 14.8206 17.2578 14.3625 17.2952C13.9123 17.332 13.3553 17.3314 12.6663 17.3314H7.33325C6.64416 17.3314 6.0872 17.332 5.63696 17.2952C5.23642 17.2625 4.87552 17.1982 4.53931 17.054L4.39673 16.9866C3.87561 16.7211 3.43911 16.3174 3.13501 15.8216L3.01294 15.6038C2.82097 15.2271 2.74177 14.8206 2.70435 14.3626C2.66758 13.9124 2.66821 13.3553 2.66821 12.6663ZM9.33521 12.5003V4.9388L7.13696 7.13704C6.87732 7.39668 6.45625 7.39657 6.19653 7.13704C5.93684 6.87734 5.93684 6.45631 6.19653 6.19661L9.52954 2.86263L9.6311 2.77962C9.73949 2.70742 9.86809 2.66829 10.0002 2.66829C10.1763 2.66838 10.3454 2.73819 10.47 2.86263L13.804 6.19661C14.0633 6.45628 14.0634 6.87744 13.804 7.13704C13.5443 7.39674 13.1222 7.39674 12.8625 7.13704L10.6653 4.93977V12.5003C10.6651 12.8673 10.3673 13.1652 10.0002 13.1654C9.63308 13.1654 9.33538 12.8674 9.33521 12.5003Z"></path>
                        </svg>
                        <span className="text-sm font-medium">Save</span>
                      </div>
                    </button>
                    
                    {/* Camera and Send buttons side by side */}
                    <div className="flex gap-1 sm:gap-2">
                      <label
                        id="cameraLabel"
                        className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center transition-colors"
                      >
                        <img src={cameraIcon} alt="Upload image" className="w-5 h-5 sm:w-6 sm:h-6" />
                        <input
                          type="file"
                          id="imageInput"
                          className="hidden"
                          accept="image/jpeg,image/bmp,image/png"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <button 
                        id="sendButton"
                        type="submit"
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-600 focus:outline-none transition-colors text-sm sm:text-base"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0,0,256,256"
                          className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                          fill="currentColor"
                        >
                          <g transform="scale(5.33333,5.33333)">
                            <path d="M23.426,31.911l-1.719,3.936c-0.661,1.513 -2.754,1.513 -3.415,0l-1.719,-3.936c-1.529,-3.503 -4.282,-6.291 -7.716,-7.815l-4.73,-2.1c-1.504,-0.668 -1.504,-2.855 0,-3.523l4.583,-2.034c3.522,-1.563 6.324,-4.455 7.827,-8.077l1.741,-4.195c0.646,-1.557 2.797,-1.557 3.443,0l1.741,4.195c1.503,3.622 4.305,6.514 7.827,8.077l4.583,2.034c1.504,0.668 1.504,2.855 0,3.523l-4.73,2.1c-3.434,1.524 -6.187,4.313 -7.716,7.815z"></path>
                            <path d="M38.423,43.248l-0.493,1.131c-0.361,0.828 -1.507,0.828 -1.868,0l-0.493,-1.131c-0.879,-2.016 -2.464,-3.621 -4.44,-4.5l-1.52,-0.675c-0.822,-0.365 -0.822,-1.56 0,-1.925l1.435,-0.638c2.027,-0.901 3.64,-2.565 4.504,-4.65l0.507,-1.222c0.353,-0.852 1.531,-0.852 1.884,0l0.507,1.222c0.864,2.085 2.477,3.749 4.504,4.65l1.435,0.638c0.822,0.365 0.822,1.56 0,1.925l-1.52,0.675c-1.978,0.879 -3.562,2.484 -4.442,4.5z"></path>
                          </g>
                        </svg>
                        Send
                      </button>
                    </div>
                  </div>
                </form>
                <div className="flex justify-start mt-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMessages([{
                        content: {
                          type: 'text',
                          content: 'Hello! I can help you detect antisemitic content in text or images. Please share what you\'d like me to analyze.\n\nYou may also ask me questions or direct me to expand my response. For example: Expand on the topic in relation to the last image analyzed.'
                        },
                        isUser: false
                      }]);
                      setHasInteracted(false);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessages(prev => {
                        if (prev.length <= 1) return prev;
                        // Remove last 2 messages (last user input + last ACT response),
                        // but never remove the initial welcome message (index 0)
                        const trimmed = prev.slice(0, -2);
                        return trimmed.length >= 1 ? trimmed : prev.slice(0, 1);
                      });
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onRequestClose={closeShareModal}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90%] max-w-[550px] mx-auto flex flex-col overflow-hidden max-h-[90vh]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="min-h-[60px] flex justify-between py-2.5 ps-4 pe-2 select-none border-b border-gray-200">
          <div className="flex max-w-full items-center">
            <div className="flex max-w-full min-w-0 grow flex-col">
              <h2 className="text-gray-900 text-lg font-normal">Share Chat</h2>
            </div>
          </div>
          <div className="flex h-[max-content] items-center gap-2">
            <button 
              onClick={closeShareModal}
              className="hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-full focus:outline-none bg-transparent transition-colors" 
              aria-label="Close" 
              type="button"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="grow overflow-y-auto p-4 pt-4">
          <div className="w-full">
            <p className="text-gray-600 mb-6">
              Export your antisemitism detection analysis as a PDF document. The PDF will include all messages and analysis results from this conversation for easy sharing and record-keeping.
            </p>
          </div>
          
          <div className="flex justify-center">
            <button 
              className="btn relative bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 text-base font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
              type="button"
              disabled={messages.length <= 1}
              onClick={handleExportPDF}
            >
              <div className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                </svg>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  xmlns="http://www.w3.org/2000/svg" 
                  aria-label="" 
                  className="-ms-0.5 icon"
                >
                  <path d="M4.50266 8.72527C4.74666 8.45077 5.16761 8.42561 5.44212 8.66961C5.71646 8.9136 5.74069 9.33363 5.4968 9.60808L4.70872 10.4958C3.51374 11.8401 3.57358 13.8831 4.84544 15.155L4.96653 15.2702C6.24392 16.4291 8.2022 16.4494 9.50462 15.2917L10.3913 14.5026L10.5007 14.4245C10.7684 14.2694 11.1172 14.318 11.3308 14.5583C11.5745 14.8328 11.5494 15.2528 11.2751 15.4968L10.3874 16.2858C8.57529 17.8963 5.85138 17.8686 4.07395 16.2565L3.90501 16.0954C2.1352 14.3256 2.05175 11.4827 3.71458 9.61199L4.50266 8.72527ZM12.03 7.02996C12.2897 6.77026 12.7107 6.77026 12.9704 7.02996C13.23 7.28967 13.2301 7.71075 12.9704 7.97039L7.97044 12.9704C7.71079 13.23 7.28972 13.2299 7.03001 12.9704C6.77031 12.7107 6.77031 12.2897 7.03001 12.03L12.03 7.02996ZM9.79075 3.56316C11.6599 2.05831 14.3811 2.19058 16.0954 3.90496L16.2566 4.0739C17.8167 5.79413 17.8929 8.40089 16.4363 10.2096L16.2859 10.3874L15.4968 11.2751L15.3982 11.3659C15.1506 11.5514 14.7986 11.5441 14.5583 11.3307C14.2838 11.0868 14.2587 10.6658 14.5027 10.3913L15.2917 9.50457L15.4001 9.37664C16.4472 8.07664 16.3918 6.20275 15.2702 4.96648L15.155 4.84539C13.9228 3.61321 11.967 3.51841 10.6238 4.60027L10.4958 4.70867L9.60813 5.49676C9.33367 5.74064 8.91365 5.71642 8.66965 5.44207C8.42565 5.16757 8.45082 4.74662 8.72532 4.50261L9.61204 3.71453L9.79075 3.56316Z"></path>
                </svg>
                Export as PDF
              </div>
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default Detect;