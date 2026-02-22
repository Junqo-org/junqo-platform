import { truncateString } from './string-utils';

describe('truncateString', () => {
  describe('normal truncation', () => {
    it('should truncate a long string and append default suffix', () => {
      const result = truncateString('Hello, World!', 10);
      expect(result).toBe('Hello, ...');
      expect(result.length).toBe(10);
    });

    it('should truncate with custom suffix', () => {
      const result = truncateString('Hello, World!', 10, '…');
      expect(result).toBe('Hello, Wo…');
      expect(result.length).toBe(10);
    });

    it('should truncate with longer custom suffix', () => {
      const result = truncateString('Hello, World!', 12, ' [more]');
      expect(result).toBe('Hello [more]');
      expect(result.length).toBe(12);
    });
  });

  describe('strings shorter than maxLength', () => {
    it('should return original string when shorter than maxLength', () => {
      const result = truncateString('Hello', 10);
      expect(result).toBe('Hello');
    });

    it('should return original string when equal to maxLength', () => {
      const result = truncateString('HelloWorld', 10);
      expect(result).toBe('HelloWorld');
    });

    it('should handle empty string', () => {
      const result = truncateString('', 10);
      expect(result).toBe('');
    });
  });

  describe('edge cases with maxLength <= suffix.length', () => {
    it('should return truncated suffix when maxLength equals suffix length and string is long', () => {
      const result = truncateString('Hello, World!', 3);
      expect(result).toBe('...');
      expect(result.length).toBe(3);
    });

    it('should return original string when shorter than maxLength and maxLength equals suffix length', () => {
      const result = truncateString('Hi', 3);
      expect(result).toBe('Hi');
    });

    it('should return truncated suffix when maxLength is less than suffix length', () => {
      const result = truncateString('Hello, World!', 2);
      expect(result).toBe('..');
      expect(result.length).toBe(2);
    });

    it('should return truncated suffix with custom suffix when maxLength is less than suffix length', () => {
      const result = truncateString('Hello, World!', 2, '---');
      expect(result).toBe('--');
      expect(result.length).toBe(2);
    });

    it('should return single char when maxLength is 1 and string is long', () => {
      const result = truncateString('Hello', 1);
      expect(result).toBe('.');
      expect(result.length).toBe(1);
    });
  });

  describe('edge cases with maxLength <= 0', () => {
    it('should return empty string when maxLength is 0', () => {
      const result = truncateString('Hello', 0);
      expect(result).toBe('');
    });

    it('should return empty string when maxLength is negative', () => {
      const result = truncateString('Hello', -5);
      expect(result).toBe('');
    });
  });

  describe('edge cases with empty suffix', () => {
    it('should truncate without suffix when suffix is empty', () => {
      const result = truncateString('Hello, World!', 5, '');
      expect(result).toBe('Hello');
      expect(result.length).toBe(5);
    });

    it('should return original string when shorter than maxLength with empty suffix', () => {
      const result = truncateString('Hi', 5, '');
      expect(result).toBe('Hi');
    });
  });

  describe('real-world scenario: conversation titles', () => {
    const MAX_CONVERSATION_TITLE_LENGTH = 250;

    it('should handle normal conversation title', () => {
      const title = 'Software Engineer Position - TechCorp';
      const result = truncateString(title, MAX_CONVERSATION_TITLE_LENGTH);
      expect(result).toBe(title);
    });

    it('should truncate extremely long offer title', () => {
      const longOfferTitle = 'A'.repeat(300);
      const companyName = 'TechCorp';
      const fullTitle = `${longOfferTitle} - ${companyName}`;

      const result = truncateString(fullTitle, MAX_CONVERSATION_TITLE_LENGTH);

      expect(result.length).toBe(MAX_CONVERSATION_TITLE_LENGTH);
      expect(result.endsWith('...')).toBe(true);
    });
  });
});
