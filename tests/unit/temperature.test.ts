import { describe, expect, it } from 'vitest';
import { formatTemperature, formatTemperatureLabel } from '../../src/utils/temperature';

describe('formatTemperature', () => {
  it('formats Celsius without converting the source value', () => {
    expect(formatTemperature(21, 'C')).toBe('21');
  });

  it('converts Celsius to Fahrenheit and rounds for display', () => {
    expect(formatTemperature(21, 'F')).toBe('70');
    expect(formatTemperature(-5, 'F')).toBe('23');
  });

  it('uses an em dash for missing or non-finite temperature values', () => {
    expect(formatTemperature(null, 'C')).toBe('—');
    expect(formatTemperature(Number.NaN, 'F')).toBe('—');
    expect(formatTemperatureLabel(undefined, 'C')).toBe('—');
    expect(formatTemperatureLabel(21, 'C')).toBe('21°');
  });
});
