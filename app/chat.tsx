
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const EMOJI_SHORTCUTS = ['👍', '❤️', '😊', '🎉', '🤔', '📚', '✅', '💡'];

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentDocument, ocrResults } = usePDF();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [provider, setProvider] = useState<'openai' | 'gemini'>('openai');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (params.conversationId) {
      loadConversation(params.conversationId as string);
    } else {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! 👋 I'm your SmartPDF assistant. I can help you with:

• 📄 Understanding app features
• 🔍 Analyzing and summarizing documents
• 🎯 Extracting key points
• ❓ Creating revision questions
• 💬 Answering questions about your PDFs

How can I help you today?`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [params.conversationId]);

  const loadConversation = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const loadedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at).getTime(),
        }));
        setMessages(loadedMessages);
        setConversationId(convId);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setShowEmojiPicker(false);

    try {
      let documentText = '';
      if (currentDocument && ocrResults && ocrResults.size > 0) {
        const textArray: string[] = [];
        ocrResults.forEach((result) => {
          textArray.push(result.text);
        });
        documentText = textArray.join('\n\n');
      }

      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: userMessage.content,
          conversationId: conversationId,
          documentId: currentDocument?.id,
          documentText: documentText,
          provider: provider,
          history: history,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let prompt = '';
    switch (action) {
      case 'summarize':
        prompt = '📝 Please provide a comprehensive summary of this document with key points and main takeaways.';
        break;
      case 'questions':
        prompt = '❓ Generate 5 revision questions based on this document to test understanding.';
        break;
      case 'keypoints':
        prompt = '🎯 Extract and list the most important key points from this document.';
        break;
      case 'explain':
        prompt = '💡 Explain the main concepts in this document in simple terms.';
        break;
    }
    setInputText(prompt);
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: 'AI Assistant',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <Pressable
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/(home)/')}
            >
              <IconSymbol name="house.fill" size={22} color={colors.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <Pressable
                style={[styles.providerButton, provider === 'openai' && styles.providerButtonActive]}
                onPress={() => setProvider('openai')}
              >
                <Text style={[styles.providerText, provider === 'openai' && styles.providerTextActive]}>
                  GPT
                </Text>
              </Pressable>
              <Pressable
                style={[styles.providerButton, provider === 'gemini' && styles.providerButtonActive]}
                onPress={() => setProvider('gemini')}
              >
                <Text style={[styles.providerText, provider === 'gemini' && styles.providerTextActive]}>
                  Gemini
                </Text>
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {currentDocument && (
          <View style={styles.documentBanner}>
            <IconSymbol name="doc.fill" size={20} color={colors.primary} />
            <Text style={styles.documentBannerText} numberOfLines={1}>
              Analyzing: {currentDocument.name}
            </Text>
          </View>
        )}

        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <View style={styles.messageHeader}>
              <IconSymbol
                name={message.role === 'user' ? 'person.fill' : 'sparkles'}
                size={16}
                color={message.role === 'user' ? '#FFFFFF' : colors.accent}
              />
              <Text style={[styles.messageRole, message.role === 'user' && styles.userMessageRole]}>
                {message.role === 'user' ? 'You' : 'Assistant'}
              </Text>
            </View>
            <Text style={[styles.messageText, message.role === 'user' && styles.userMessageText]}>
              {message.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        {currentDocument && ocrResults && ocrResults.size > 0 && messages.length <= 1 && (
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Actions:</Text>
            <View style={styles.quickActionsGrid}>
              <Pressable
                style={styles.quickActionButton}
                onPress={() => handleQuickAction('summarize')}
              >
                <IconSymbol name="doc.text" size={20} color={colors.primary} />
                <Text style={styles.quickActionText}>Summarize</Text>
              </Pressable>
              <Pressable
                style={styles.quickActionButton}
                onPress={() => handleQuickAction('questions')}
              >
                <IconSymbol name="questionmark.circle" size={20} color={colors.accent} />
                <Text style={styles.quickActionText}>Questions</Text>
              </Pressable>
              <Pressable
                style={styles.quickActionButton}
                onPress={() => handleQuickAction('keypoints')}
              >
                <IconSymbol name="list.bullet" size={20} color={colors.secondary} />
                <Text style={styles.quickActionText}>Key Points</Text>
              </Pressable>
              <Pressable
                style={styles.quickActionButton}
                onPress={() => handleQuickAction('explain')}
              >
                <IconSymbol name="lightbulb" size={20} color={colors.warning} />
                <Text style={styles.quickActionText}>Explain</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {showEmojiPicker && (
        <View style={styles.emojiPicker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {EMOJI_SHORTCUTS.map((emoji, index) => (
              <Pressable
                key={index}
                style={styles.emojiButton}
                onPress={() => addEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Pressable
          style={styles.emojiToggle}
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Text style={styles.emojiToggleText}>😊</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          editable={!loading}
          onSubmitEditing={sendMessage}
        />
        <Pressable
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <IconSymbol
            name="arrow.up.circle.fill"
            size={40}
            color={!inputText.trim() || loading ? colors.textSecondary : colors.primary}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginLeft: 12,
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  providerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  providerButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  providerTextActive: {
    color: '#FFFFFF',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  documentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  documentBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  userMessageRole: {
    color: '#FFFFFF',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  quickActions: {
    marginTop: 8,
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  emojiPicker: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  emojiButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emojiText: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  emojiToggle: {
    padding: 8,
    justifyContent: 'center',
  },
  emojiToggleText: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
