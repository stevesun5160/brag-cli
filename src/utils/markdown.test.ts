import { describe, it, expect } from 'vitest';
import { findSection, appendToSection, replaceSection, extractSection } from './markdown.js';

const sampleMarkdown = `---
tags:
  - test
---

## Work Journal

- [10:00] Task 1
- [11:00] Task 2

## Shipped & Deliverables

- Feature A completed

## Collaboration & Kudos

## Brain Dump / Notes

Some notes here`;

describe('markdown utils', () => {
  describe('findSection', () => {
    it('should find existing section', () => {
      const section = findSection(sampleMarkdown, 'Work Journal');

      expect(section).not.toBeNull();
      expect(section?.name).toBe('Work Journal');
      expect(section?.startLine).toBeGreaterThan(0);
      expect(section?.content).toContain('Task 1');
      expect(section?.content).toContain('Task 2');
    });

    it('should return null for non-existing section', () => {
      const section = findSection(sampleMarkdown, 'Non Existing Section');
      expect(section).toBeNull();
    });

    it('should handle empty sections', () => {
      const section = findSection(sampleMarkdown, 'Collaboration & Kudos');

      expect(section).not.toBeNull();
      expect(section?.content.trim()).toBe('');
    });

    it('should not include section title in content', () => {
      const section = findSection(sampleMarkdown, 'Work Journal');

      expect(section?.content).not.toContain('## Work Journal');
    });

    it('should handle sections with special characters', () => {
      const section = findSection(sampleMarkdown, 'Shipped & Deliverables');

      expect(section).not.toBeNull();
      expect(section?.content).toContain('Feature A');
    });

    it('should find last section correctly', () => {
      const section = findSection(sampleMarkdown, 'Brain Dump / Notes');

      expect(section).not.toBeNull();
      expect(section?.content).toContain('Some notes here');
    });
  });

  describe('appendToSection', () => {
    it('should append content to existing section', () => {
      const newContent = '- [12:00] Task 3';
      const result = appendToSection(sampleMarkdown, 'Work Journal', newContent);

      expect(result).toContain('Task 1');
      expect(result).toContain('Task 2');
      expect(result).toContain('Task 3');

      // Verify Task 3 comes after Task 2
      const task2Index = result.indexOf('Task 2');
      const task3Index = result.indexOf('Task 3');
      expect(task3Index).toBeGreaterThan(task2Index);
    });

    it('should append to empty section', () => {
      const newContent = '- Collaborated with team';
      const result = appendToSection(sampleMarkdown, 'Collaboration & Kudos', newContent);

      expect(result).toContain('- Collaborated with team');
    });

    it('should preserve content before and after section', () => {
      const newContent = '- New deliverable';
      const result = appendToSection(sampleMarkdown, 'Shipped & Deliverables', newContent);

      expect(result).toContain('Work Journal');
      expect(result).toContain('Brain Dump / Notes');
      expect(result).toContain('Feature A');
      expect(result).toContain('New deliverable');
    });

    it('should throw error for non-existing section', () => {
      expect(() => {
        appendToSection(sampleMarkdown, 'Non Existing', 'content');
      }).toThrow('Section "Non Existing" not found');
    });

    it('should maintain proper spacing', () => {
      const newContent = '- [12:00] Task 3';
      const result = appendToSection(sampleMarkdown, 'Work Journal', newContent);

      // Should have newline before new content when section is not empty
      const section = findSection(result, 'Work Journal');
      expect(section?.content).toContain('\n- [12:00] Task 3');
    });
  });

  describe('replaceSection', () => {
    it('should replace section content', () => {
      const newContent = '- [09:00] New task\n- [10:00] Another task';
      const result = replaceSection(sampleMarkdown, 'Work Journal', newContent);

      expect(result).toContain('New task');
      expect(result).toContain('Another task');
      expect(result).not.toContain('Task 1');
      expect(result).not.toContain('Task 2');
    });

    it('should preserve section title', () => {
      const newContent = '- New content';
      const result = replaceSection(sampleMarkdown, 'Work Journal', newContent);

      expect(result).toContain('## Work Journal');
    });

    it('should preserve other sections', () => {
      const newContent = '- New content';
      const result = replaceSection(sampleMarkdown, 'Work Journal', newContent);

      expect(result).toContain('## Shipped & Deliverables');
      expect(result).toContain('Feature A completed');
      expect(result).toContain('## Brain Dump / Notes');
    });

    it('should handle empty new content', () => {
      const result = replaceSection(sampleMarkdown, 'Work Journal', '');

      const section = findSection(result, 'Work Journal');
      expect(section?.content.trim()).toBe('');
    });

    it('should throw error for non-existing section', () => {
      expect(() => {
        replaceSection(sampleMarkdown, 'Non Existing', 'content');
      }).toThrow('Section "Non Existing" not found');
    });
  });

  describe('extractSection', () => {
    it('should extract section content without title', () => {
      const content = extractSection(sampleMarkdown, 'Work Journal');

      expect(content).toContain('Task 1');
      expect(content).toContain('Task 2');
      expect(content).not.toContain('## Work Journal');
    });

    it('should extract empty section as empty string', () => {
      const content = extractSection(sampleMarkdown, 'Collaboration & Kudos');

      expect(content.trim()).toBe('');
    });

    it('should preserve formatting', () => {
      const content = extractSection(sampleMarkdown, 'Work Journal');

      expect(content).toContain('- [10:00]');
      expect(content).toContain('- [11:00]');
    });

    it('should throw error for non-existing section', () => {
      expect(() => {
        extractSection(sampleMarkdown, 'Non Existing');
      }).toThrow('Section "Non Existing" not found');
    });

    it('should handle last section', () => {
      const content = extractSection(sampleMarkdown, 'Brain Dump / Notes');

      expect(content).toContain('Some notes here');
      expect(content).not.toContain('## Brain Dump / Notes');
    });
  });
});
