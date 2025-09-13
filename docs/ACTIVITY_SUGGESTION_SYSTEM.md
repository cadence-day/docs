# Activity Suggestion System Documentation

## Overview

The Activity Suggestion System is an AI-powered feature that identifies user personas based on lifestyle, work patterns, and personal circumstances, then uses Claude AI to generate personalized activity suggestions. The system provides intelligent recommendations through interactive dialogs and seamlessly integrates with the existing activity management system.

## Core Concepts

### User Personas

The system identifies six distinct lifestyle-based personas:

1. **Freelancer**: Flexible schedule, self-directed work, location independence
2. **9-5 Employee**: Structured schedule, commute considerations, office environment
3. **Hybrid Worker**: Mix of remote/office work, varying schedules, adaptability needs
4. **Depression Support**: Gentle activities, mood-focused, emphasis on small achievable wins
5. **Artist/Creative**: Inspiration-driven work, creative blocks, artistic pursuits
6. **Athletic/Fitness**: Physical activities, training schedules, performance-oriented goals

### Rest Activity

A special system-generated activity that:

- Spans from sleep time to wake time
- Automatically adjusts when user changes sleep/wake preferences
- Cannot be manually deleted (only disabled)
- Uses a distinct visual style to differentiate from user activities

### Claude AI Integration

The system leverages Claude AI for intelligent activity generation with structured output:

- **Contextual Understanding**: Analyzes user persona, existing activities, and preferences
- **Structured Response Format**: Returns activities with proper formatting for easy integration
- **Personalization**: Considers user's lifestyle, work schedule, and personal circumstances
- **Progressive Enhancement**: Learns from user acceptance/rejection patterns

### Activity Generation Process

1. **Context Analysis**: Examine user's persona, current activities, and patterns
2. **AI Prompting**: Send structured prompt to Claude with user context
3. **Response Processing**: Parse Claude's structured output into activity objects
4. **User Presentation**: Display suggestions in CdDialog with "Add" buttons
5. **Integration**: Seamlessly add accepted activities to user's activity list

## Architecture

### Service Layer

````typescript
// features/profile/services/PersonaService.ts
export interface UserPersona {
  type: 'freelancer' | 'employee' | 'hybrid' | 'depression' | 'artist' | 'athletic';
  suggestedActivities: string[];
  locale: string;
  confidence: number; // 0-1 score indicating confidence in persona detection
  detectedAt: string; // ISO timestamp
  questionnaireBased: boolean; // True if detected via questionnaire vs behavioral analysis
}

export interface RestActivity {
  id: string;
  name: string;
  color: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  isSystemGenerated: boolean;
  isRestPeriod: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class PersonaService {
  /**
   * Detects user persona through questionnaire or behavioral analysis
   */
  static async detectPersona(userId: string): Promise<UserPersona> {
    // Check if persona is already detected and stored
    const existingPersona = await this.getStoredPersona(userId);
    if (existingPersona) return existingPersona;

    // Launch persona questionnaire dialog
    return await this.launchPersonaQuestionnaire();
  }

  private static async launchPersonaQuestionnaire(): Promise<UserPersona> {
    return new Promise((resolve) => {
      DialogHost.openDialog('PersonaQuestionnaireDialog', {
        onPersonaDetected: (persona: UserPersona['type']) => {
          const userPersona: UserPersona = {
            type: persona,
            suggestedActivities: this.getSuggestedActivities(persona),
            locale: 'en', // Get from user settings
            confidence: 0.9, // High confidence for questionnaire-based detection
            detectedAt: new Date().toISOString(),
            questionnaireBased: true
          };
          this.storePersona(userPersona);
          resolve(userPersona);
        }
      });
    });
  }

  private static getSuggestedActivities(persona: UserPersona['type']): string[] {
    const activityMap: Record<UserPersona['type'], string[]> = {
      freelancer: ['Client Work', 'Skill Development', 'Networking', 'Admin Tasks', 'Creative Projects'],
      employee: ['Daily Tasks', 'Meetings', 'Email Management', 'Team Collaboration', 'Professional Development'],
      hybrid: ['Remote Work Focus', 'Office Collaboration', 'Video Calls', 'Flexible Planning', 'Location Transition'],
      depression: ['Self Care', 'Gentle Movement', 'Mindfulness', 'Small Achievements', 'Mood Tracking'],
      artist: ['Creative Practice', 'Inspiration Gathering', 'Skill Building', 'Portfolio Work', 'Art Business'],
      athletic: ['Training Session', 'Nutrition Planning', 'Recovery Time', 'Performance Analysis', 'Goal Setting']
    };

    return activityMap[persona] || [];
  }
  }

  /**
   * Stores persona data in user profile
   */
  private static async storePersona(persona: UserPersona): Promise<void> {
    const profileStore = useProfileStore.getState();
    await profileStore.updateProfile({ persona });
  }

  /**
   * Retrieves stored persona data
   */
  private static async getStoredPersona(userId: string): Promise<UserPersona | null> {
    const profileStore = useProfileStore.getState();
    return profileStore.profile?.persona || null;
  }
}

### Claude AI Activity Suggestion Service

```typescript
// features/activity/services/ClaudeActivityService.ts
export interface SuggestedActivity {
  name: string;
  description: string;
  category: string;
  estimatedDuration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  tags: string[];
}

export interface ActivitySuggestionRequest {
  persona: UserPersona['type'];
  existingActivities: string[];
  preferences: {
    categories: string[];
    maxDuration: number;
    timePreferences: string[];
  };
  context?: {
    mood?: string;
    energy?: string;
    availableTime?: number;
  };
}

export class ClaudeActivityService {
  private static apiKey = SECRETS.CLAUDE_API_KEY;
  private static baseUrl = 'https://api.anthropic.com/v1/messages';

  /**
   * Generate activity suggestions using Claude AI
   */
  static async suggestActivities(
    request: ActivitySuggestionRequest
  ): Promise<SuggestedActivity[]> {
    try {
      const prompt = this.buildPrompt(request);
      const response = await this.callClaude(prompt);
      return this.parseClaudeResponse(response);
    } catch (error) {
      GlobalErrorHandler.logError(error, 'ClaudeActivityService.suggestActivities', {
        persona: request.persona,
        existingActivitiesCount: request.existingActivities.length
      });
      return this.getFallbackActivities(request.persona);
    }
  }

  /**
   * Build structured prompt for Claude
   */
  private static buildPrompt(request: ActivitySuggestionRequest): string {
    const personaDescriptions = {
      freelancer: 'flexible schedule, self-directed work, often working from home or various locations',
      employee: 'structured 9-5 schedule, commute to office, team collaboration focus',
      hybrid: 'mix of remote and office work, varying schedules, adaptation needs',
      depression: 'gentle approach needed, focus on small wins, mood improvement activities',
      artist: 'creative focus, inspiration-driven work, artistic skill development',
      athletic: 'physical fitness focus, performance goals, training schedules'
    };

    return `You are an expert activity coach helping someone with a ${request.persona} lifestyle (${personaDescriptions[request.persona]}).

Current situation:
- Existing activities: ${request.existingActivities.join(', ')}
- Preferred categories: ${request.preferences.categories.join(', ')}
- Max duration per activity: ${request.preferences.maxDuration} minutes
- Time preferences: ${request.preferences.timePreferences.join(', ')}
${request.context ? `- Current mood: ${request.context.mood || 'not specified'}
- Energy level: ${request.context.energy || 'not specified'}
- Available time: ${request.context.availableTime || 'not specified'} minutes` : ''}

Please suggest 5-8 activities that would be beneficial for this person. Focus on activities that:
1. Complement their existing activities (don't duplicate)
2. Match their lifestyle and persona
3. Are achievable given their constraints
4. Provide variety and balance

Format your response as a JSON array with this exact structure:
[
  {
    "name": "Activity Name",
    "description": "Brief description of what this involves",
    "category": "Work/Health/Creative/Social/Personal",
    "estimatedDuration": 30,
    "difficulty": "easy",
    "timeOfDay": "morning",
    "tags": ["tag1", "tag2"]
  }
]

Only return the JSON array, no other text.`;
  }

  /**
   * Call Claude API with prompt
   */
  private static async callClaude(prompt: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Parse Claude's response into structured activities
   */
  private static parseClaudeResponse(response: string): SuggestedActivity[] {
    try {
      // Extract JSON from response (in case Claude adds extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const activities = JSON.parse(jsonMatch[0]);

      // Validate structure
      return activities.filter((activity: any) =>
        activity.name &&
        activity.description &&
        activity.category &&
        typeof activity.estimatedDuration === 'number'
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, 'ClaudeActivityService.parseClaudeResponse', {
        response: response.substring(0, 200) // Log first 200 chars
      });
      throw new Error('Failed to parse Claude response');
    }
  }

  /**
   * Fallback activities when Claude is unavailable
   */
  private static getFallbackActivities(persona: UserPersona['type']): SuggestedActivity[] {
    const fallbackMap: Record<UserPersona['type'], SuggestedActivity[]> = {
      freelancer: [
        {
          name: 'Client Check-in',
          description: 'Quick call or email to touch base with current clients',
          category: 'Work',
          estimatedDuration: 15,
          difficulty: 'easy',
          timeOfDay: 'morning',
          tags: ['communication', 'relationship-building']
        },
        {
          name: 'Skill Development',
          description: 'Learn something new related to your field',
          category: 'Personal',
          estimatedDuration: 45,
          difficulty: 'medium',
          timeOfDay: 'flexible',
          tags: ['learning', 'growth']
        }
      ],
      employee: [
        {
          name: 'Daily Planning',
          description: 'Review schedule and priorities for the day',
          category: 'Work',
          estimatedDuration: 10,
          difficulty: 'easy',
          timeOfDay: 'morning',
          tags: ['organization', 'productivity']
        },
        {
          name: 'Team Coffee',
          description: 'Informal chat with colleagues',
          category: 'Social',
          estimatedDuration: 20,
          difficulty: 'easy',
          timeOfDay: 'afternoon',
          tags: ['networking', 'relationships']
        }
      ],
      hybrid: [
        {
          name: 'Workspace Setup',
          description: 'Organize your current work environment',
          category: 'Work',
          estimatedDuration: 15,
          difficulty: 'easy',
          timeOfDay: 'morning',
          tags: ['organization', 'productivity']
        }
      ],
      depression: [
        {
          name: 'Gentle Movement',
          description: 'Light stretching or short walk',
          category: 'Health',
          estimatedDuration: 10,
          difficulty: 'easy',
          timeOfDay: 'flexible',
          tags: ['wellness', 'gentle', 'movement']
        },
        {
          name: 'Gratitude Note',
          description: 'Write down one thing you appreciate today',
          category: 'Personal',
          estimatedDuration: 5,
          difficulty: 'easy',
          timeOfDay: 'flexible',
          tags: ['mindfulness', 'positivity']
        }
      ],
      artist: [
        {
          name: 'Quick Sketch',
          description: 'Draw something you see around you',
          category: 'Creative',
          estimatedDuration: 15,
          difficulty: 'easy',
          timeOfDay: 'flexible',
          tags: ['practice', 'observation']
        }
      ],
      athletic: [
        {
          name: 'Dynamic Warm-up',
          description: 'Prepare your body for the day ahead',
          category: 'Health',
          estimatedDuration: 10,
          difficulty: 'easy',
          timeOfDay: 'morning',
          tags: ['fitness', 'preparation']
        }
      ]
    };

    return fallbackMap[persona] || [];
  }
}
}

### Activity Suggestion Dialog System

```typescript
// features/activity/dialogs/ActivitySuggestionDialog.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { CdDialog } from '@/shared/dialogs/CdDialog';
import { ClaudeActivityService, SuggestedActivity, ActivitySuggestionRequest } from '../services/ClaudeActivityService';
import { PersonaService } from '../../profile/services/PersonaService';
import { useActivitiesStore } from '@/shared/stores/resources/activitiesStore';
import { useProfileStore } from '@/shared/stores/resources/profileStore';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';
import { COLORS } from '@/shared/constants/COLORS';

interface ActivitySuggestionDialogProps {
  onClose: () => void;
  onActivitiesAdded: (count: number) => void;
}

export const ActivitySuggestionDialog: React.FC<ActivitySuggestionDialogProps> = ({
  onClose,
  onActivitiesAdded
}) => {
  const [suggestions, setSuggestions] = useState<SuggestedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  const { activities, insertActivity } = useActivitiesStore();
  const { profile } = useProfileStore();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);

      if (!profile?.persona) {
        throw new Error('User persona not detected');
      }

      const request: ActivitySuggestionRequest = {
        persona: profile.persona.type,
        existingActivities: activities.map(a => a.name),
        preferences: {
          categories: ['Work', 'Health', 'Personal', 'Creative', 'Social'],
          maxDuration: 120,
          timePreferences: ['morning', 'afternoon', 'evening']
        }
      };

      const newSuggestions = await ClaudeActivityService.suggestActivities(request);
      setSuggestions(newSuggestions);
    } catch (error) {
      GlobalErrorHandler.logError(error, 'ActivitySuggestionDialog.loadSuggestions');
      // Show fallback suggestions or error message
    } finally {
      setLoading(false);
    }
  };

  const toggleActivitySelection = (activityName: string) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityName)) {
      newSelected.delete(activityName);
    } else {
      newSelected.add(activityName);
    }
    setSelectedActivities(newSelected);
  };

  const addSelectedActivities = async () => {
    try {
      const selectedSuggestions = suggestions.filter(s =>
        selectedActivities.has(s.name)
      );

      for (const suggestion of selectedSuggestions) {
        const activity = {
          name: suggestion.name,
          color: COLORS.activityColors[Math.floor(Math.random() * COLORS.activityColors.length)],
          description: suggestion.description,
          category: suggestion.category,
          estimatedDuration: suggestion.estimatedDuration,
          tags: suggestion.tags
        };

        await insertActivity(activity);
      }

      onActivitiesAdded(selectedSuggestions.length);
      onClose();
    } catch (error) {
      GlobalErrorHandler.logError(error, 'ActivitySuggestionDialog.addSelectedActivities');
    }
  };

  return (
    <CdDialog
      title="AI Activity Suggestions"
      subtitle={`Based on your ${profile?.persona?.type} lifestyle`}
      onClose={onClose}
      actions={[
        {
          label: 'Cancel',
          onPress: onClose,
          style: 'secondary'
        },
        {
          label: `Add ${selectedActivities.size} Activities`,
          onPress: addSelectedActivities,
          disabled: selectedActivities.size === 0,
          style: 'primary'
        }
      ]}
    >
      <ScrollView style={{ maxHeight: 400 }}>
        {loading ? (
          <Text>Generating personalized suggestions...</Text>
        ) : (
          suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionCard,
                selectedActivities.has(suggestion.name) && styles.selectedCard
              ]}
              onPress={() => toggleActivitySelection(suggestion.name)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.activityName}>{suggestion.name}</Text>
                <Text style={styles.duration}>{suggestion.estimatedDuration}min</Text>
              </View>
              <Text style={styles.description}>{suggestion.description}</Text>
              <View style={styles.tagContainer}>
                <Text style={styles.category}>{suggestion.category}</Text>
                <Text style={styles.difficulty}>{suggestion.difficulty}</Text>
                <Text style={styles.timeOfDay}>{suggestion.timeOfDay}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </CdDialog>
  );
};

const styles = StyleSheet.create({
  suggestionCard: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text
  },
  duration: {
    fontSize: 14,
    color: COLORS.textSecondary
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  category: {
    fontSize: 12,
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  difficulty: {
    fontSize: 12,
    backgroundColor: COLORS.surfaceVariant,
    color: COLORS.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  timeOfDay: {
    fontSize: 12,
    backgroundColor: COLORS.surfaceVariant,
    color: COLORS.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  }
});
````

### Persona Questionnaire Dialog

```typescript
// features/profile/dialogs/PersonaQuestionnaireDialog.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CdDialog } from '@/shared/dialogs/CdDialog';
import { UserPersona } from '../services/PersonaService';
import { COLORS } from '@/shared/constants/COLORS';

interface PersonaQuestionnaireDialogProps {
  onPersonaDetected: (persona: UserPersona['type']) => void;
  onClose: () => void;
}

interface PersonaOption {
  type: UserPersona['type'];
  title: string;
  description: string;
  characteristics: string[];
}

const personaOptions: PersonaOption[] = [
  {
    type: 'freelancer',
    title: 'Freelancer',
    description: 'I work independently with flexible schedules',
    characteristics: ['Self-directed', 'Location flexible', 'Variable income', 'Multiple clients']
  },
  {
    type: 'employee',
    title: '9-5 Employee',
    description: 'I work traditional office hours with structured schedule',
    characteristics: ['Regular schedule', 'Office environment', 'Team collaboration', 'Commute']
  },
  {
    type: 'hybrid',
    title: 'Hybrid Worker',
    description: 'I split time between remote and office work',
    characteristics: ['Mixed schedule', 'Adaptable', 'Remote + office', 'Flexible location']
  },
  {
    type: 'depression',
    title: 'Managing Depression',
    description: 'I need gentle, supportive activity suggestions',
    characteristics: ['Small steps', 'Mood support', 'Self-compassion', 'Achievable goals']
  },
  {
    type: 'artist',
    title: 'Artist/Creative',
    description: 'I focus on creative work and artistic pursuits',
    characteristics: ['Creative projects', 'Inspiration-driven', 'Artistic skills', 'Portfolio building']
  },
  {
    type: 'athletic',
    title: 'Athletic/Fitness Focused',
    description: 'I prioritize physical fitness and training',
    characteristics: ['Training schedule', 'Performance goals', 'Physical activity', 'Health focus']
  }
];

export const PersonaQuestionnaireDialog: React.FC<PersonaQuestionnaireDialogProps> = ({
  onPersonaDetected,
  onClose
}) => {
  const [selectedPersona, setSelectedPersona] = useState<UserPersona['type'] | null>(null);

  const handlePersonaSelect = (persona: UserPersona['type']) => {
    setSelectedPersona(persona);
  };

  const handleConfirm = () => {
    if (selectedPersona) {
      onPersonaDetected(selectedPersona);
    }
  };

  return (
    <CdDialog
      title="Tell us about your lifestyle"
      subtitle="This helps us suggest the right activities for you"
      onClose={onClose}
      actions={[
        {
          label: 'Skip for now',
          onPress: onClose,
          style: 'secondary'
        },
        {
          label: 'Continue',
          onPress: handleConfirm,
          disabled: !selectedPersona,
          style: 'primary'
        }
      ]}
    >
      <ScrollView style={{ maxHeight: 500 }}>
        <Text style={styles.instruction}>
          Select the option that best describes your lifestyle:
        </Text>

        {personaOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.personaCard,
              selectedPersona === option.type && styles.selectedPersonaCard
            ]}
            onPress={() => handlePersonaSelect(option.type)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.personaTitle}>{option.title}</Text>
              {selectedPersona === option.type && (
                <View style={styles.checkmark}>✓</View>
              )}
            </View>
            <Text style={styles.personaDescription}>{option.description}</Text>
            <View style={styles.characteristicsList}>
              {option.characteristics.map((char, index) => (
                <Text key={index} style={styles.characteristic}>• {char}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </CdDialog>
  );
};

const styles = StyleSheet.create({
  instruction: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center'
  },
  personaCard: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border
  },
  selectedPersonaCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  personaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    fontWeight: 'bold'
  },
  personaDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8
  },
  characteristicsList: {
    marginTop: 4
  },
  characteristic: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginVertical: 2
  }
});
```

timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
estimatedDuration?: number; // minutes
}

export class ActivitySuggestionService {
/\*\*

- Generates activity suggestions for a user based on their persona
  \*/
  static async generateSuggestions(
  persona: UserPersona,
  existingActivities: Activity[],
  maxSuggestions: number = 8
  ): Promise<ActivitySuggestion[]> {
  try {
  const allSuggestions = this.getPersonaBasedSuggestions(persona);
  const filteredSuggestions = this.filterExistingActivities(allSuggestions, existingActivities);
  const prioritizedSuggestions = this.prioritizeSuggestions(filteredSuggestions, persona);
  return prioritizedSuggestions.slice(0, maxSuggestions);
  } catch (error) {
  GlobalErrorHandler.logError(error, 'ACTIVITY_SUGGESTION_GENERATION_FAILED', {
  personaType: persona.type,
  existingActivitiesCount: existingActivities.length
  });
  return [];
  }
  }

/\*\*

- Creates actual Activity objects from suggestions
  \*/
  static async createActivitiesFromSuggestions(
  suggestions: ActivitySuggestion[],
  userId: string
  ): Promise<Activity[]> {
  const activities: Activity[] = [];

  for (const suggestion of suggestions) {
  try {
  const activity: Partial<Activity> = {
  name: suggestion.name,
  color: suggestion.suggestedColor,
  isActive: false, // User needs to explicitly enable
  createdBy: userId,
  isSystemSuggested: true,
  metadata: {
  category: suggestion.category,
  timeOfDay: suggestion.timeOfDay,
  estimatedDuration: suggestion.estimatedDuration,
  priority: suggestion.priority,
  description: suggestion.description
  }
  };

        // Use the existing activity creation logic
        const createdActivity = await useActivitiesStore.getState().insertActivity(activity);
        if (createdActivity) {
          activities.push(createdActivity);

### Integration Hooks

```typescript
// features/profile/hooks/usePersonaDetection.ts
import { useEffect, useState } from "react";
import { PersonaService, UserPersona } from "../services/PersonaService";
import { useProfileStore } from "@/shared/stores/resources/profileStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

export const usePersonaDetection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile, updateProfile } = useProfileStore();

  const detectPersona = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const persona = await PersonaService.detectPersona(userId);
      await updateProfile({ persona });

      return persona;
    } catch (error) {
      const errorMessage = "Failed to detect user persona";
      setError(errorMessage);
      GlobalErrorHandler.logError(error, "usePersonaDetection.detectPersona", {
        userId,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    persona: profile?.persona,
    detectPersona,
    isLoading,
    error,
  };
};

// features/activity/hooks/useActivitySuggestions.ts
import { useState, useCallback } from "react";
import {
  ClaudeActivityService,
  SuggestedActivity,
  ActivitySuggestionRequest,
} from "../services/ClaudeActivityService";
import { useActivitiesStore } from "@/shared/stores/resources/activitiesStore";
import { useProfileStore } from "@/shared/stores/resources/profileStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

export const useActivitySuggestions = () => {
  const [suggestions, setSuggestions] = useState<SuggestedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { activities, insertActivity } = useActivitiesStore();
  const { profile } = useProfileStore();

  const generateSuggestions = useCallback(
    async (context?: {
      mood?: string;
      energy?: string;
      availableTime?: number;
    }) => {
      if (!profile?.persona) {
        setError("User persona not detected");
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);

        const request: ActivitySuggestionRequest = {
          persona: profile.persona.type,
          existingActivities: activities.map((a) => a.name),
          preferences: {
            categories: ["Work", "Health", "Personal", "Creative", "Social"],
            maxDuration: 120,
            timePreferences: ["morning", "afternoon", "evening"],
          },
          context,
        };

        const newSuggestions =
          await ClaudeActivityService.suggestActivities(request);
        setSuggestions(newSuggestions);
        return newSuggestions;
      } catch (error) {
        const errorMessage = "Failed to generate activity suggestions";
        setError(errorMessage);
        GlobalErrorHandler.logError(
          error,
          "useActivitySuggestions.generateSuggestions",
          {
            persona: profile?.persona?.type,
          }
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [profile?.persona, activities]
  );

  const addActivityFromSuggestion = useCallback(
    async (suggestion: SuggestedActivity) => {
      try {
        const activity = {
          name: suggestion.name,
          color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
          description: suggestion.description,
          category: suggestion.category,
          estimatedDuration: suggestion.estimatedDuration,
          tags: suggestion.tags,
        };

        return await insertActivity(activity);
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "useActivitySuggestions.addActivityFromSuggestion",
          {
            suggestionName: suggestion.name,
          }
        );
        throw error;
      }
    },
    [insertActivity]
  );

  return {
    suggestions,
    generateSuggestions,
    addActivityFromSuggestion,
    isLoading,
    error,
  };
};
```

## Dialog Registration

### Register dialogs in the dialog system

```typescript
// shared/dialogs/dialogRegistry.ts
import { ActivitySuggestionDialog } from "@/features/activity/dialogs/ActivitySuggestionDialog";
import { PersonaQuestionnaireDialog } from "@/features/profile/dialogs/PersonaQuestionnaireDialog";

export const dialogRegistry = {
  // ... existing dialogs
  ActivitySuggestionDialog,
  PersonaQuestionnaireDialog,
  // ... other dialogs
};

export type DialogName = keyof typeof dialogRegistry;
```

## Usage Examples

### Triggering Persona Detection on First Launch

```typescript
// In ProfileScreen.tsx or onboarding flow
const { detectPersona, isLoading } = usePersonaDetection();
const { user } = useAuth();

useEffect(() => {
  if (user && !profile?.persona) {
    detectPersona(user.id);
  }
}, [user, profile?.persona]);
```

### Showing Activity Suggestions

```typescript
// In Activities screen or settings
import { DialogHost } from "@/shared/dialogs/DialogHost";

const showActivitySuggestions = () => {
  DialogHost.openDialog("ActivitySuggestionDialog", {
    onActivitiesAdded: (count: number) => {
      // Show success message
      console.log(`Added ${count} new activities`);
    },
  });
};
```

### Manual Persona Selection

```typescript
const changePersona = () => {
  DialogHost.openDialog("PersonaQuestionnaireDialog", {
    onPersonaDetected: async (persona: UserPersona["type"]) => {
      // Update profile with new persona
      await updateProfile({
        persona: {
          type: persona,
          suggestedActivities: PersonaService.getSuggestedActivities(persona),
          locale: "en",
          confidence: 0.9,
          detectedAt: new Date().toISOString(),
          questionnaireBased: true,
        },
      });
    },
  });
};
```

## Configuration

### Environment Variables

Add to `shared/constants/SECRETS.ts`:

```typescript
export const SECRETS = {
  // ... existing secrets
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || "",
  // ... other secrets
};
```

### Required Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0"
  }
}
```

## Error Handling

The system includes comprehensive error handling:

- **API Failures**: Falls back to predefined suggestions when Claude is unavailable
- **Invalid Responses**: Validates Claude responses and handles malformed JSON
- **Network Issues**: Implements retry logic with exponential backoff
- **User Errors**: Provides clear feedback for user-facing issues

## Privacy Considerations

- **Data Minimization**: Only sends necessary context to Claude AI
- **Local Storage**: Persona data is stored locally and encrypted
- **User Control**: Users can opt out of AI suggestions and change persona anytime
- **Transparency**: Clear communication about data usage and AI integration

## Future Enhancements

1. **Learning from User Behavior**: Track which suggestions users accept/reject
2. **Contextual Suggestions**: Consider time of day, weather, calendar events
3. **Collaborative Filtering**: Learn from similar users' activity patterns
4. **Multi-language Support**: Expand persona questionnaire to multiple languages
5. **Integration with Wearables**: Use activity data from fitness trackers for better suggestions

export const usePersonaDetection = () => {
const { settings } = useProfileStore();
const [persona, setPersona] = useState<UserPersona | null>(null);
const [isDetecting, setIsDetecting] = useState(false);
const [lastDetected, setLastDetected] = useState<string | null>(null);

useEffect(() => {
const detectPersona = async () => {
if (!settings.wakeTime || !settings.sleepTime) return;

      const cacheKey = `${settings.wakeTime}-${settings.sleepTime}`;
      if (cacheKey === lastDetected) return; // Avoid redundant detection

      setIsDetecting(true);

      try {
        const detectedPersona = await PersonaService.detectPersona(
          settings.wakeTime,
          settings.sleepTime,
          'en-US' // TODO: Get from user locale
        );

        setPersona(detectedPersona);
        setLastDetected(cacheKey);

      } catch (error) {
        GlobalErrorHandler.logError(error, 'PERSONA_DETECTION_FAILED', {
          wakeTime: settings.wakeTime,
          sleepTime: settings.sleepTime
        });
      } finally {
        setIsDetecting(false);
      }
    };

    detectPersona();

}, [settings.wakeTime, settings.sleepTime, lastDetected]);

return {
persona,
isDetecting,
redetect: () => setLastDetected(null) // Force re-detection
};
};

````

```typescript
// features/profile/hooks/useActivitySuggestions.ts
import { useEffect, useState } from 'react';
import { ActivitySuggestionService, ActivitySuggestion } from '../services/ActivitySuggestionService';
import { useActivitiesStore } from '@/shared/stores/resources/activitiesStore';
import { UserPersona } from '../services/PersonaService';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';

export const useActivitySuggestions = (persona: UserPersona | null) => {
  const { activities } = useActivitiesStore();
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!persona) return;

      setIsGenerating(true);

      try {
        const newSuggestions = await ActivitySuggestionService.generateSuggestions(
          persona,
          activities,
          8 // Max suggestions
        );

        setSuggestions(newSuggestions);

      } catch (error) {
        GlobalErrorHandler.logError(error, 'ACTIVITY_SUGGESTIONS_GENERATION_FAILED', {
          personaType: persona.type,
          activitiesCount: activities.length
        });
      } finally {
        setIsGenerating(false);
      }
    };

    generateSuggestions();
  }, [persona, activities]);

  const createActivitiesFromSuggestions = async (
    selectedSuggestions: ActivitySuggestion[],
    userId: string
  ) => {
    try {
      return await ActivitySuggestionService.createActivitiesFromSuggestions(
        selectedSuggestions,
        userId
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, 'CREATE_ACTIVITIES_FROM_SUGGESTIONS_FAILED', {
        suggestionsCount: selectedSuggestions.length,
        userId
      });
      return [];
    }
  };

  return {
    suggestions,
    isGenerating,
    createActivitiesFromSuggestions
  };
};
````

## Integration with Profile Screen

```typescript
// In ProfileScreen component
import { usePersonaDetection } from "../hooks/usePersonaDetection";
import { useActivitySuggestions } from "../hooks/useActivitySuggestions";
import { ActivitySuggestionService } from "../services/ActivitySuggestionService";

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { persona } = usePersonaDetection();
  const { suggestions } = useActivitySuggestions(persona);

  // Handle time changes with rest activity update
  const handleTimePress = async (type: "wake" | "sleep") => {
    CdDialog.show("timePicker", {
      mode: type,
      currentTime: type === "wake" ? settings.wakeTime : settings.sleepTime,
      onTimeChange: async (time: string) => {
        const newSettings = {
          ...settings,
          [type === "wake" ? "wakeTime" : "sleepTime"]: time,
        };
        updateSettings(newSettings);

        // Update rest activity
        if (user?.id) {
          await ActivitySuggestionService.updateRestActivity(
            newSettings.wakeTime,
            newSettings.sleepTime,
            user.id
          );
        }
      },
    });
  };

  // Show activity suggestions if persona is detected and suggestions exist
  useEffect(() => {
    if (persona && suggestions.length > 0 && suggestions.length > 3) {
      // Only show if we have a good number of suggestions
      CdDialog.show("activitySuggestions", {
        persona,
        suggestions,
        onSuggestionsSelected: async (
          selectedSuggestions: ActivitySuggestion[]
        ) => {
          if (user?.id) {
            await createActivitiesFromSuggestions(selectedSuggestions, user.id);
          }
        },
      });
    }
  }, [persona, suggestions]);

  // Rest of component...
};
```

## Testing Strategy

### Unit Tests

```typescript
describe("PersonaService", () => {
  it("correctly identifies early bird persona", () => {
    const persona = PersonaService.detectPersona("06:00", "22:00", "en-US");
    expect(persona.type).toBe("early_bird");
  });

  it("handles cross-midnight sleep correctly", () => {
    const persona = PersonaService.detectPersona("08:00", "01:00", "en-US");
    expect(persona.type).toBe("night_owl");
  });

  it("validates rest activity properly", () => {
    const restActivity = PersonaService.createRestActivity(
      "07:00",
      "23:00",
      "user123"
    );
    const validation = PersonaService.validateRestActivity(restActivity);
    expect(validation.isValid).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe("ActivitySuggestionService", () => {
  it("generates appropriate suggestions for early bird", async () => {
    const persona = { type: "early_bird", confidence: 0.9 } as UserPersona;
    const suggestions = await ActivitySuggestionService.generateSuggestions(
      persona,
      [],
      5
    );
    expect(suggestions).toHaveLength(5);
    expect(suggestions[0].timeOfDay).toBe("morning");
  });

  it("filters out existing activities", async () => {
    const existingActivities = [{ name: "Morning Workout" }] as Activity[];
    const suggestions = await ActivitySuggestionService.generateSuggestions(
      { type: "early_bird" } as UserPersona,
      existingActivities,
      10
    );
    expect(
      suggestions.find((s) => s.name === "Morning Workout")
    ).toBeUndefined();
  });
});
```

This documentation provides a complete foundation for implementing the intelligent activity suggestion system with persona detection and automatic rest activity management.
