import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ContentPreviewProps {
  content: string;
  contentType: 'text' | 'markdown' | 'latex';
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content, contentType }) => {
  if (!content.trim()) {
    return (
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography color="text.secondary" variant="body2">
          Preview will appear here...
        </Typography>
      </Paper>
    );
  }

  if (contentType === 'text') {
    return (
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography>{content}</Typography>
      </Paper>
    );
  }

  if (contentType === 'markdown' || contentType === 'latex') {
    return (
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, overflow: 'auto' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code(props) {
              const {node, className, children, ...rest} = props;
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match;
              return !inline ? (
                <Box
                  component="pre"
                  sx={{
                    bgcolor: 'grey.900',
                    color: 'common.white',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    '& code': {
                      fontFamily: 'monospace'
                    }
                  }}
                >
                  <code className={className} {...rest}>
                    {children}
                  </code>
                </Box>
              ) : (
                <Box
                  component="code"
                  sx={{
                    bgcolor: 'grey.200',
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontFamily: 'monospace'
                  }}
                  {...rest}
                >
                  {children}
                </Box>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </Paper>
    );
  }

  return null;
};

export default ContentPreview;
