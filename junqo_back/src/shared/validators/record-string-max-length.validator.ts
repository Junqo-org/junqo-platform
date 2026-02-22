import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator that validates max length of string values in a Record<string, string>
 * @param maxLength - Maximum allowed length for each string value
 * @param validationOptions - Optional validation options
 */
export function RecordStringMaxLength(
  maxLength: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'recordStringMaxLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxLength],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (value === null || value === undefined) {
            return true; // Let @IsOptional handle null/undefined
          }
          if (typeof value !== 'object') {
            return false;
          }
          const [maxLen] = args.constraints;
          const record = value as Record<string, string>;
          for (const val of Object.values(record)) {
            if (typeof val !== 'string' || val.length > maxLen) {
              return false;
            }
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [maxLen] = args.constraints;
          return `Each value in ${args.property} must be a string with maximum length of ${maxLen} characters`;
        },
      },
    });
  };
}
