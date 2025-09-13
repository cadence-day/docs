import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';
import useDialogStore from '@/shared/stores/useDialogStore';
import useTranslation from '@/shared/hooks/useI18n';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';
import { profileStyles } from '../styles';
import { CustomerSupportDialogProps } from '../types';

interface CustomerSupportDialogComponentProps extends CustomerSupportDialogProps {
  _dialogId?: string;
}

export const CustomerSupportDialog: React.FC<CustomerSupportDialogComponentProps> = ({
  userId,
  userEmail,
  appVersion,
  buildNumber,
  _dialogId
}) => {
  const { t } = useTranslation();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(t('common.error'), t('profile.support.message-required'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create Sentry issue with support context
      Sentry.withScope((scope) => {
        scope.setTag('support_request', true);
        scope.setTag('category', category);
        scope.setContext('user_info', {
          userId,
          email: userEmail,
          appVersion,
          buildNumber
        });
        scope.setLevel('info');
        
        Sentry.captureMessage(`Support Request: ${category}`, 'info');
      });

      // Also log to our error handler for tracking
      GlobalErrorHandler.logError(
        new Error(`Support request: ${category}`),
        'CUSTOMER_SUPPORT_REQUEST',
        {
          userId,
          email: userEmail,
          message: message.trim(),
          category,
          appVersion,
          buildNumber
        }
      );

      Alert.alert(
        t('profile.support.success'),
        t('profile.support.success-message'),
        [{ 
          text: t('common.ok'), 
          onPress: () => {
            if (_dialogId) {
              closeDialog(_dialogId);
            }
          }
        }]
      );
      
    } catch (error) {
      GlobalErrorHandler.logError(error, 'SUPPORT_REQUEST_FAILED', { userId });
      Alert.alert(t('common.error'), t('profile.support.error-message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { key: 'general', label: t('profile.support.general') },
    { key: 'bug', label: t('profile.support.bug') },
    { key: 'feature', label: t('profile.support.feature') },
  ] as const;

  return (
    <View style={profileStyles.supportFormContainer}>
      <Text style={profileStyles.fieldLabel}>
        {t('profile.support.category')}
      </Text>
      
      <View style={profileStyles.categorySelector}>
        {categories.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              profileStyles.categoryButton,
              category === key && profileStyles.categoryButtonActive
            ]}
            onPress={() => setCategory(key)}
          >
            <Text style={[
              profileStyles.categoryButtonText,
              category === key && profileStyles.categoryButtonTextActive
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={profileStyles.fieldLabel}>
        {t('profile.support.message')}
      </Text>
      
      <TextInput
        style={profileStyles.messageInput}
        multiline
        placeholder={t('profile.support.message-placeholder')}
        value={message}
        onChangeText={setMessage}
        editable={!isSubmitting}
      />
      
      <TouchableOpacity
        style={[
          profileStyles.submitButton,
          isSubmitting && profileStyles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={profileStyles.submitButtonText}>
          {isSubmitting ? t('common.submitting') : t('profile.support.submit')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};