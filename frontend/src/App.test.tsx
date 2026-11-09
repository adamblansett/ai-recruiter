import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        status: 'healthy',
        app_name: 'AI Recruiter',
        environment: 'test',
        version: '0.1.0',
        database: 'connected',
        redis: 'connected',
      }),
  } as Response)
);

describe('App Component', () => {
  it('renders the AI Recruiter header and foundation monitors', async () => {
    render(<App />);
    const matches = screen.getAllByText(/AI Recruiter/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Autonomous Career Discovery/i)).toBeInTheDocument();
    expect(screen.getByText(/Core Infrastructure Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Job Discovery Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Outreach Approval Gate/i)).toBeInTheDocument();
  });
});
