import { types, param } from '../vanilla-ts.js';

const { string, number, boolean, union, interf, optional } = types;

// Union of type checkers
const StringOrNumber = union(string, number);

param(StringOrNumber, "hello");  // ✅
param(StringOrNumber, 42);       // ✅
// param(StringOrNumber, true);  // ❌ Value true is not assignable to union

// Raw literal union (enum-like) — values are auto-wrapped as literals
const Direction = union("north", "south", "east", "west");

param(Direction, "north");       // ✅
// param(Direction, "up");       // ❌ Value "up" is not assignable to union

// Mixed: type checkers + raw literals
const Id = union(number, "auto");

param(Id, 99);                   // ✅
param(Id, "auto");               // ✅
// param(Id, "manual");          // ❌ Value "manual" is not assignable to union

// Union inside an interface
const UserType = interf({
  name: string,
  role: union("admin", "editor", "viewer")
});

param(UserType, { name: "Alice", role: "admin" });   // ✅
// param(UserType, { name: "Eve", role: "root" });   // ❌ Value "root" is not assignable to union

// Discriminated union (union of interfaces)
const CircleType = interf({ kind: union("circle"), radius: number });
const RectType   = interf({ kind: union("rect"), width: number, height: number });
const ShapeType  = union(CircleType, RectType);

param(ShapeType, { kind: "circle", radius: 5 });           // ✅
param(ShapeType, { kind: "rect", width: 10, height: 20 }); // ✅
// param(ShapeType, { kind: "triangle", base: 3 });         // ❌ Value is not assignable to union
