import React, { useCallback } from 'react';
import { $getRoot, $getSelection } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $createParagraphNode, $createTextNode } from 'lexical';
import { 
  $createHeadingNode,
  $createQuoteNode, 
  HeadingNode, 
  QuoteNode 
} from '@lexical/rich-text';
import { 
  $isListNode, 
  ListItemNode, 
  ListNode,
  $createListItemNode,
  $createListNode
} from '@lexical/list';
import { CodeNode, $createCodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import theme from '../theme';

const RichTextEditor = ({ 
  placeholder = "메시지를 입력하세요...", 
  onContentChange,
  onEnter,
  disabled = false 
}) => {
  // 에디터 초기 설정
  const initialConfig = {
    namespace: 'ChatEditor',
    theme: {
      paragraph: 'chat-paragraph',
      text: {
        bold: 'chat-bold',
        italic: 'chat-italic',
        underline: 'chat-underline',
        strikethrough: 'chat-strikethrough',
        code: 'chat-code'
      },
      heading: {
        h1: 'chat-h1',
        h2: 'chat-h2', 
        h3: 'chat-h3'
      },
      list: {
        nested: {
          listitem: 'chat-nested-listitem'
        },
        ol: 'chat-list-ol',
        ul: 'chat-list-ul',
        listitem: 'chat-listitem'
      },
      quote: 'chat-quote',
      code: 'chat-code-block',
      link: 'chat-link'
    },
    onError: (error) => {
      console.error('Lexical Error:', error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      LinkNode
    ]
  };

  // 내용 변경 핸들러
  const handleContentChange = useCallback((editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      const htmlContent = root.getTextContent(); // 나중에 HTML로 확장 가능
      
      if (onContentChange) {
        onContentChange({ text: textContent, html: htmlContent });
      }
    });
  }, [onContentChange]);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((event, editor) => {
    const { code, shiftKey, ctrlKey, metaKey } = event;
    
    // Enter 키 처리
    if (code === 'Enter') {
      if (shiftKey) {
        // Shift + Enter: 줄바꿈 (기본 동작)
        return false;
      } else {
        // Enter만: 전송
        event.preventDefault();
        if (onEnter) {
          onEnter();
        }
        return true;
      }
    }
    
    // 포맷팅 단축키
    if (ctrlKey || metaKey) {
      switch (code) {
        case 'KeyB':
          // Ctrl/Cmd + B: 볼드
          event.preventDefault();
          editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'bold');
          return true;
        case 'KeyI':
          // Ctrl/Cmd + I: 기울임
          event.preventDefault();
          editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'italic');
          return true;
        case 'KeyU':
          // Ctrl/Cmd + U: 밑줄
          event.preventDefault();
          editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'underline');
          return true;
      }
    }
    
    return false;
  }, [onEnter]);

  return (
    <div style={{
      border: `1px solid ${theme.colors.surface.border}`,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background.primary,
      minHeight: '44px',
      maxHeight: '120px',
      overflow: 'auto',
      position: 'relative'
    }}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                minHeight: '20px',
                outline: 'none',
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.sans,
                color: theme.colors.text.primary,
                lineHeight: theme.typography.lineHeight.normal
              }}
              onKeyDown={(event) => {
                // editor 접근을 위한 추가 처리 필요
              }}
            />
          }
          placeholder={
            <div style={{
              position: 'absolute',
              top: `${theme.spacing[3]}`,
              left: `${theme.spacing[4]}`,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
              pointerEvents: 'none',
              userSelect: 'none'
            }}>
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={handleContentChange} />
        <HistoryPlugin />
      </LexicalComposer>

      <style>
        {`
          .chat-bold { font-weight: bold; }
          .chat-italic { font-style: italic; }
          .chat-underline { text-decoration: underline; }
          .chat-strikethrough { text-decoration: line-through; }
          .chat-code { 
            font-family: 'Monaco', 'Courier New', monospace;
            background-color: ${theme.colors.surface.default};
            padding: 2px 4px;
            border-radius: 3px;
            font-size: ${theme.typography.fontSize.xs};
          }
          .chat-code-block {
            font-family: 'Monaco', 'Courier New', monospace;
            background-color: ${theme.colors.surface.default};
            padding: ${theme.spacing[2]};
            border-radius: ${theme.borderRadius.sm};
            margin: ${theme.spacing[1]} 0;
            border-left: 3px solid ${theme.colors.primary.brand};
          }
          .chat-quote {
            margin: ${theme.spacing[1]} 0;
            padding-left: ${theme.spacing[3]};
            border-left: 3px solid ${theme.colors.surface.border};
            color: ${theme.colors.text.secondary};
            font-style: italic;
          }
          .chat-link {
            color: ${theme.colors.primary.brand};
            text-decoration: underline;
            cursor: pointer;
          }
          .chat-list-ul, .chat-list-ol {
            margin: ${theme.spacing[1]} 0;
            padding-left: ${theme.spacing[4]};
          }
          .chat-listitem {
            margin: ${theme.spacing[1]} 0;
          }
        `}
      </style>
    </div>
  );
};

export default RichTextEditor;