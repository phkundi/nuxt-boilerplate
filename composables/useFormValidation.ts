interface ValidationRule {
  required?: boolean;
  minLength?: number;
  match?: string;
  custom?: (value: any) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

interface ValidationState {
  isValid: boolean;
  message: string;
}

export function useFormValidation<T extends object>(formData: T) {
  const validationState = reactive<Record<keyof T, ValidationState>>(
    {} as Record<keyof T, ValidationState>
  ) as { [K in keyof T]: ValidationState };

  // Initialize validation state for each field
  Object.keys(formData).forEach((key) => {
    validationState[key as keyof T] = {
      isValid: true,
      message: "",
    };
  });

  const validateField = (
    field: keyof T,
    value: any,
    rules: ValidationRule[]
  ): boolean => {
    let isValid = true;

    for (const rule of rules) {
      if (rule.required && !value) {
        validationState[field].isValid = false;
        validationState[field].message = rule.message;
        isValid = false;
        break; // Break after first error for this field
      }

      if (rule.minLength && String(value).length < rule.minLength) {
        validationState[field].isValid = false;
        validationState[field].message = rule.message;
        isValid = false;
        break;
      }

      if (rule.match && value !== formData[rule.match as keyof T]) {
        validationState[field].isValid = false;
        validationState[field].message = rule.message;
        isValid = false;
        break;
      }

      if (rule.custom && !rule.custom(value)) {
        validationState[field].isValid = false;
        validationState[field].message = rule.message;
        isValid = false;
        break;
      }
    }

    if (isValid) {
      validationState[field].isValid = true;
      validationState[field].message = "";
    }

    return isValid;
  };

  const validateForm = (rules: ValidationRules): boolean => {
    resetValidation();

    // Validate all fields and collect results
    const results = Object.entries(rules).map(([field, fieldRules]) =>
      validateField(field as keyof T, formData[field as keyof T], fieldRules)
    );

    // Return true only if all validations passed
    return results.every((result) => result === true);
  };

  const resetValidation = () => {
    Object.keys(validationState).forEach((key) => {
      validationState[key as keyof T].isValid = true;
      validationState[key as keyof T].message = "";
    });
  };

  const handleApiErrors = (errors: Record<string, string[] | string>) => {
    Object.entries(errors).forEach(([field, messages]) => {
      if (field in validationState) {
        validationState[field as keyof T].isValid = false;
        validationState[field as keyof T].message = Array.isArray(messages)
          ? messages[0]
          : messages;
      }
    });
  };

  return {
    validationState,
    validateForm,
    resetValidation,
    handleApiErrors,
  };
}
