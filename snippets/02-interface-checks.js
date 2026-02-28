import { types, param } from '../vanilla-ts.js';

const { string, number, boolean, interf, array } = types;

// Basic interface
const ProductType = interf({
  id: number,
  name: string,
  inStock: boolean
});

param(ProductType, { id: 1, name: "Keyboard", inStock: true });   // ✅
// param(ProductType, { id: 1, name: "Keyboard" });               // ❌ Missing required key: inStock
// param(ProductType, { id: 1, name: "Keyboard", inStock: true, x: 0 }); // ❌ Unexpected key: "x"

// Optional keys (append ? to key name)
const UserType = interf({
  username: string,
  age: number,
  "bio?": string
});

param(UserType, { username: "alice", age: 30 });              // ✅
param(UserType, { username: "alice", age: 30, bio: "Hi!" });  // ✅
// param(UserType, { username: "alice", age: 30, bio: 99 });  // ❌ Not a valid string type: '99'

// Nested interfaces
const AddressType = interf({ street: string, city: string, zip: string });

const CustomerType = interf({
  name: string,
  email: string,
  address: AddressType
});

param(CustomerType, {
  name: "Bob",
  email: "bob@example.com",
  address: { street: "123 Main St", city: "Springfield", zip: "12345" }
}); // ✅

// Interface with array field
const TagType = interf({ id: number, label: string });

const PostType = interf({
  title: string,
  tags: array(TagType)
});

param(PostType, {
  title: "Hello World",
  tags: [{ id: 1, label: "js" }, { id: 2, label: "css" }]
}); // ✅
