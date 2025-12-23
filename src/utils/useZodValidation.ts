import { useState } from "react";
import { ZodSchema } from "zod";

interface UseZodValidationProps<T> {
  schema: ZodSchema<T>;
  initialValues: T;
}

interface UseZodValidationReturn<T> {
  values: T;
  errors: Record<string, string>;
  setValues: (values: T) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  validateField: (field: keyof T, value: any) => void;
  validateForm: () => boolean;
  reset: () => void;
  setErrors: (errors: Record<string, string>) => void;
}

export function useZodValidation<T extends Record<string, any>>({
  schema,
  initialValues,
}: UseZodValidationProps<T>): UseZodValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: keyof T, value: any) => {
    // Create a temporary object with just the field we want to validate
    const tempValues = { ...values, [field]: value };

    const result = schema.safeParse(tempValues);

    if (!result.success) {
      const fieldError = result.error.issues.find(
        (issue) => Array.isArray(issue.path) && issue.path[0] === field
      );

      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          [field]: fieldError.message,
        }));
      } else {
        // If no specific field error, clear the error for this field
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } else {
      // If validation passes, clear the error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const result = schema.safeParse(values);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field =
          Array.isArray(issue.path) && issue.path.length > 0
            ? issue.path[0].toString()
            : "general";
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const setFieldValue = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Validate the field immediately
    validateField(field, value);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    setValues,
    setFieldValue,
    validateField,
    validateForm,
    reset,
    setErrors,
  };
}
