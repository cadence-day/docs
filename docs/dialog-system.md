# Dialog System Guide

This guide explains how to create, register, and use dialogs in the Cadence.day mobile app. The app uses a centralized dialog system that allows any feature to open dialogs from any other feature.

## Dialog System Overview

The dialog system consists of:

- **Dialog Registry**: Central registration of all available dialogs
- **Dialog Store**: Zustand store managing dialog state and operations
- **Dialog Components**: Individual dialog implementations
- **Usage Patterns**: How features open and interact with dialogs

### Benefits of Centralized Dialogs

- **Global access**: Any feature can open any dialog
- **Consistent behavior**: All dialogs follow the same patterns
- **Type safety**: TypeScript ensures correct dialog usage
- **State management**: Centralized dialog state and lifecycle
- **Performance**: Lazy loading and efficient rendering

## Dialog Architecture

### Dialog Registry (`shared/dialogs/registry.tsx`)

All dialogs are registered in a central registry:

```tsx
// shared/dialogs/registry.tsx
import { CreateActivityDialog } from "@/features/activity/dialogs";
import { NoteDialog } from "@/features/notes/dialogs";

export const DialogRegistry: Record<string, React.ComponentType<any>> = {
  // Activity dialogs
  "activity-create": CreateActivityDialog,
  "activity-edit": EditActivityDialog,
  "activity-manage": ManageActivitiesDialog,

  // Note dialogs
  note: NoteDialog,

  // Calendar dialogs
  calendar: CalendarDialog,

  // Legacy mappings (for backward compatibility)
  activity: ActivityLegendDialog,
};
```

### Dialog Store (`shared/stores/useDialogStore.ts`)

The dialog store manages all dialog operations:

```typescript
interface DialogStore {
  // State
  dialogs: Record<string, DialogState>;

  // Actions
  openDialog: (config: DialogConfig) => string;
  closeDialog: (dialogId: string) => void;
  setDialogProps: (dialogId: string, props: any) => void;
  closeAllDialogs: () => void;
}
```

## Creating a New Dialog

### 1. Create the Dialog Component

Create your dialog in the appropriate feature's `dialogs/` folder:

```tsx
// features/my-feature/dialogs/MyFeatureDialog.tsx
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useDialogStore } from "@/shared/stores";
import { useI18n } from "@/shared/hooks";

interface MyFeatureDialogProps {
  _dialogId?: string; // Always include this prop
  // Add your custom props here
  data?: any;
  onSave?: (result: any) => void;
  onCancel?: () => void;
}

export default function MyFeatureDialog({
  _dialogId,
  data,
  onSave,
  onCancel,
}: MyFeatureDialogProps) {
  const { t } = useI18n();
  const setDialogProps = useDialogStore((s) => s.setDialogProps);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  // Configure dialog header and properties
  useEffect(() => {
    if (!_dialogId) return;

    setDialogProps(_dialogId, {
      headerProps: {
        title: t("myFeature.dialog.title"),
        leftActionElement: t("cancel"),
        onLeftAction: handleCancel,
        rightActionElement: t("save"),
        onRightAction: handleSave,
      },
      height: 70, // Percentage of screen height
      position: "center", // 'center', 'dock', 'fullscreen'
    });
  }, [_dialogId, t]);

  const handleSave = async () => {
    try {
      // Perform save operation
      const result = await performSave();
      onSave?.(result);

      if (_dialogId) {
        closeDialog(_dialogId);
      }
    } catch (error) {
      // Handle error
    }
  };

  const handleCancel = () => {
    onCancel?.();
    if (_dialogId) {
      closeDialog(_dialogId);
    }
  };

  return (
    <View>
      <Text>{t("myFeature.dialog.content")}</Text>
      {/* Your dialog content here */}
    </View>
  );
}
```

### 2. Export from Feature Dialogs

Add your dialog to the feature's dialogs index:

```tsx
// features/my-feature/dialogs/index.ts
export { default as MyFeatureDialog } from "./MyFeatureDialog";
export { default as AnotherDialog } from "./AnotherDialog";
```

### 3. Register the Dialog

Add your dialog to the global registry:

```tsx
// shared/dialogs/registry.tsx
import { MyFeatureDialog } from "@/features/my-feature/dialogs";

export const DialogRegistry: Record<string, React.ComponentType<any>> = {
  // ... existing dialogs
  "my-feature-dialog": MyFeatureDialog,
  "my-feature-another": AnotherDialog,
};
```

## Dialog Naming Conventions

Use descriptive, hierarchical dialog type names:

```typescript
// Feature-based naming
"activity-create"; // Create new activity
"activity-edit"; // Edit existing activity
"activity-manage"; // Manage activities list
"activity-category-picker"; // Pick activity category

"note-create"; // Create new note
"note-edit"; // Edit existing note

"calendar-date-picker"; // Pick calendar date
"calendar-event"; // Calendar event details

// Action-based naming
"confirmation-delete"; // Delete confirmation
"error-network"; // Network error dialog
"onboarding-welcome"; // Welcome onboarding
```

## Opening Dialogs

### Basic Dialog Opening

```tsx
import { useDialogStore } from "@/shared/stores";

function MyComponent() {
  const openDialog = useDialogStore((s) => s.openDialog);

  const handleOpenDialog = () => {
    const dialogId = openDialog({
      type: "activity-create",
      position: "center",
      props: {
        onActivityCreated: (activity) => {
          console.log("Activity created:", activity);
        },
      },
    });
  };

  return <Button onPress={handleOpenDialog}>Create Activity</Button>;
}
```

### Dialog with Custom Props

```tsx
const handleEditActivity = (activity: Activity) => {
  openDialog({
    type: "activity-edit",
    position: "dock",
    props: {
      activity, // Pass data to dialog
      onActivityUpdated: (updatedActivity) => {
        // Handle update
      },
      onActivityDeleted: (activityId) => {
        // Handle deletion
      },
    },
  });
};
```

### Dialog Chain Navigation

```tsx
// From one dialog, open another
const handleBackToManage = () => {
  if (_dialogId) {
    closeDialog(_dialogId); // Close current dialog
  }

  // Open the management dialog
  openDialog({
    type: "activity-manage",
    position: "dock",
    props: {
      headerProps: { title: t("activity.legend.editActivities") },
      height: 85,
    },
  });
};
```

## Dialog Configuration Options

### Position Options

```typescript
type DialogPosition = "center" | "dock" | "fullscreen";

// Center - Modal in center of screen
openDialog({ type: "confirmation", position: "center" });

// Dock - Slide up from bottom
openDialog({ type: "activity-create", position: "dock" });

// Fullscreen - Takes entire screen
openDialog({ type: "note-edit", position: "fullscreen" });
```

### Size Options

```typescript
// Height as percentage of screen
openDialog({
  type: "activity-create",
  props: {
    height: 80, // 80% of screen height
  },
});

// Fixed dimensions (if supported)
openDialog({
  type: "color-picker",
  props: {
    width: 300,
    height: 400,
  },
});
```

### Header Configuration

```typescript
// Dialog with custom header
useEffect(() => {
  if (!_dialogId) return;

  setDialogProps(_dialogId, {
    headerProps: {
      title: "Dialog Title",
      leftActionElement: "Cancel",
      rightActionElement: "Save",
      onLeftAction: handleCancel,
      onRightAction: handleSave,
      // Optional close button
      showCloseButton: true,
      onClose: handleClose,
    },
  });
}, [_dialogId]);
```

## Dialog Lifecycle and State Management

### Dialog Props Pattern

Always include the `_dialogId` prop and use it for configuration:

```tsx
interface DialogProps {
  _dialogId?: string; // Required for dialog system
  // Your custom props
}

export default function MyDialog({ _dialogId, ...props }: DialogProps) {
  // Always check if _dialogId exists before using dialog methods
  useEffect(() => {
    if (!_dialogId) return;

    // Configure dialog
    setDialogProps(_dialogId, {
      /* configuration */
    });
  }, [_dialogId]);

  const handleAction = () => {
    // Perform action
    if (_dialogId) {
      closeDialog(_dialogId);
    }
  };
}
```

### Form Integration

For dialogs with forms, use ref pattern for external triggers:

```tsx
export default function FormDialog({ _dialogId }) {
  const formRef = useRef<{ submit: () => void }>(null);

  useEffect(() => {
    if (!_dialogId) return;

    setDialogProps(_dialogId, {
      headerProps: {
        rightActionElement: "Save",
        onRightAction: () => formRef.current?.submit(),
      },
    });
  }, [_dialogId]);

  const handleSubmit = async (values) => {
    // Handle form submission
    if (_dialogId) {
      closeDialog(_dialogId);
    }
  };

  return <MyForm ref={formRef} onSubmit={handleSubmit} />;
}
```

## Dialog Communication Patterns

### Parent to Child Communication

Pass data and callbacks through props:

```tsx
// Parent component
openDialog({
  type: "activity-edit",
  props: {
    activity: selectedActivity,
    onSave: (updatedActivity) => {
      updateActivityInList(updatedActivity);
    },
    onDelete: (activityId) => {
      removeActivityFromList(activityId);
    },
  },
});

// Dialog component
interface EditDialogProps {
  activity: Activity;
  onSave: (activity: Activity) => void;
  onDelete: (id: string) => void;
}
```

### Store Integration

Dialogs can directly interact with stores:

```tsx
export default function CreateActivityDialog({ _dialogId }) {
  const insertActivity = useActivitiesStore((s) => s.insertActivity);
  const activities = useActivitiesStore((s) => s.activities);

  const handleCreate = async (activityData) => {
    const newActivity = await insertActivity(activityData);
    if (newActivity && _dialogId) {
      closeDialog(_dialogId);
    }
  };
}
```

### Error Handling in Dialogs

Use consistent error handling patterns:

```tsx
import { GlobalErrorHandler } from "@/shared/utils";

export default function MyDialog({ _dialogId }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await performSaveOperation();

      if (_dialogId) {
        closeDialog(_dialogId);
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, "MyDialog.handleSave", {
        dialogType: "my-dialog",
        dialogId: _dialogId,
      });
    } finally {
      setIsLoading(false);
    }
  };
}
```

## Advanced Dialog Patterns

### Conditional Dialog Opening

```tsx
const handleOpenDialog = () => {
  // Check conditions before opening
  if (!user.isAuthenticated) {
    openDialog({ type: "auth-required" });
    return;
  }

  if (user.hasUnsavedChanges) {
    openDialog({
      type: "confirmation-unsaved",
      props: {
        onConfirm: () => openMainDialog(),
        onCancel: () => {
          /* do nothing */
        },
      },
    });
    return;
  }

  openMainDialog();
};
```

### Dialog with Loading States

```tsx
export default function AsyncDialog({ _dialogId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDialogData();
  }, []);

  useEffect(() => {
    if (!_dialogId) return;

    setDialogProps(_dialogId, {
      headerProps: {
        title: isLoading ? "Loading..." : "Dialog Title",
        rightActionElement: isLoading ? undefined : "Save",
        onRightAction: isLoading ? undefined : handleSave,
      },
    });
  }, [_dialogId, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <DialogContent data={data} />;
}
```

### Multi-Step Dialog

```tsx
export default function MultiStepDialog({ _dialogId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (!_dialogId) return;

    setDialogProps(_dialogId, {
      headerProps: {
        title: `Step ${currentStep} of ${totalSteps}`,
        leftActionElement: currentStep > 1 ? "Back" : "Cancel",
        rightActionElement: currentStep < totalSteps ? "Next" : "Finish",
        onLeftAction: currentStep > 1 ? handlePrevious : handleCancel,
        onRightAction: currentStep < totalSteps ? handleNext : handleFinish,
      },
    });
  }, [_dialogId, currentStep]);

  return (
    <View>
      {currentStep === 1 && <Step1Component />}
      {currentStep === 2 && <Step2Component />}
      {currentStep === 3 && <Step3Component />}
    </View>
  );
}
```

## Dialog Testing

### Test Dialog Components

```tsx
// MyDialog.test.tsx
import { render, fireEvent } from "@testing-library/react-native";
import MyDialog from "./MyDialog";

describe("MyDialog", () => {
  it("should call onSave when save button is pressed", () => {
    const mockOnSave = jest.fn();
    const { getByText } = render(<MyDialog onSave={mockOnSave} />);

    fireEvent.press(getByText("Save"));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it("should configure dialog props on mount", () => {
    const mockSetDialogProps = jest.fn();
    jest.mock("@/shared/stores", () => ({
      useDialogStore: () => ({
        setDialogProps: mockSetDialogProps,
      }),
    }));

    render(<MyDialog _dialogId="test-id" />);
    expect(mockSetDialogProps).toHaveBeenCalledWith(
      "test-id",
      expect.any(Object)
    );
  });
});
```

### Test Dialog Opening

```tsx
// Component.test.tsx
import { render, fireEvent } from "@testing-library/react-native";

describe("Component with Dialog", () => {
  it("should open dialog when button is pressed", () => {
    const mockOpenDialog = jest.fn();
    jest.mock("@/shared/stores", () => ({
      useDialogStore: () => ({
        openDialog: mockOpenDialog,
      }),
    }));

    const { getByText } = render(<ComponentWithDialog />);
    fireEvent.press(getByText("Open Dialog"));

    expect(mockOpenDialog).toHaveBeenCalledWith({
      type: "expected-dialog-type",
      props: expect.any(Object),
    });
  });
});
```

## Best Practices

### 1. Always Handle \_dialogId

```tsx
// ✅ Good
useEffect(() => {
  if (!_dialogId) return; // Always check
  setDialogProps(_dialogId, {
    /* config */
  });
}, [_dialogId]);

// ❌ Bad
useEffect(() => {
  setDialogProps(_dialogId, {
    /* config */
  }); // May fail if _dialogId is undefined
}, []);
```

### 2. Proper Cleanup

```tsx
// ✅ Good - Always close dialog when done
const handleSave = async () => {
  try {
    await performSave();
    if (_dialogId) {
      closeDialog(_dialogId); // Clean up
    }
  } catch (error) {
    // Handle error, but don't close dialog
  }
};
```

### 3. TypeScript Props

```tsx
// ✅ Good - Define proper interfaces
interface MyDialogProps {
  _dialogId?: string;
  data: MyDataType;
  onSave: (result: MyResultType) => void;
  onCancel?: () => void;
}

// ❌ Bad - Using any
interface MyDialogProps {
  _dialogId?: string;
  [key: string]: any;
}
```

### 4. Error Handling

```tsx
// ✅ Good - Use GlobalErrorHandler
catch (error) {
  GlobalErrorHandler.logError(error, 'DialogAction', {
    dialogType: 'my-dialog',
    operation: 'save',
  });
}

// ❌ Bad - Silent failures
catch (error) {
  console.log(error);
}
```

### 5. Consistent Naming

```tsx
// ✅ Good - Descriptive dialog types
"activity-create";
"note-edit";
"confirmation-delete";

// ❌ Bad - Generic names
"dialog1";
"modal";
"popup";
```

## Troubleshooting

### Dialog Not Opening

1. Check if dialog is registered in `DialogRegistry`
2. Verify dialog type name matches registry
3. Ensure `openDialog` is being called correctly

### Dialog Props Not Working

1. Verify `_dialogId` is being passed to component
2. Check if `setDialogProps` is called in `useEffect`
3. Ensure props are set after dialog opens

### Dialog Not Closing

1. Check if `closeDialog` is being called with correct ID
2. Verify error handling doesn't prevent closing
3. Ensure async operations complete before closing

### TypeScript Errors

1. Define proper interfaces for dialog props
2. Register dialog in registry with correct types
3. Use typed store hooks

This dialog system provides a powerful, type-safe way to manage modal interactions throughout the app while maintaining clean separation between features.
