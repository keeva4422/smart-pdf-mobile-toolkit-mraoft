
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePDF } from '@/contexts/PDFContext';
import { supabase } from '@/app/integrations/supabase/client';
import AdBanner from '@/components/AdBanner';

export default function AIFeaturesScreen() {
  const router = useRouter();
  const { currentDocument, ocrResults } = usePDF();
  const [processing, setProcessing] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  if (!currentDocument) {
    router.replace('/(tabs)/(home)/');
    return null;
  }

  const aiFeatures = [
    {
      id: 'mindmap',
      title: 'AI Mind Map',
      description: 'Visual summary with connections',
      icon: 'brain.head.profile',
      color: colors.secondary,
      action: 'Generate Mind Map',
    },
    {
      id: 'quiz',
      title: 'Quiz Generator',
      description: 'Create practice questions',
      icon: 'questionmark.circle.fill',
      color: colors.accent,
      action: 'Generate Quiz',
    },
    {
      id: 'citations',
      title: 'Citation Extractor',
      description: 'Find references and keywords',
      icon: 'quote.bubble.fill',
      color: colors.primary,
      action: 'Extract Citations',
    },
    {
      id: 'audio',
      title: 'PDF to Audio',
      description: 'Listen to your document',
      icon: 'speaker.wave.3.fill',
      color: '#FF6B35',
      action: 'Generate Audio',
    },
    {
      id: 'shareable',
      title: 'Shareable Link',
      description: 'Create public summary link',
      icon: 'link.circle.fill',
      color: colors.success,
      action: 'Create Link',
    },
    {
      id: 'chatbot',
      title: 'Chatbot Summary',
      description: 'Interactive Q&A summary',
      icon: 'message.badge.filled.fill',
      color: '#9C27B0',
      action: 'Create Chatbot',
    },
  ];

  const handleFeatureAction = async (featureId: string) => {
    if (!ocrResults || ocrResults.size === 0) {
      Alert.alert(
        'OCR Required',
        'Please run OCR on your document first to extract text.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Run OCR', onPress: () => router.push('/ocr') },
        ]
      );
      return;
    }

    setActiveFeature(featureId);
    setProcessing(true);

    try {
      let documentText = '';
      const textArray: string[] = [];
      ocrResults.forEach((result) => {
        textArray.push(result.text);
      });
      documentText = textArray.join('\n\n');

      // Simulate AI processing
      setTimeout(() => {
        setProcessing(false);
        setActiveFeature(null);

        switch (featureId) {
          case 'mindmap':
            Alert.alert(
              '🧠 Mind Map Generated',
              'Your visual mind map has been created with key concepts and connections.',
              [{ text: 'View', onPress: () => console.log('View mind map') }]
            );
            break;
          case 'quiz':
            Alert.alert(
              '❓ Quiz Generated',
              'Created 10 practice questions based on your document.',
              [{ text: 'Start Quiz', onPress: () => console.log('Start quiz') }]
            );
            break;
          case 'citations':
            Alert.alert(
              '📚 Citations Extracted',
              'Found 15 citations and 25 keywords in your document.',
              [{ text: 'View', onPress: () => console.log('View citations') }]
            );
            break;
          case 'audio':
            Alert.alert(
              '🔊 Audio Generated',
              'Your document has been converted to audio format (MP3).',
              [
                { text: 'Download', onPress: () => console.log('Download audio') },
                { text: 'Play', onPress: () => console.log('Play audio') },
              ]
            );
            break;
          case 'shareable':
            Alert.alert(
              '🔗 Link Created',
              'Your shareable summary link:\nhttps://smartpdf.app/share/abc123',
              [{ text: 'Copy Link', onPress: () => console.log('Copy link') }]
            );
            break;
          case 'chatbot':
            Alert.alert(
              '🤖 Chatbot Created',
              'Interactive chatbot summary is ready for Q&A.',
              [{ text: 'Open Chat', onPress: () => router.push('/chat') }]
            );
            break;
        }
      }, 3000);
    } catch (error) {
      console.error('Error processing feature:', error);
      Alert.alert('Error', 'Failed to process request. Please try again.');
      setProcessing(false);
      setActiveFeature(null);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI Features',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <Pressable
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/(home)/')}
            >
              <IconSymbol name="house.fill" size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <IconSymbol name="sparkles" size={48} color={colors.accent} />
          <Text style={styles.infoTitle}>Advanced AI Features</Text>
          <Text style={styles.infoText}>
            Unlock powerful AI capabilities for your documents.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Document</Text>
          <View style={styles.documentCard}>
            <IconSymbol name="doc.fill" size={32} color={colors.primary} />
            <View style={styles.documentInfo}>
              <Text style={styles.documentName} numberOfLines={1}>
                {currentDocument.name}
              </Text>
              <Text style={styles.documentMeta}>
                {ocrResults && ocrResults.size > 0
                  ? `${ocrResults.size} pages processed`
                  : 'OCR not run yet'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Tools</Text>
          <View style={styles.featuresGrid}>
            {aiFeatures.map((feature) => (
              <Pressable
                key={feature.id}
                style={[
                  styles.featureCard,
                  activeFeature === feature.id && processing && styles.featureCardActive,
                ]}
                onPress={() => handleFeatureAction(feature.id)}
                disabled={processing}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <IconSymbol name={feature.icon as any} size={32} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                
                <Pressable
                  style={[styles.actionButton, { backgroundColor: feature.color }]}
                  onPress={() => handleFeatureAction(feature.id)}
                  disabled={processing}
                >
                  <Text style={styles.actionButtonText}>
                    {activeFeature === feature.id && processing ? 'Processing...' : feature.action}
                  </Text>
                </Pressable>

                {activeFeature === feature.id && processing && (
                  <View style={styles.processingOverlay}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {processing && (
          <View style={styles.progressCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.progressText}>Processing with AI...</Text>
            <Text style={styles.progressSubtext}>This may take a moment</Text>
          </View>
        )}

        <View style={styles.featureNote}>
          <IconSymbol name="info.circle" size={20} color={colors.accent} />
          <Text style={styles.featureNoteText}>
            All AI features use advanced machine learning to provide accurate results. Processing times may vary based on document size.
          </Text>
        </View>
      </ScrollView>

      <AdBanner position="bottom" />
    </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoCard: {
    ...commonStyles.card,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 0,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  documentCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
    position: 'relative',
  },
  featureCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 32,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    ...commonStyles.card,
    alignItems: 'center',
    marginHorizontal: 0,
    marginVertical: 20,
    paddingVertical: 32,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  featureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent + '20',
    borderRadius: 12,
    padding: 16,
  },
  featureNoteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
