#!/bin/bash

# Create all FAQ files
mkdir -p docs/faq docs/features

# Note: This script creates placeholder files
# The full content was designed but needs to be added manually or via separate commits

echo "Creating FAQ structure..."
touch docs/faq/activities.md
touch docs/faq/notes.md
touch docs/faq/sage-ai.md
touch docs/faq/calendar.md
touch docs/faq/encryption.md
touch docs/faq/notifications.md
touch docs/faq/subscription.md
touch docs/faq/troubleshooting.md

echo "Creating feature guides..."
touch docs/features/activity-tracking.md
touch docs/features/note-taking.md
touch docs/features/ai-chat.md
touch docs/features/reflections.md
touch docs/features/privacy-security.md

echo "✅ Documentation structure created!"
echo "📝 Now add content to these files"
