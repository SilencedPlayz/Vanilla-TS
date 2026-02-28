import { types, param } from '../vanilla-ts.js';

const { string, number, boolean, array, optional, Record, keyof, literal, interf } = types;

// array — every element must match the type
param(array(string), ["apple", "banana"]);   // ✅
param(array(number), [1, 2, 3]);             // ✅
// param(array(number), [1, 2, "three"]);    // ❌ Not a valid number type: 'three'

const TagType = interf({ id: number, label: string });
param(array(TagType), [{ id: 1, label: "js" }, { id: 2, label: "css" }]); // ✅

param(array(array(number)), [[1, 2], [3, 4]]); // ✅ nested arrays

// optional — passes if undefined or null, validates otherwise
param(optional(string), undefined);  // ✅
param(optional(string), null);       // ✅
param(optional(string), "hello");    // ✅
// param(optional(string), 42);      // ❌ Not a valid string type: '42'

const ArticleType = interf({
  title: string,
  content: string,
  "publishedAt?": string,
  "tags?": array(string)
});

param(ArticleType, { title: "Hi", content: "World" });                           // ✅
param(ArticleType, { title: "Hi", content: "World", tags: ["js", "vanilla"] }); // ✅

// Record — all values must match the type
param(Record(number), { a: 1, b: 2 });           // ✅
param(Record(string), { x: "foo", y: "bar" });   // ✅
// param(Record(number), { a: 1, b: "two" });     // ❌ Not a valid number type: 'two'

const PointType = interf({ x: number, y: number });
param(Record(PointType), { origin: { x: 0, y: 0 }, center: { x: 5, y: 5 } }); // ✅

// keyof — value must be an existing key of the given object
const Theme = { light: "#fff", dark: "#000", sepia: "#f4ecd8" };

param(keyof(Theme), "light");    // ✅
param(keyof(Theme), "dark");     // ✅
// param(keyof(Theme), "blue");  // ❌ Key blue is invalid

function getThemeColor(name) {
  param(keyof(Theme), name);
  return Theme[name];
}

getThemeColor("sepia"); // ✅ → "#f4ecd8"

// literal — deep exact value match
param(literal(42), 42);          // ✅
// param(literal(42), 43);       // ❌ Unexpected literal value: 43, at @

param(literal({ status: "ok", code: 200 }), { status: "ok", code: 200 });   // ✅
// param(literal({ status: "ok", code: 200 }), { status: "ok", code: 201 }); // ❌

param(literal([1, 2, 3]), [1, 2, 3]); // ✅
// param(literal([1, 2, 3]), [1, 2, 4]); // ❌ Unexpected literal value: 4, at @.[2]
