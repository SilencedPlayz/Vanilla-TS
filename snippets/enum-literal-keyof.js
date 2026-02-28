/**
 * Snippet 04 — Enum, Literal, and keyof Checks
 *
 * Demonstrates constrained value validation:
 * - Enum: value must be one of a set of allowed options
 * - literal: value must deeply match an exact shape or primitive
 * - keyof: value must be an existing key of a given object
 */

import { types, param } from "../vanilla-ts.js";

const { Enum, literal, keyof, interf, string, number } = types;

// ─── Enum ────────────────────────────────────────────────────────────────────

const Status = Enum(["active", "inactive", "pending"]);

param(Status, "active"); // ✅
param(Status, "pending"); // ✅
// param(Status, "deleted");// ❌ Not a valid option: 'deleted', accepted options are: active | inactive | pending

const HttpMethod = Enum(["GET", "POST", "PUT", "DELETE", "PATCH"]);

param(HttpMethod, "GET"); // ✅
// param(HttpMethod, "get");// ❌ case-sensitive!

// ─── literal ─────────────────────────────────────────────────────────────────

// Primitive literal
param(literal(42), 42); // ✅
// param(literal(42), 43);      // ❌ Unexpected literal value: 43, at @

// String literal
param(literal("ok"), "ok"); // ✅
// param(literal("ok"), "OK");  // ❌ case-sensitive

// Object literal — must match shape AND values exactly
const SuccessResponse = literal({ status: "ok", code: 200 });

param(SuccessResponse, { status: "ok", code: 200 }); // ✅
// param(SuccessResponse, { status: "ok", code: 201 }); // ❌ Unexpected literal value: 201, at @.["code"]
// param(SuccessResponse, { status: "ok" });             // ❌ Missing required key: code

// Array literal
param(literal([1, 2, 3]), [1, 2, 3]); // ✅
// param(literal([1, 2, 3]), [1, 2, 4]);// ❌ Unexpected literal value: 4, at @.[2]

// ─── keyof ───────────────────────────────────────────────────────────────────

const Theme = {
  light: "#ffffff",
  dark: "#000000",
  sepia: "#f4ecd8"
};

const ThemeKey = keyof(Theme);

param(ThemeKey, "light"); // ✅
param(ThemeKey, "dark"); // ✅
// param(ThemeKey, "blue"); // ❌ Key blue is invalid

// Useful for constraining config keys dynamically
const FeatureFlags = {
  enableDarkMode: true,
  enableBeta: false,
  enableAnalytics: true
};

function toggleFeature(flag) {
  param(keyof(FeatureFlags), flag);
  FeatureFlags[flag] = !FeatureFlags[flag];
  console.log(`Toggled ${flag}:`, FeatureFlags[flag]);
}

toggleFeature("enableDarkMode"); // ✅
// toggleFeature("enableSomething");// ❌ Key enableSomething is invalid
