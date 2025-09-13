import { UserPersona, RestActivity } from "../types";

export class PersonaService {
  static async detectPersona(
    wakeTime: string,
    sleepTime: string,
    locale: string
  ): Promise<UserPersona> {
    const wakeHour = parseInt(wakeTime.split(":")[0]);
    const sleepHour = parseInt(sleepTime.split(":")[0]);

    let personaType: UserPersona["type"];

    if (wakeHour <= 6 && sleepHour <= 22) {
      personaType = "early_bird";
    } else if (wakeHour >= 8 && sleepHour >= 24) {
      personaType = "night_owl";
    } else if (wakeHour === 7 && sleepHour === 23) {
      personaType = "balanced";
    } else {
      personaType = "flexible";
    }

    const suggestedActivities = this.getSuggestedActivities(
      personaType,
      locale
    );

    return {
      type: personaType,
      suggestedActivities,
      locale,
    };
  }

  private static getSuggestedActivities(
    persona: UserPersona["type"],
    locale: string
  ): string[] {
    const baseActivities = {
      early_bird: [
        "Morning Workout",
        "Meditation",
        "Reading",
        "Planning Day",
        "Healthy Breakfast",
        "Journaling",
        "Stretching",
      ],
      night_owl: [
        "Creative Work",
        "Learning",
        "Social Time",
        "Entertainment",
        "Reflection",
        "Planning Tomorrow",
        "Wind Down",
      ],
      balanced: [
        "Exercise",
        "Work Focus",
        "Social Connection",
        "Self Care",
        "Learning",
        "Hobbies",
        "Family Time",
      ],
      flexible: [
        "Mindfulness",
        "Physical Activity",
        "Creative Expression",
        "Social Interaction",
        "Skill Building",
        "Rest & Recovery",
      ],
    };

    // TODO: Localize activity names based on locale
    // This would be expanded with proper i18n in the future
    return baseActivities[persona];
  }

  static createRestActivity(
    wakeTime: string,
    sleepTime: string,
    userId: string
  ): RestActivity {
    return {
      id: `rest-${userId}`,
      name: "Rest",
      color: "#6B73FF",
      startTime: sleepTime,
      endTime: wakeTime,
      isSystemGenerated: true,
    };
  }

  static validateTimeRange(
    wakeTime: string,
    sleepTime: string
  ): {
    isValid: boolean;
    error?: string;
  } {
    const wakeHour = parseInt(wakeTime.split(":")[0]);
    const wakeMinute = parseInt(wakeTime.split(":")[1]);
    const sleepHour = parseInt(sleepTime.split(":")[0]);
    const sleepMinute = parseInt(sleepTime.split(":")[1]);

    // Convert to minutes for easier comparison
    const wakeMinutes = wakeHour * 60 + wakeMinute;
    const sleepMinutes = sleepHour * 60 + sleepMinute;

    // Handle cross-midnight schedules
    if (sleepMinutes >= wakeMinutes) {
      return { isValid: true };
    }

    // If sleep time is earlier than wake time, assume it's the next day
    const nextDaySleepMinutes = sleepMinutes + 24 * 60;
    const sleepDuration = nextDaySleepMinutes - wakeMinutes;

    // Validate reasonable sleep duration (4-16 hours)
    if (sleepDuration < 4 * 60) {
      return {
        isValid: false,
        error: "Sleep duration too short (minimum 4 hours)",
      };
    }

    if (sleepDuration > 16 * 60) {
      return {
        isValid: false,
        error: "Sleep duration too long (maximum 16 hours)",
      };
    }

    return { isValid: true };
  }
}
