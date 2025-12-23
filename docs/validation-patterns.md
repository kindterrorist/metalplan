# Frontend Validation with Zod

This document describes the validation patterns implemented in the application using Zod for runtime validation.

## Overview

The application now uses Zod for comprehensive frontend validation. This provides:

- Runtime validation of user inputs
- Type safety form data
- Consistent validation patterns across the application
- Better user experience with real-time validation feedback

## Implementation

### Zod Schemas

Validation schemas are defined in `src/utils/validationSchemas.ts`:

- `athleteSchema` - Validates athlete data including name, age, height, and contact information
- `workoutPlanSchema` - Validates workout plan data
- `exerciseSetSchema` - Validates exercise set data
- `workoutDaySchema` - Validates workout day data
- `nutritionPlanSchema` - Validates nutrition plan data
- `foodItemSchema` - Validates food item data
- `mealSchema` - Validates meal data
- `dietDaySchema` - Validates diet day data
- `exportConfigSchema` - Validates export configuration settings

### Reusable Validation Hook

A custom hook `useZodValidation` is available in `src/utils/useZodValidation.ts` to provide consistent validation across forms:

```typescript
const {
  values, // Current form values
  errors, // Validation errors
  setValues, // Set all form values
  setFieldValue, // Set a single field value
  validateField, // Validate a single field
  validateForm, // Validate entire form
  reset, // Reset form to initial values
  setErrors, // Manually set errors
} = useZodValidation({
  schema: yourZodSchema,
  initialValues: yourInitialValues,
});
```

### Components with Validation

The following components have been updated to use Zod validation:

#### AthleteModal

- Validates athlete information (name, age, height, weight, phone)
- Shows real-time validation errors
- Uses `athleteSchema` for validation

#### PlanBuilder

- Validates workout plan data
- Uses `workoutPlanSchema` for validation

#### NutritionBuilder

- Validates nutrition plan data
- Uses `nutritionPlanSchema` for validation

## Validation Patterns

### Form Validation

1. All forms now have real-time validation as users type
2. Validation errors are displayed immediately below the relevant field
3. Form submission is prevented if validation fails

### Error Display

- Validation errors appear in red text below the input field
- Input fields turn red when they contain invalid data
- Errors are cleared when the user starts correcting the input

### Schema Validation

- All validation schemas are defined using Zod
- Schemas include appropriate data types, required fields, and validation rules
- Custom error messages are provided in Persian for better user experience

## Best Practices

### Adding Validation to New Forms

To add validation to a new form:

1. Create or reuse a Zod schema for the form data
2. Import the `useZodValidation` hook
3. Initialize the hook with your schema and initial values
4. Connect the hook's values and errors to your form fields
5. Use `setFieldValue` to update field values and trigger validation
6. Call `validateForm` before form submission

### Validation Rules

Common validation rules used in the application:

- **Required fields**: All required fields are validated
- **String length**: Names and other text fields have min/max length
- **Numeric ranges**: Age, height, weight have appropriate ranges
- **Phone format**: Phone numbers follow international format
- **Color format**: Color values follow hex format (#RRGGBB)
- **URL validation**: URLs are validated for proper format

## Future Enhancements

- Add more granular validation for specific use cases
- Implement custom validation functions for complex business logic
- Add validation for file uploads
- Consider server-side validation for additional security
