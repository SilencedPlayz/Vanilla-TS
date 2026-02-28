/**
 * Snippet 05 — array, optional, and Record Checks
 *
 * Demonstrates collection and wrapper types:
 * - array: typed arrays where every element is validated
 * - optional: allows undefined/null, validates otherwise
 * - Record: object with uniform value types across all keys
 */

import { types, param } from "../vanilla-ts.js";

const { string, number, boolean, array, optional, Record, interf } = types;

// ─── array ───────────────────────────────────────────────────────────────────

// Array of primitives
param(array(string), ["apple", "banana", "cherry"]); // ✅
param(array(number), [1, 2, 3, 4, 5]); // ✅
// param(array(number), [1, 2, "three"]);             // ❌ Not a valid number type: 'three'
// param(array(string), "not an array");              // ❌ Not a valid array type: "not an array"

// Array of interfaces
const TagType = interf({ id: number, label: string });

param(array(TagType), [
  { id: 1, label: "js" },
  { id: 2, label: "css" }
]); // ✅

// param(array(TagType), [
//   { id: 1, label: "js" },
//   { id: "two", label: "css" }   // ❌ Not a valid number type: 'two'
// ]);

// Nested arrays
param(array(array(number)), [
  [1, 2],
  [3, 4],
  [5, 6]
]); // ✅

// ─── optional ────────────────────────────────────────────────────────────────

// Wraps any type — passes silently if value is undefined or null
param(optional(string), undefined); // ✅
param(optional(string), null); // ✅
param(optional(string), "hello"); // ✅
// param(optional(string), 42);         // ❌ Not a valid string type: '42'

// Optional inside an interface (use "key?" suffix)
const ArticleType = interf({
  title: string,
  content: string,
  "publishedAt?": string, // optional key via ? suffix
  "tags?": array(string) // optional array
});

param(ArticleType, { title: "Hello", content: "World" }); // ✅
param(ArticleType, {
  title: "Hello",
  content: "World",
  publishedAt: "2025-01-01"
}); // ✅
param(ArticleType, { title: "Hello", content: "World", tags: ["js", "ts"] }); // ✅

// ─── Record ──────────────────────────────────────────────────────────────────

// All values in the object must match the given type
param(Record(number), { a: 1, b: 2, c: 3 }); // ✅
param(Record(string), { x: "foo", y: "bar" }); // ✅
param(Record(boolean), { flag1: true, flag2: false }); // ✅

// param(Record(number), { a: 1, b: "two" });           // ❌ Not a valid number type: 'two'

// Record of interfaces
const PointType = interf({ x: number, y: number });

param(Record(PointType), {
  origin: { x: 0, y: 0 },
  center: { x: 5, y: 5 }
}); // ✅

// Combine with optional
const ConfigType = interf({
  timeout: number,
  "headers?": Record(string) // optional map of string values
});

param(ConfigType, { timeout: 3000 }); // ✅
param(ConfigType, { timeout: 3000, headers: { Authorization: "Bearer xyz" } }); // ✅
