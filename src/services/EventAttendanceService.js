// src/services/EventAttendanceService.js
import { getStoredToken } from "@/services/SessionManager";

const BASE_URL = "https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/event-attendance";

/**
 * Generic request wrapper
 */
async function request(endpoint = "", options = {}) {
  const token = getStoredToken();
  if (!token) throw new Error("No token found. Please log in again.");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/**
 * ✅ Create attendance record
 * @param {Object} payload { event_id, barangay_id, is_attending, remarks }
 */
export async function createAttendance(payload) {
  return await request("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * 📋 Get all attendance records
 */
export async function getAllAttendance() {
  return await request("");
}

/**
 * 🔍 Get one attendance record by ID
 */
export async function getAttendanceById(id) {
  return await request(`/${id}`);
}

/**
 * ✏️ Update an existing attendance record
 */
export async function updateAttendance(id, updates) {
  return await request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * ❌ Delete attendance record
 */
export async function deleteAttendance(id) {
  return await request(`/${id}`, {
    method: "DELETE",
  });
}
