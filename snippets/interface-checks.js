/**
 * Snippet 02 — Interface Checks
 *
 * Demonstrates how to validate object shapes using interf().
 * Supports required keys, optional keys (suffix with ?),
 * and nested interfaces.
 */

import { types, param } from "../vanilla-ts.js";

const { string, number, boolean, interf, array } = types;

// --- Basic interface ---
const ProductType = interf({
  id: number,
  name: string,
  inStock: boolean
});

param(ProductType, { id: 1, name: "Keyboard", inStock: true }); // ✅
// param(ProductType, { id: 1, name: "Keyboard" });              // ❌ Missing required key: inStock
// param(ProductType, { id: "1", name: "Keyboard", inStock: true }); // ❌ Not a valid number type: '1'

// --- Optional keys (append ? to key name) ---
const UserType = interf({
  username: string,
  age: number,
  "bio?": string // optional — may be absent or a string
});

param(UserType, { username: "alice", age: 30 }); // ✅ bio is absent, that's fine
param(UserType, { username: "alice", age: 30, bio: "Hi!" }); // ✅
// param(UserType, { username: "alice", age: 30, bio: 99 });  // ❌ Not a valid string type: '99'

// --- Nested interfaces ---
const AddressType = interf({
  street: string,
  city: string,
  zip: string
});

const CustomerType = interf({
  name: string,
  email: string,
  address: AddressType // nested interface as a field type
});

param(CustomerType, {
  name: "Bob",
  email: "bob@example.com",
  address: {
    street: "123 Main St",
    city: "Springfield",
    zip: "12345"
  }
}); // ✅

// Extra keys not defined in the interface will throw
// param(CustomerType, {
//   name: "Bob",
//   email: "bob@example.com",
//   address: { street: "123 Main St", city: "Springfield", zip: "12345" },
//   phone: "555-0100"   // ❌ Unexpected key: "phone"
// });
