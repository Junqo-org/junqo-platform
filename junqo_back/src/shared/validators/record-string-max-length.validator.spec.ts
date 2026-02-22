import { validate } from 'class-validator';
import { RecordStringMaxLength } from './record-string-max-length.validator';

class TestClass {
  @RecordStringMaxLength(10)
  titles?: Record<string, string>;
}

describe('RecordStringMaxLength', () => {
  describe('valid cases', () => {
    it('should pass validation when all values are within max length', async () => {
      const obj = new TestClass();
      obj.titles = {
        key1: 'short',
        key2: 'also short',
      };

      const errors = await validate(obj);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when value is exactly at max length', async () => {
      const obj = new TestClass();
      obj.titles = {
        key1: 'A'.repeat(10),
      };

      const errors = await validate(obj);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when value is null', async () => {
      const obj = new TestClass();
      obj.titles = null;

      const errors = await validate(obj);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when value is undefined', async () => {
      const obj = new TestClass();

      const errors = await validate(obj);
      expect(errors.length).toBe(0);
    });

    it('should pass validation for empty record', async () => {
      const obj = new TestClass();
      obj.titles = {};

      const errors = await validate(obj);
      expect(errors.length).toBe(0);
    });
  });

  describe('invalid cases', () => {
    it('should fail validation when a value exceeds max length', async () => {
      const obj = new TestClass();
      obj.titles = {
        key1: 'short',
        key2: 'this is way too long for the limit',
      };

      const errors = await validate(obj);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('titles');
    });

    it('should fail validation when value is not a string', async () => {
      const obj = new TestClass();
      obj.titles = {
        key1: 'valid',
        key2: 123 as unknown as string,
      };

      const errors = await validate(obj);
      expect(errors.length).toBe(1);
    });

    it('should fail validation when value is not an object', async () => {
      const obj = new TestClass();
      obj.titles = 'not an object' as unknown as Record<string, string>;

      const errors = await validate(obj);
      expect(errors.length).toBe(1);
    });
  });

  describe('custom error message', () => {
    class TestClassWithMessage {
      @RecordStringMaxLength(5, { message: 'Custom error message' })
      titles?: Record<string, string>;
    }

    it('should use custom error message when provided', async () => {
      const obj = new TestClassWithMessage();
      obj.titles = {
        key1: 'too long value',
      };

      const errors = await validate(obj);
      expect(errors.length).toBe(1);
      expect(errors[0].constraints?.recordStringMaxLength).toBe(
        'Custom error message',
      );
    });
  });
});
