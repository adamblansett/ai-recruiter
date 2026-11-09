export interface SystemHealth {
  status: string;
  app_name: string;
  environment: string;
  version: string;
  database: string;
  redis: string;
}

export interface SystemStatus {
  app_name: string;
  environment: string;
  debug: boolean;
  version: string;
  uptime_seconds: number;
  system_metrics: Record<string, string>;
}

const API_BASE = '/api/v1';

export async function fetchHealth(): Promise<SystemHealth> {
  const response = await fetch(`${API_BASE}/system/health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch health: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchStatus(): Promise<SystemStatus> {
  const response = await fetch(`${API_BASE}/system/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.statusText}`);
  }
  return response.json();
}
