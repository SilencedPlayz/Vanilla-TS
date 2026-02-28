/**
 * Snippet 03 — Function Argument Validation with multiParams
 *
 * Demonstrates how to guard function parameters at runtime
 * using multiParams(). Works with required and optional args.
 * Returns the args array so it can be destructured inline.
 */

import { types, multiParams } from "../vanilla-ts.js";

const { string, number, boolean, optional, interf } = types;

// --- Basic usage ---
function greet(...args) {
  const [name, age] = multiParams(args, [string, number]);
  console.log(`Hello, ${name}! You are ${age} years old.`);
}

greet("Alice", 30); // ✅ Hello, Alice! You are 30 years old.
// greet("Alice");      // ❌ Expecting 2-2 arguments, received 1
// greet(42, 30);       // ❌ Not a valid string type: '42'

// --- With optional arguments ---
function createPost(...args) {
  const [title, body, tags] = multiParams(args, [
    string,
    string,
    optional(string) // tags is optional
  ]);

  return { title, body, tags };
}

createPost("Hello World", "My first post"); // ✅ tags → undefined
createPost("Hello World", "My first post", "js,vanilla"); // ✅ tags → "js,vanilla"
// createPost("Hello World");                                 // ❌ Expecting 2-3 arguments, received 1
// createPost("Hello World", "Body", 99);                    // ❌ Not a valid string type: '99'

// --- With interface-typed argument ---
const ConfigType = interf({
  host: string,
  port: number,
  "ssl?": boolean
});

function connect(...args) {
  const [config] = multiParams(args, [ConfigType]);
  console.log(`Connecting to ${config.host}:${config.port}`);
}

connect({ host: "localhost", port: 3000 }); // ✅
connect({ host: "localhost", port: 3000, ssl: true }); // ✅
// connect({ host: "localhost" });                      // ❌ Missing required key: port
