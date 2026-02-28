import { types, multiParams } from '../vanilla-ts.js';

const { string, number, boolean, optional, union, interf } = types;

// Basic — destructure return value inline
function greet(...args) {
  const [name, age] = multiParams(args, [string, number]);
  console.log(`Hello, ${name}! You are ${age} years old.`);
}

greet("Alice", 30);      // ✅
// greet("Alice");        // ❌ Expecting 2-2 arguments, received 1
// greet(42, 30);         // ❌ Not a valid string type: '42'

// Optional arguments
function createPost(...args) {
  const [title, body, tags] = multiParams(args, [string, string, optional(string)]);
  return { title, body, tags };
}

createPost("Hello", "World");            // ✅ tags → undefined
createPost("Hello", "World", "js,ts");  // ✅
// createPost("Hello");                  // ❌ Expecting 2-3 arguments, received 1

// Union-typed argument
function setId(...args) {
  const [id] = multiParams(args, [union(number, "auto")]);
  console.log("ID:", id);
}

setId(42);        // ✅
setId("auto");    // ✅
// setId("x");    // ❌ Value "x" is not assignable to union

// Interface-typed argument
const ConfigType = interf({ host: string, port: number, "ssl?": boolean });

function connect(...args) {
  const [config] = multiParams(args, [ConfigType]);
  console.log(`Connecting to ${config.host}:${config.port}`);
}

connect({ host: "localhost", port: 3000 });             // ✅
connect({ host: "localhost", port: 3000, ssl: true });  // ✅
// connect({ host: "localhost" });                       // ❌ Missing required key: port

// Multiple complex arguments
const AddressType = interf({ street: string, city: string });

function registerUser(...args) {
  const [name, age, role, address] = multiParams(args, [
    string,
    number,
    union("admin", "user", "guest"),
    optional(AddressType)
  ]);
  return { name, age, role, address };
}

registerUser("Alice", 30, "admin");                                          // ✅
registerUser("Bob", 25, "user", { street: "1 Main St", city: "Portland" }); // ✅
// registerUser("Eve", 22, "superuser");                                     // ❌ Value "superuser" is not assignable to union
