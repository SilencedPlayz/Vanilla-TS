/**
 * Snippet 01 — Primitive Type Checks
 *
 * Demonstrates how to validate basic JS types:
 * string, number, boolean, func, object, any
 */

import { types, param } from "../vanilla-ts.js";

const { string, number, boolean, func, object, any } = types;

// --- string ---
param(string, "hello world"); // ✅
// param(string, 123);              // ❌ Not a valid string type: '123'

// --- number ---
param(number, 42); // ✅
param(number, 3.14); // ✅
// param(number, "42");             // ❌ Not a valid number type: '42'

// --- boolean ---
param(boolean, true); // ✅
param(boolean, false); // ✅
// param(boolean, 0);               // ❌ Not a valid boolean type: '0'

// --- func ---
param(func, () => {}); // ✅
param(func, function named() {}); // ✅
// param(func, "not a function");   // ❌ Not a valid function type: 'not a function'

// --- object ---
param(object, { key: "value" }); // ✅
// param(object, [1, 2, 3]);        // ❌ arrays are not valid objects
// param(object, null);             // ❌ null is not a valid object

// --- any (always passes) ---
param(any, "anything"); // ✅
param(any, 999); // ✅
param(any, null); // ✅
param(any, undefined); // ✅
