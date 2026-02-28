// for error throw
function logError(message) {
  try {
    throw new Error(message);
  } catch (err) {
    const stack = err.stack || err.toString();
    const stacks = stack.split("\n");
    const firstLine = stacks[0];
    const mes = stacks.map(e => {
      const spl = e.includes("/") ? "/" : "\\";
      const parts = e.split(spl);
      return parts[parts.length - 1];
    });

    const arrow = "↳";
    const newStacks = mes.filter((m, i) => i !== 0);

    let E = "";
    E += firstLine;
    for (let i = 0; i < newStacks.length; i++) {
      const s = newStacks[i];
      const padding = i + 1; //width +2 each line
      E += `\n${" ".repeat(padding)}${arrow}${s}`;
    }

    throw E;
  }
}

// auth token
const TSCVALIDATIONKEY = Symbol("2f016d26-5225-4cab-ab71-2d892effd6c9");

// top-level checks
function modeRunner(v, w) {
  checkValidChecker(v);

  switch (v.tscmode) {
    case "simple-check":
      v.check(w);
      break;

    case "interface-check":
      v.check(v.value, w);
      break;

    case "key-check":
      v.check(v.parentObj, w);
      break;

    case "enum-check":
      v.check(v.options, w);
      break;

    case "array-type-check":
      v.check(v.type, w);
      break;

    case "optional-type-check":
      v.check(v.type, w);
      break;

    case "Record-check":
      v.check(v.values, w);
      break;

    case "literal-check":
      v.check(v.literal, w);
      break;

    default:
      logError(`Invalid checker mode: ${v.tscmode}`);
  }
}
function checkValidChecker(v) {
  if (
    typeof v !== "object" ||
    v === null ||
    v.tscvalidationkey !== TSCVALIDATIONKEY ||
    typeof v.check !== "function"
  ) {
    logError(`Not a valid type checker: ${JSON.stringify(v)}`);
  }
}

// all checks
function checkType(v, s) {
  if (typeof s !== v) logError(`Not a valid ${v} type: '${s}'`);
}
function checkHasKey(v, w) {
  checkObject(v);
  if (!Object.prototype.hasOwnProperty.call(v, w))
    logError(`Key ${w} is invalid`);
}
function checkKeys(v, w) {
  checkObject(v);
  if (!Object.prototype.hasOwnProperty.call(v, w))
    logError(`Unexpected key: ${JSON.stringify(w)}`);
}
function checkObject(v) {
  if (typeof v !== "object" || Array.isArray(v) || v === null)
    logError(`Not a valid object: ${JSON.stringify(v)}`);
}
function checkMissingKey(v, w) {
  Object.keys(v).forEach((o, i) => {
    const e = o.replace(/\?/g, "");
    if (o.endsWith("?")) {
      if (!(e in w)) return;
    }
    if (!Object.prototype.hasOwnProperty.call(w, e))
      logError(`Missing required key: ${e}`);
  });
}
function checkOptionalKeys(v, w) {
  let res = { ...v };
  Object.keys(v).forEach(a => {
    if (a.endsWith("?")) {
      const r = a.replace(/\?/g, "");
      if (typeof w[r] === "undefined") {
        delete res[a];
      } else {
        delete res[a];
        res[r] = v[a];
      }
    }
  });
  return res;
}
function filterOptionalArgs(v, w) {
  // t stands for 'total mandatory args'
  const t = v.filter(vt => vt.tscmode !== "optional-type-check");

  if (w.length < t.length || w.length > v.length) {
    logError(
      `Expecting ${t.length}-${v.length} arguments, received ${w.length}`
    );
  }
}
function checkEnum(v, w) {
  if (!Array.isArray(v)) logError(`Enum definition must be in an array`);
  if (!v.includes(w))
    logError(
      `Not a valid option: '${w}', accepted options are: ${v.join(" | ")}`
    );
}
function checkInterface(v, w) {
  checkObject(v);
  checkObject(w);
  checkMissingKey(v, w);

  const nv = checkOptionalKeys(v, w);

  Object.keys(w).forEach((t, i) => {
    checkKeys(nv, t);
    if (
      nv[t] &&
      nv[t].tscmode === "optional-type-check" &&
      typeof w[t] === "undefined"
    ) {
      return;
    }

    if (!nv[t]) return;

    checkValidChecker(nv[t]);

    modeRunner(nv[t], w[t]);
  });
}
function checkTypeArray(v, w) {
  checkValidChecker(v);
  if (!Array.isArray(w))
    logError(`Not a valid array type: ${JSON.stringify(w)}`);

  w.forEach(a => {
    modeRunner(v, a);
  });
}
function checkEmptyObject(v) {
  checkObject(v);
  if (Object.keys(v).length === 0) logError(`Object is empty`);
}
function optionalTypeCheck(v, w) {
  checkValidChecker(v);
  if (typeof w === "undefined" || w === null) return;
  modeRunner(v, w);
}
function checkRecords(v, w) {
  checkValidChecker(v);

  checkObject(w);

  Object.values(w).forEach(wv => {
    modeRunner(v, wv);
  });
}
function checkLiteral(v, w, path = "@") {
  if (typeof v === "object" && !Array.isArray(v) && v !== null) {
    checkObject(w);
    checkMissingKey(v, w);

    const nv = checkOptionalKeys(v, w);
    for (const [wk, wv] of Object.entries(w)) {
      checkKeys(nv, wk);
      checkLiteral(nv[wk], wv, path + `.[${JSON.stringify(wk)}]`);
    }
  } else if (typeof v === "object" && Array.isArray(v)) {
    if (!Array.isArray(w))
      logError(
        `Does not meet the literal type: ${JSON.stringify(w)}, at ${path}`
      );

    for (let i = 0; i < v.length; i++) {
      checkLiteral(v[i], w[i], path + `.[${i}]`);
    }
  } else {
    if (v !== w)
      logError(`Unexpected literal value: ${JSON.stringify(w)}, at ${path}`);
  }
}

// main param checks
export function param(v, w) {
  if (typeof v === "undefined") logError(`Missing 1st argument: types`);

  checkValidChecker(v);
  modeRunner(v, w);
}

/**
 * so we can use it easier like:
 * function test(...args){
 *   const [name,age] = multiParams(args,[string,number])
 *   console.log(name,age)
 * }
 */
export function multiParams(w, v) {
  if (!Array.isArray(v))
    logError(`Expecting an array of types, received: ${JSON.stringify(v)}`);
  if (!Array.isArray(w))
    logError(`Expecting an array of arguments, received: ${JSON.stringify(w)}`);

  filterOptionalArgs(v, w);

  v.forEach((a, i) => {
    param(a, w[i]);
  });

  return w;
}

// types
export const any = {
  tscmode: "simple-check",
  tscvalidationkey: TSCVALIDATIONKEY,
  check: () => {}
};
export const string = {
  tscmode: "simple-check",
  tscvalidationkey: TSCVALIDATIONKEY,
  check: v => checkType("string", v)
};
export const number = {
  tscmode: "simple-check",
  tscvalidationkey: TSCVALIDATIONKEY,
  check: v => checkType("number", v)
};
export const boolean = {
  tscmode: "simple-check",
  tscvalidationkey: TSCVALIDATIONKEY,
  check: v => checkType("boolean", v)
};
export const func = {
  tscmode: "simple-check",
  tscvalidationkey: TSCVALIDATIONKEY,
  check: v => checkType("function", v)
};
export const keyof = v => {
  checkObject(v);
  return {
    tscmode: "key-check",
    tscvalidationkey: TSCVALIDATIONKEY,
    parentObj: v,
    check: (a, b) => checkHasKey(a, b)
  };
};
export const object = {
  tscmode: "simple-check",
  tscvalidationkey: TSCVALIDATIONKEY,
  check: v => checkObject(v)
};
export const interf = v => {
  return {
    tscmode: "interface-check",
    tscvalidationkey: TSCVALIDATIONKEY,
    check: (v, w) => checkInterface(v, w),
    value: v
  };
};
export const Enum = v => {
  return {
    tscmode: "enum-check",
    tscvalidationkey: TSCVALIDATIONKEY,
    options: v,
    check: (a, b) => checkEnum(a, b)
  };
};
export const array = v => {
  checkValidChecker(v);
  return {
    tscmode: "array-type-check",
    tscvalidationkey: TSCVALIDATIONKEY,
    type: v,
    check: (a, b) => checkTypeArray(a, b)
  };
};
export const optional = v => {
  checkValidChecker(v);
  return {
    tscmode: "optional-type-check",
    tscvalidationkey: TSCVALIDATIONKEY,
    type: v,
    check: (a, b) => optionalTypeCheck(a, b)
  };
};
//since keys in object always goes string,I just check the value types instead
export const Record = v => {
  checkValidChecker(v);
  return {
    tscmode: "Record-check",
    tscvalidationkey: TSCVALIDATIONKEY,
    values: v,
    check: (a, b) => checkRecords(a, b)
  };
};
export const literal = v => {
  if (typeof v === "undefined") logError(`Missing literal value to use`);
  return {
    tscmode: "literal-check",
    tscvalidationkey: TSCVALIDATIONKEY,
    literal: v,
    check: (a, b) => checkLiteral(a, b)
  };
};

/**
 * Needed to add:
 * @union
 * @literal
 */

// as one obj
export const types = {
  any,
  string,
  number,
  boolean,
  object,
  func,
  interf,
  Enum,
  keyof,
  array,
  optional,
  Record,
  literal
};
