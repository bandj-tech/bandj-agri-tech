import type { AuthResponse, Farmer, SoilTest, SMSLog, Device, AdminUser } from "../types";

const BASE = (import.meta as any).env?.VITE_BACKEND_URL ?? "http://localhost:8000";
const ADMIN_TOKEN_KEY = "admin_access_token";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function request(path: string, opts: RequestInit = {}) {
  const token = getAdminToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    let body: any = txt;
    try { body = JSON.parse(txt); } catch {};
    const err: any = new Error(body?.detail || res.statusText || "Request failed");
    err.status = res.status;
    err.body = body;
    throw err;
  }
  // some endpoints return empty
  const txt = await res.text();
  return txt ? JSON.parse(txt) : {};
}

export async function getFarmers(): Promise<{ farmers: Farmer[] }> {
  return request(`/api/admin/farmers`);
}

export async function createFarmer(payload: { name: string; phone_number: string; region: string; district: string; }): Promise<{ farmer: Farmer }> {
  return request(`/api/admin/farmers`, { method: "POST", body: JSON.stringify(payload) });
}

export async function getSoilTests(farmerId: string): Promise<{ tests: SoilTest[] }> {
  return request(`/api/admin/soil-tests/${farmerId}`);
}

export async function getSMSLogs(farmerId: string): Promise<{ logs: SMSLog[] }> {
  return request(`/api/admin/sms-logs/${farmerId}`);
}

export async function registerDevice(payload: { farmer_id: string; device_id: string; sim_number: string; }): Promise<{ device: Device; api_token: string }> {
  return request(`/api/admin/devices`, { method: "POST", body: JSON.stringify(payload) });
}

export async function getFarmerDevices(farmerId: string): Promise<{ devices: Device[] }> {
  return request(`/api/admin/devices/${farmerId}`);
}

export async function registerAdmin(payload: {
  email: string;
  password: string;
  registration_code: string;
}): Promise<AuthResponse> {
  return request(`/api/auth/register`, { method: "POST", body: JSON.stringify(payload) });
}

export async function loginAdmin(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request(`/api/auth/login`, { method: "POST", body: JSON.stringify(payload) });
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  return request(`/api/auth/me`);
}
