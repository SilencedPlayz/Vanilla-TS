# Vanilla-TS

A lightweight TypeScript-like runtime type checking library for vanilla JavaScript environments. Vanilla-TS brings type safety to plain JS projects without requiring a build step or TypeScript compiler — just import and validate.

---

## Features

- Runtime type checking for primitives, objects, interfaces, arrays, unions, literals, and more
- Descriptive stack-traced error messages
- Composable and nestable type checkers
- Union types that accept both type checkers and raw literal values
- Optional and Record type support
- Zero dependencies

---

## Installation

Since Vanilla-TS is a plain ES module, simply import it directly:

```js
import { types, param, multiParams } from "./vanilla-ts.js";
```

---

## Quick Start

All type checkers are available through the `types` namespace:

```js
import { types, param, multiParams } from "./vanilla-ts.js";

const {
  string,
  number,
  boolean,
  interf,
  array,
  optional,
  union,
  Record,
  keyof,
  literal,
  any,
  object,
  func
} = types;
```

---

## API Reference

### `param(type, value)`

Validates a single value against a type checker. Throws a descriptive error if the check fails.

```js
param(string, "hello"); // ✅ passes
param(string, 42); // ❌ throws: Not a valid string type: '42'
```

---

### `multiParams(args, types)`

Validates an array of arguments against an array of type checkers. Supports optional parameters and returns the original args array so it can be destructured inline.

```js
function greet(...args) {
  const [name, age] = multiParams(args, [string, optional(number)]);
  console.log(name, age);
}

greet("Alice"); // ✅
greet("Alice", 30); // ✅
greet("Alice", "30"); // ❌ throws
```

---

### Primitive Types

Ready-to-use checker objects for primitive types, accessed via `types`:

| Type      | Checks for                         |
| --------- | ---------------------------------- |
| `any`     | Anything (no-op, always passes)    |
| `string`  | `typeof v === 'string'`            |
| `number`  | `typeof v === 'number'`            |
| `boolean` | `typeof v === 'boolean'`           |
| `object`  | Plain object (non-null, non-array) |
| `func`    | `typeof v === 'function'`          |

```js
param(types.string, "hello"); // ✅
param(types.number, 3.14); // ✅
param(types.boolean, true); // ✅
param(types.func, () => {}); // ✅
param(types.object, { a: 1 }); // ✅
```

---

### `types.interf(shape)`

Validates that an object matches a defined interface shape. Each value in the shape must be a valid type checker. Keys ending with `?` are treated as optional.

```js
const { interf, string, number } = types;

const UserType = interf({
  name: string,
  age: number,
  "nickname?": string // optional key
});

param(UserType, { name: "Alice", age: 30 }); // ✅
param(UserType, { name: "Alice", age: 30, nickname: "Al" }); // ✅
param(UserType, { name: "Alice" }); // ❌ throws: Missing required key: age
```

---

### `types.union(...types)`

Validates that a value matches **at least one** of the given types. Accepts both type checkers and raw literal values — raw values are automatically wrapped as literals internally.

Requires at least 2 items.

```js
const { union, string, number, boolean } = types;

// With type checkers
const StringOrNumber = union(string, number);
param(StringOrNumber, "hello"); // ✅
param(StringOrNumber, 42); // ✅
// param(StringOrNumber, true); // ❌ Value true is not assignable to union

// With raw literal values (auto-wrapped as literals)
const Direction = union("north", "south", "east", "west");
param(Direction, "north"); // ✅
// param(Direction, "up");      // ❌ Value "up" is not assignable to union

// Mixing type checkers and literals
const Id = union(number, "auto");
param(Id, 42); // ✅
param(Id, "auto"); // ✅
// param(Id, "manual");         // ❌ Value "manual" is not assignable to union
```

---

### `types.array(type)`

Validates that a value is an array where every element matches the given type checker.

```js
const { array, number } = types;

param(array(number), [1, 2, 3]); // ✅
param(array(number), [1, "two", 3]); // ❌ throws
```

---

### `types.optional(type)`

Marks a type as optional — passes if the value is `undefined` or `null`, otherwise validates normally.

```js
const { optional, string } = types;

param(optional(string), undefined); // ✅
param(optional(string), null); // ✅
param(optional(string), "hello"); // ✅
param(optional(string), 42); // ❌ throws
```

---

### `types.Record(valueType)`

Validates that an object's values all match the given type checker. Since object keys are always strings in JS, only values are checked.

```js
const { Record, number } = types;

param(Record(number), { a: 1, b: 2 }); // ✅
param(Record(number), { a: 1, b: "two" }); // ❌ throws
```

---

### `types.keyof(obj)`

Validates that a value is an existing key of the given object.

```js
const { keyof } = types;

const config = { debug: true, verbose: false };

param(keyof(config), "debug"); // ✅
param(keyof(config), "version"); // ❌ throws: Key version is invalid
```

---

### `types.literal(value)`

Validates that a value deeply matches an exact literal — works with primitives, objects, and arrays.

```js
const { literal } = types;

param(literal("active"), "active"); // ✅
param(literal("active"), "idle"); // ❌ throws: Unexpected literal value: "idle", at @

param(literal({ status: "ok", code: 200 }), { status: "ok", code: 200 }); // ✅
param(literal([1, 2, 3]), [1, 2, 3]); // ✅
```

---

## Advanced Usage

### Nested Interfaces

```js
const { interf, string, number, array } = types;

const AddressType = interf({
  street: string,
  zip: string
});

const UserType = interf({
  name: string,
  age: number,
  addresses: array(AddressType)
});

param(UserType, {
  name: "Alice",
  age: 30,
  addresses: [{ street: "123 Main St", zip: "10001" }]
}); // ✅
```

### Union Inside an Interface

```js
const { interf, string, number, union } = types;

const ShapeType = interf({
  kind: union("circle", "rect", "triangle"),
  size: number
});

param(ShapeType, { kind: "circle", size: 10 }); // ✅
// param(ShapeType, { kind: "oval", size: 10 }); // ❌ Value "oval" is not assignable to union
```

### Runtime Function Type Guards

```js
const { string, number, optional } = types;

function createUser(...args) {
  const [name, age, role] = multiParams(args, [
    string,
    number,
    optional(string)
  ]);
}

createUser("Alice", 30); // ✅
createUser("Alice", 30, "admin"); // ✅
createUser("Alice"); // ❌ throws: Expecting 2-3 arguments, received 1
```

---

## Error Output

Vanilla-TS throws descriptive errors with a formatted stack trace to help locate the source of type mismatches quickly:

```
Error: Not a valid string type: '42'
  ↳param (vanilla-ts.js:10:5)
   ↳yourFile.js:3:1
```

---

## Roadmap

- [ ] Object-like `Enum` type

---

## License

MIT
