/**
 * Snippet 06 — Real-World Example: API Response Validation
 *
 * Simulates validating data coming from a REST API before
 * using it in your application. This pattern catches
 * unexpected schema changes or malformed responses early.
 */

import { types, param } from "../vanilla-ts.js";

const { string, number, boolean, interf, array, optional, Enum, literal } =
  types;

// ─── Define your expected API shapes ─────────────────────────────────────────

const RoleType = Enum(["admin", "editor", "viewer"]);

const UserType = interf({
  id: number,
  username: string,
  email: string,
  role: RoleType,
  "avatarUrl?": string,
  active: boolean
});

const PaginationType = interf({
  page: number,
  perPage: number,
  total: number
});

const UserListResponseType = interf({
  status: literal("ok"),
  data: array(UserType),
  pagination: PaginationType
});

// ─── Simulate fetch + validate ────────────────────────────────────────────────

async function fetchUsers(page = 1) {
  // In a real app: const res = await fetch(`/api/users?page=${page}`);
  // const json = await res.json();

  // Mocked API response:
  const json = {
    status: "ok",
    data: [
      {
        id: 1,
        username: "alice",
        email: "alice@example.com",
        role: "admin",
        active: true
      },
      {
        id: 2,
        username: "bob",
        email: "bob@example.com",
        role: "viewer",
        avatarUrl: "https://example.com/bob.png",
        active: false
      }
    ],
    pagination: { page: 1, perPage: 20, total: 2 }
  };

  // Validate before trusting the data
  param(UserListResponseType, json); // ✅ throws immediately if shape is wrong

  return json;
}

// ─── Simulate a broken response ──────────────────────────────────────────────

async function fetchUsersBroken() {
  const json = {
    status: "ok",
    data: [
      {
        id: "not-a-number",
        username: "charlie",
        email: "charlie@example.com",
        role: "admin",
        active: true
      }
      //    ^^^^^^^^^^^^^^^ id should be number
    ],
    pagination: { page: 1, perPage: 20, total: 1 }
  };

  // This will throw before any broken data reaches your app logic
  // param(UserListResponseType, json); // ❌ Not a valid number type: 'not-a-number'
}

// ─── Single resource endpoint ─────────────────────────────────────────────────

const UserDetailResponseType = interf({
  status: literal("ok"),
  data: UserType
});

async function fetchUser(id) {
  const json = {
    status: "ok",
    data: {
      id: 1,
      username: "alice",
      email: "alice@example.com",
      role: "admin",
      active: true
    }
  };

  param(UserDetailResponseType, json); // ✅
  return json.data;
}

// Run examples
fetchUsers().then(res => console.log("Users fetched:", res.data.length));
fetchUser(1).then(user => console.log("User:", user.username));
