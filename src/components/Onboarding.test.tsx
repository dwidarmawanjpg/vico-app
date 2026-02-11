import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Onboarding from './Onboarding';

describe('Onboarding Component', () => {
  it('renders correctly', () => {
    expect(render(<Onboarding onStart={() => {}}/>)).toBeTruthy();
    // expect(true).toBe(true);
  });
});
