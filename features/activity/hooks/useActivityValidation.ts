import type { Activity } from "@/shared/types/models/activity";
import { useCallback, useEffect, useState } from "react";

interface ValidationErrors {
  name: string | null;
  category: string | null;
}

interface ValidationState {
  name: boolean;
  category: boolean;
}

interface UseActivityValidationReturn {
  errors: ValidationErrors;
  fieldTouched: ValidationState;
  isFormValid: boolean;
  validateField: (field: keyof ValidationState, value: string | null) => void;
  validateAll: (activity: Partial<Activity>) => boolean;
  resetValidation: () => void;
  setFieldTouched: (field: keyof ValidationState, touched: boolean) => void;
}

export const useActivityValidation = (
  name: string,
  selectedCategoryId: string | null
): UseActivityValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({
    name: null,
    category: null,
  });

  const [fieldTouched, setFieldTouchedState] = useState<ValidationState>({
    name: false,
    category: false,
  });

  // Individual field validation functions
  const validateName = useCallback((name: string): string | null => {
    return !name.trim() ? "Please enter a name" : null;
  }, []);

  const validateCategory = useCallback(
    (categoryId: string | null): string | null => {
      return !categoryId ? "Please select a category" : null;
    },
    []
  );

  const validateField = useCallback(
    (field: keyof ValidationState, value: string | null) => {
      setFieldTouchedState((prev) => ({ ...prev, [field]: true }));

      let error: string | null = null;
      switch (field) {
        case "name":
          error = validateName(value || "");
          break;
        case "category":
          error = validateCategory(value);
          break;
      }

      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [validateName, validateCategory]
  );

  const validateAll = useCallback(
    (activity: Partial<Activity>): boolean => {
      setFieldTouchedState({ name: true, category: true });

      const nameError = validateName(activity.name || "");
      const categoryError = validateCategory(
        activity.activity_category_id || null
      );

      setErrors({ name: nameError, category: categoryError });

      return !nameError && !categoryError;
    },
    [validateName, validateCategory]
  );

  const resetValidation = useCallback(() => {
    setErrors({ name: null, category: null });
    setFieldTouchedState({ name: false, category: false });
  }, []);

  const setFieldTouched = useCallback(
    (field: keyof ValidationState, touched: boolean) => {
      setFieldTouchedState((prev) => ({ ...prev, [field]: touched }));
    },
    []
  );

  // Real-time validation for touched fields
  useEffect(() => {
    if (fieldTouched.name) {
      setErrors((prev) => ({ ...prev, name: validateName(name) }));
    }
  }, [name, fieldTouched.name, validateName]);

  useEffect(() => {
    if (fieldTouched.category) {
      setErrors((prev) => ({
        ...prev,
        category: validateCategory(selectedCategoryId),
      }));
    }
  }, [selectedCategoryId, fieldTouched.category, validateCategory]);

  // Check if form is valid
  const isFormValid: boolean = Boolean(
    name.trim() && selectedCategoryId && !errors.name && !errors.category
  );

  return {
    errors,
    fieldTouched,
    isFormValid,
    validateField,
    validateAll,
    resetValidation,
    setFieldTouched,
  };
};
