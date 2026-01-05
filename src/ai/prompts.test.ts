import { describe, it, expect } from 'vitest';
import { createPolishPrompt, createSummaryPrompt } from './prompts.js';

describe('prompts', () => {
  describe('createPolishPrompt', () => {
    it('should create a prompt with journal content', () => {
      const journalContent = '- [10:00] Fixed a bug\n- [14:00] Reviewed PR';
      const prompt = createPolishPrompt(journalContent);

      expect(prompt).toContain(journalContent);
    });

    it('should include instructions for categorization', () => {
      const prompt = createPolishPrompt('test content');

      expect(prompt).toContain('Shipped & Deliverables');
      expect(prompt).toContain('Collaboration & Kudos');
      expect(prompt).toContain('Technical Challenges & Learnings');
    });

    it('should mention STAR principle', () => {
      const prompt = createPolishPrompt('test content');

      expect(prompt).toContain('STAR');
    });

    it('should request markdown output', () => {
      const prompt = createPolishPrompt('test content');

      expect(prompt).toContain('Markdown');
    });

    it('should handle empty content', () => {
      const prompt = createPolishPrompt('');

      expect(prompt).toBeTruthy();
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should handle multi-line content', () => {
      const journalContent = '- Line 1\n- Line 2\n- Line 3';
      const prompt = createPolishPrompt(journalContent);

      expect(prompt).toContain('Line 1');
      expect(prompt).toContain('Line 2');
      expect(prompt).toContain('Line 3');
    });
  });

  describe('createSummaryPrompt', () => {
    it('should create a prompt with monthly logs', () => {
      const monthlyLogs = '# Day 1\nWorked on feature A\n\n# Day 2\nFixed bugs';
      const prompt = createSummaryPrompt(monthlyLogs);

      expect(prompt).toContain(monthlyLogs);
    });

    it('should include all required sections', () => {
      const prompt = createSummaryPrompt('test logs');

      expect(prompt).toContain('Top Highlights');
      expect(prompt).toContain('Key Deliverables');
      expect(prompt).toContain('Collaboration & Influence');
      expect(prompt).toContain('Technical Deep Dives');
    });

    it('should request markdown output', () => {
      const prompt = createSummaryPrompt('test logs');

      expect(prompt).toContain('Markdown');
    });

    it('should mention quantification', () => {
      const prompt = createSummaryPrompt('test logs');

      expect(prompt).toContain('量化');
    });

    it('should handle empty logs', () => {
      const prompt = createSummaryPrompt('');

      expect(prompt).toBeTruthy();
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should handle large logs', () => {
      const largeLogs = Array(100).fill('Daily log entry').join('\n');
      const prompt = createSummaryPrompt(largeLogs);

      expect(prompt).toContain(largeLogs);
    });
  });
});
