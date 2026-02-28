import { types, param } from '../vanilla-ts.js';

const { string, number, boolean, interf, array, optional, union, literal } = types;

const RoleType = union("admin", "editor", "viewer");

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

const UserDetailResponseType = interf({
  status: literal("ok"),
  data: UserType
});

// Validate helper
function validateResponse(type, json) {
  try {
    param(type, json);
    return json;
  } catch (err) {
    console.error("API response validation failed:", err);
    throw err;
  }
}

async function fetchUsers(page = 1) {
  const json = await fetch(`/api/users?page=${page}`).then(r => r.json());
  return validateResponse(UserListResponseType, json);
}

async function fetchUser(id) {
  const json = await fetch(`/api/users/${id}`).then(r => r.json());
  return validateResponse(UserDetailResponseType, json).data;
}

// Valid response — passes
const validResponse = {
  status: "ok",
  data: [
    { id: 1, username: "alice", email: "alice@example.com", role: "admin", active: true },
    { id: 2, username: "bob", email: "bob@example.com", role: "viewer", avatarUrl: "https://cdn.example.com/bob.png", active: false }
  ],
  pagination: { page: 1, perPage: 20, total: 2 }
};

param(UserListResponseType, validResponse); // ✅

// Malformed responses — each throws before data reaches app logic
// param(UserListResponseType, { ...validResponse, data: [{ ...validResponse.data[0], id: "bad" }] });
// ❌ Not a valid number type: 'bad'

// param(UserListResponseType, { ...validResponse, data: [{ ...validResponse.data[0], role: "superuser" }] });
// ❌ Value "superuser" is not assignable to union

// param(UserListResponseType, { ...validResponse, status: "error" });
// ❌ Unexpected literal value: "error", at @.["status"]
