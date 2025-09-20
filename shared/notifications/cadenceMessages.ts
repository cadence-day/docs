// Cadence notification messages and quotes for gentle reminders
export const CADENCE_MIDDAY_REFLECTIONS = [
    "How has time shaped your morning?",
    "The morning's behind you. Want to catch its trace?",
    "Time's been moving quietly. What have you moved through?",
    "The day has a rhythm. How did yours begin?",
    "A soft checkpoint. What filled your morning hours?",
    "Half the clock turned. Want to mark what's passed?",
    "Before the afternoon stretches out—how did you arrive here?",
    "Make a midday pause to remember the morning.",
    "Your morning made a pattern. Want to glimpse it?",
    "The day's unwinding. Want to press pause and look back?",
];

export const CADENCE_EVENING_REFLECTIONS = [
    // Literary quotes with attribution
    '"Forever is composed of nows." — Emily Dickinson',
    '"Moments of their life together that no one else would ever know..." — James Joyce',
    '"Time is a river which carries me along..." — Jorge Luis Borges',
    '"Let everything happen to you... No feeling is final." — Rainer Maria Rilke',
    '"For now she need not think of anybody." — Virginia Woolf',
    '"All that you touch, you change." — Octavia Butler',
    '"What we call the beginning is often the end." — T.S. Eliot',
    '"I only achieve simplicity with enormous effort." — Clarice Lispector',
    '"Sometimes just to say your own name out loud is a comfort." — Anne Carson',
    '"Tell me, what is it you plan to do with your one wild and precious life?" — Mary Oliver',
    '"In the stillness, I watch the world rearrange itself." — Ocean Vuong',
    '"The years teach much which the days never know." — Ralph Waldo Emerson',
    '"Every day is a journey, and the journey itself is home." — Matsuo Basho',
    '"Nothing is ever really lost to us as long as we remember it." — L.M. Montgomery',
    '"Time is the longest distance between two places." — Tennessee Williams',
    '"Be patient toward all that is unsolved in your heart." — Rainer Maria Rilke',
    '"It is the time you have wasted for your rose that makes your rose so important." — Antoine de Saint-Exupery',
    '"The present was an egg laid by the past that had the future inside its shell." — Zora Neale Hurston',
    '"We do not remember days, we remember moments." — Cesare Pavese',
    '"I am made of hours, and just a little sand." — Federico Garcia Lorca',
    '"Each day is a stone you hold, or let slip past." — Carl Phillips',
    '"The sky is a daily reminder that we are held by something vast." — Lora Mathis',
    '"We are all composed of loops and returns." — Bhanu Kapil',
    '"I speak to you from the quiet edge of this day." — Traci Brimhall',
    '"We turn the hours into meaning, or they pass through us unnoticed." — Ada Limon',
    '"Even the clock holds its breath sometimes." — Ocean Vuong',
    '"To notice is to begin remembering." — Margaret Atwood',
];

export const CADENCE_STREAK_MESSAGES = [
    "You logged {{streakCount}} days this week—your week looks like a constellation.",
    "Your rhythm is taking shape. {{streakCount}} days of awareness.",
    "Time becomes visible when you pay attention. Day {{streakCount}}.",
    "Another day in your timeline. The pattern grows stronger.",
    "Your week is painting itself. {{streakCount}} brushstrokes so far.",
];

// Helper functions to get random messages
export const getRandomMiddayReflection = (): string => {
    return CADENCE_MIDDAY_REFLECTIONS[
        Math.floor(Math.random() * CADENCE_MIDDAY_REFLECTIONS.length)
    ];
};

export const getRandomEveningReflection = (): string => {
    return CADENCE_EVENING_REFLECTIONS[
        Math.floor(Math.random() * CADENCE_EVENING_REFLECTIONS.length)
    ];
};

export const getRandomStreakMessage = (streakCount: number): string => {
    const message = CADENCE_STREAK_MESSAGES[
        Math.floor(Math.random() * CADENCE_STREAK_MESSAGES.length)
    ];
    return message.replace("{{streakCount}}", streakCount.toString());
};

// Default notification preferences
export const DEFAULT_CADENCE_PREFERENCES = {
    rhythm: "both" as const,
    middayTime: "12:00",
    eveningTimeStart: "20:00",
    eveningTimeEnd: "21:00",
    streaksEnabled: true,
    lightTouch: true,
};
