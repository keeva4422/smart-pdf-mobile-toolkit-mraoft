
# AI Chatbot Feature Guide

## Overview

The SmartPDF Toolkit now includes an intelligent AI chatbot assistant that helps users with:

- **Document Analysis**: Analyze and understand PDF content
- **Summarization**: Generate comprehensive summaries with key points
- **Revision Questions**: Create study questions based on document content
- **App Guidance**: Get help using app features
- **Interactive Q&A**: Ask questions about your documents

## Features

### 1. Multi-Provider Support
- **OpenAI GPT-4o-mini**: Fast, accurate responses
- **Google Gemini Pro**: Alternative AI provider
- Switch between providers in real-time

### 2. Context-Aware Conversations
- Maintains conversation history
- Understands document context
- Provides relevant, accurate responses

### 3. Quick Actions
When a document is loaded with OCR text, users get quick action buttons:
- **Summarize**: Generate comprehensive summary
- **Questions**: Create 5 revision questions
- **Key Points**: Extract important points
- **Explain**: Simplify complex concepts

### 4. Document Integration
- Automatically includes OCR-extracted text
- Links conversations to specific documents
- Persistent conversation history

## Usage

### Accessing the Chatbot

1. **From Home Screen**: Tap the message icon in the header
2. **From Viewer**: Tap the "Chat" button in the action bar
3. **Direct Navigation**: Navigate to `/chat` route

### Starting a Conversation

```typescript
// Example: Opening chat from any screen
router.push('/chat');

// With document context
router.push({
  pathname: '/chat',
  params: { documentId: currentDocument.id }
});
```

### Quick Actions

Users can tap quick action buttons to:
- Generate summaries
- Create revision questions
- Extract key points
- Get explanations

## Technical Implementation

### Database Schema

```sql
-- Conversations table
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  document_id UUID REFERENCES pdf_documents(id),
  metadata JSONB,
  created_at TIMESTAMPTZ
);
```

### Edge Function

The `chat-assistant` edge function:
- Authenticates users
- Manages conversation context
- Calls AI providers (OpenAI/Gemini)
- Stores messages in database
- Returns formatted responses

### API Usage

```typescript
const { data, error } = await supabase.functions.invoke('chat-assistant', {
  body: {
    message: 'Summarize this document',
    conversationId: 'optional-conversation-id',
    documentId: 'optional-document-id',
    documentText: 'extracted text from OCR',
    provider: 'openai', // or 'gemini'
    history: previousMessages,
  },
});
```

## Best Practices

### For Users

1. **Run OCR First**: For best results, extract text from PDFs before asking questions
2. **Be Specific**: Ask clear, specific questions for better responses
3. **Use Quick Actions**: Leverage pre-built prompts for common tasks
4. **Switch Providers**: Try different AI providers if one doesn't meet your needs

### For Developers

1. **Error Handling**: Always handle API errors gracefully
2. **Rate Limiting**: Implement rate limiting for API calls
3. **Context Management**: Keep conversation history manageable (last 10 messages)
4. **Text Truncation**: Limit document text to 10,000 characters
5. **Caching**: Cache responses when appropriate

## Configuration

### Environment Variables

Required in Supabase Edge Functions:
- `OPENAI_API_KEY`: OpenAI API key
- `GEMINI_API_KEY`: Google Gemini API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key

### API Keys Setup

1. **OpenAI**: Get key from https://platform.openai.com/api-keys
2. **Gemini**: Get key from https://makersuite.google.com/app/apikey

Add to Supabase:
```bash
supabase secrets set OPENAI_API_KEY=your_key_here
supabase secrets set GEMINI_API_KEY=your_key_here
```

## Troubleshooting

### Common Issues

**1. "No AI provider configured" error**
- Ensure API keys are set in Supabase secrets
- Verify edge function has access to environment variables

**2. Slow responses**
- Check network connection
- Try switching AI providers
- Reduce document text length

**3. Context not loading**
- Ensure OCR has been run on the document
- Check that document text is being passed correctly

**4. Conversation not saving**
- Verify user is authenticated
- Check database RLS policies
- Review edge function logs

## Future Enhancements

Planned features:
- Voice input/output
- Multi-document analysis
- Export conversations
- Conversation search
- Custom AI prompts
- Fine-tuned models
- Offline mode with local AI

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review edge function logs in Supabase
3. Verify API key configuration
4. Check network connectivity

## Security

- All conversations are user-specific (RLS enabled)
- API keys stored securely in Supabase
- Messages encrypted in transit
- No data shared between users
- Automatic session management
