# Vanilla-TS

> Runtime type checking for vanilla JavaScript — no build tools, no TypeScript compiler, no setup required.

Vanilla-TS gives you TypeScript-like type safety directly in plain JavaScript by throwing descriptive errors at runtime when values don't match their expected types.

---

## Installation

Just import the module directly — no npm install or configuration needed:

```js
import { param, multiParams, types } from "./vanilla-ts.js";
// or import individual checkers
import { string, number, boolean, interf, union } from "./vanilla-ts.js";
```

---

## Quick Start

```js
import { param, string, number } from "./vanilla-ts.js";

function greet(name) {
  param(string, name); // throws if name is not a string
  return `Hello, ${name}!`;
}

greet("Alice"); // ✅ works
greet(42); // ❌ throws: Not a valid string type: '42'
```

---

## API Reference

### `param(checker, value)`

Validates a single value against a type checker. Throws a descriptive error if the value fails the check.

```js
import { param, number } from "./vanilla-ts.js";

function square(n) {
  param(number, n);
  return n * n;
}
```

---

### `multiParams(args, checkers)`

Validates multiple function arguments at once. Takes the `arguments` array and an array of type checkers in the same order. Returns the args array so you can destructure immediately.

```js
import { multiParams, string, number } from "./vanilla-ts.js";

function createUser(...args) {
  const [name, age] = multiParams(args, [string, number]);
  return { name, age };
}

createUser("Alice", 30); // ✅
createUser("Alice", "30"); // ❌ throws: Not a valid number type: '30'
```

---

## Type Checkers

All checkers can be imported individually or via the `types` object:

```js
import { types } from "./vanilla-ts.js";
// types.string, types.number, types.boolean, etc.
```

### Primitive Types

| Checker   | Description                                  |
| --------- | -------------------------------------------- |
| `any`     | Accepts any value, always passes             |
| `string`  | Checks `typeof value === 'string'`           |
| `number`  | Checks `typeof value === 'number'`           |
| `boolean` | Checks `typeof value === 'boolean'`          |
| `func`    | Checks `typeof value === 'function'`         |
| `object`  | Checks value is a non-null, non-array object |

```js
param(string, "hello"); // ✅
param(number, 42); // ✅
param(boolean, true); // ✅
param(func, () => {}); // ✅
param(object, { a: 1 }); // ✅
```

---

### `interf(shape)`

Validates an object against a defined interface shape. Each key maps to a type checker. Keys ending with `?` are optional.

```js
import { param, interf, string, number, optional } from "./vanilla-ts.js";

const UserChecker = interf({
  name: string,
  age: number,
  email: string,
  nickname: optional(string), // optional via wrapper
  "role?": string // optional via "?" suffix on key
});

param(UserChecker, { name: "Alice", age: 30, email: "alice@example.com" }); // ✅
param(UserChecker, { name: "Alice" }); // ❌ throws: Missing required key: age
```

**Optional keys** can be declared two ways:

- Using `optional(checker)` as the value
- Adding `?` to the end of the key name: `"key?": string`

---

### `union(...checkers)`

Value must satisfy at least one of the provided checkers. You can mix type checkers and raw literal values directly — non-checker values are automatically wrapped in `literal()` internally.

```js
import { param, union, string, number } from "./vanilla-ts.js";

const StringOrNumber = union(string, number);

param(StringOrNumber, "hello"); // ✅
param(StringOrNumber, 42); // ✅
param(StringOrNumber, true); // ❌ throws: Value true is not assignable to union

// Mix checkers and raw literals
const Status = union("active", "inactive", number);
param(Status, "active"); // ✅
param(Status, 0); // ✅
param(Status, "pending"); // ❌
```

---

### `array(checker)`

Validates that a value is an array where every element passes the given checker. Supports **nested `array()` calls** to validate multi-dimensional arrays.

```js
import { param, array, string, number } from "./vanilla-ts.js";

// Flat array
param(array(string), ["a", "b", "c"]); // ✅
param(array(string), ["a", 1, "c"]); // ❌ throws: Not a valid string type: '1'
param(array(string), "not an array"); // ❌ throws: Not a valid array type

// 2D array — array of arrays of numbers
param(array(array(number)), [
  [1, 2],
  [3, 4]
]); // ✅
param(array(array(number)), [
  [1, 2],
  [3, "x"]
]); // ❌ throws: Not a valid number type: 'x'

// 3D array
param(array(array(array(string))), [[["a", "b"], ["c"]], [["d"]]]); // ✅
```

---

### `optional(checker)`

Allows the value to be `undefined` or `null`. If a value is present, it must pass the inner checker.

```js
import { param, optional, string } from "./vanilla-ts.js";

param(optional(string), "hello"); // ✅
param(optional(string), undefined); // ✅
param(optional(string), null); // ✅
param(optional(string), 42); // ❌ throws: Not a valid string type: '42'
```

---

### `literal(value)`

Validates that a value exactly matches a specific literal — works with primitives, nested objects, and arrays.

```js
import { param, literal } from "./vanilla-ts.js";

param(literal("admin"), "admin"); // ✅
param(literal("admin"), "user"); // ❌ throws: Unexpected literal value: "user"

// Deep object literal
param(literal({ role: "admin", level: 1 }), { role: "admin", level: 1 }); // ✅
param(literal({ role: "admin", level: 1 }), { role: "admin", level: 2 }); // ❌

// Array literal
param(literal([1, 2, 3]), [1, 2, 3]); // ✅
param(literal([1, 2, 3]), [1, 2, 9]); // ❌ throws: Unexpected literal value: 9, at @.[2]
```

---

### `Record(checker)`

Validates that all **values** of an object pass the given checker. Since object keys in JavaScript are always strings, only values are type-checked.

```js
import { param, Record, number } from "./vanilla-ts.js";

const Scores = Record(number);

param(Scores, { alice: 95, bob: 87 }); // ✅
param(Scores, { alice: 95, bob: "A" }); // ❌ throws: Not a valid number type: 'A'
```

---

### `keyof(object)`

Validates that a value is one of the keys of a given object — similar to TypeScript's `keyof`.

```js
import { param, keyof } from "./vanilla-ts.js";

const config = { theme: "dark", lang: "en", fontSize: 14 };

param(keyof(config), "theme"); // ✅
param(keyof(config), "fontSize"); // ✅
param(keyof(config), "color"); // ❌ throws: Unexpected key: "color"
```

---

### `enumOf(object)`

Creates an enum-like checker from an object. Accepts **both keys and values** as valid members — mirroring how TypeScript handles numeric enums with their reverse mapping.

```js
import { param, enumOf } from "./vanilla-ts.js";

const Direction = enumOf({
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right"
});

// Values work
param(Direction, "up"); // ✅
param(Direction, "left"); // ✅

// Keys also work
param(Direction, "UP"); // ✅
param(Direction, "LEFT"); // ✅

param(Direction, "north"); // ❌ throws: Value 'north' doesn't exist from enumeration
```

This means you can define your enum however feels natural and access it either way at runtime:

```js
// numeric-style (key === what you pass around)
const Status = enumOf({ active: 0, inactive: 1, pending: 2 });
param(Status, "active"); // ✅ key
param(Status, 0); // ✅ value

// string-style (value === what you pass around)
const Role = enumOf({ ADMIN: "admin", USER: "user" });
param(Role, "admin"); // ✅ value
param(Role, "ADMIN"); // ✅ key
```

---

## Combining Checkers

Checkers are fully composable — nest them freely to validate complex structures:

```js
import {
  param,
  interf,
  array,
  union,
  optional,
  string,
  number,
  boolean
} from "./vanilla-ts.js";

const PostChecker = interf({
  id: number,
  title: string,
  tags: array(string),
  scores: array(array(number)), // 2D array of numbers
  author: interf({
    name: string,
    verified: boolean
  }),
  category: union("news", "blog", "tutorial"),
  subtitle: optional(string)
});

param(PostChecker, {
  id: 1,
  title: "Hello World",
  tags: ["js", "tips"],
  scores: [
    [95, 87],
    [100, 72]
  ],
  author: { name: "Alice", verified: true },
  category: "blog"
}); // ✅
```

---

## Error Messages

Errors include a descriptive message with a formatted stack trace showing exactly where the type violation occurred:

```
Error: Not a valid string type: '42'
 ↳at param (vanilla-ts.js:10:5)
  ↳at greet (app.js:4:3)
   ↳at main (app.js:12:1)
```

---

## `types` Object

All checkers are also available bundled as a single object:

```js
import { types } from "./vanilla-ts.js";

const {
  any,
  string,
  number,
  boolean,
  object,
  func,
  interf,
  union,
  array,
  optional,
  Record,
  literal,
  enumOf,
  keyof
} = types;
```

---

## Known Limitations / Roadmap

- `Record<K, V>` — key type checking is not yet supported (currently only values are validated)
- `Returns<T>` — return type checking for functions is not yet implemented

---

## License

[MIT](./LICENSE)
