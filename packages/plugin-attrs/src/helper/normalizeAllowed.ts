import type { AllowedAttrEntry, AllowedAttrs, AttrFilter } from "./types.js";

const isEntryArray = (allowed: AllowedAttrs): allowed is AllowedAttrEntry[] =>
  allowed.length > 0 && typeof allowed[0] === "object" && "name" in allowed[0];

const createValueFilter = (value: (string | RegExp)[] | undefined): ((val: string) => boolean) => {
  if (!value || value.length === 0) return (): boolean => true;

  const stringValues = new Set<string>();
  const regexValues: RegExp[] = [];

  for (const item of value) {
    if (item instanceof RegExp) regexValues.push(item);
    else stringValues.add(item);
  }

  const stringSize = stringValues.size;
  const regexLength = regexValues.length;

  return (val): boolean => {
    if (stringSize > 0 && stringValues.has(val)) return true;

    for (let i = 0; i < regexLength; i++) if (regexValues[i].test(val)) return true;

    return false;
  };
};

/**
 * Normalize allowed attributes config into a fast filter function.
 *
 * Pre-computes string sets for O(1) lookup and compiles regex patterns to avoid repeated instanceof
 * checks at filter time.
 *
 * @param allowed - Raw allowed attributes config
 * @returns Normalized filter function, or null if no filtering needed
 */
export const normalizeAllowed = (allowed: AllowedAttrs): AttrFilter | null => {
  if (allowed.length === 0) return null;

  // Simple format: (string | RegExp)[] — only filter by attribute name
  if (!isEntryArray(allowed)) {
    const stringNames = new Set<string>();
    const regexNames: RegExp[] = [];

    for (const item of allowed) {
      if (item instanceof RegExp) regexNames.push(item);
      else stringNames.add(item);
    }

    const stringNamesSize = stringNames.size;
    const regexNamesLength = regexNames.length;

    return (_name): boolean => {
      if (stringNamesSize > 0 && stringNames.has(_name)) return true;

      for (let i = 0; i < regexNamesLength; i++) if (regexNames[i].test(_name)) return true;

      return false;
    };
  }

  // Entry format: AllowedAttrEntry[]
  type ValueCheck = (value: string) => boolean;

  const stringEntries: [name: string, check: ValueCheck][] = [];
  const regexEntries: [name: RegExp, check: ValueCheck][] = [];

  for (const entry of allowed) {
    const valueFilter = createValueFilter(entry.value);

    if (entry.name instanceof RegExp) regexEntries.push([entry.name, valueFilter]);
    else stringEntries.push([entry.name, valueFilter]);
  }

  const stringEntriesLength = stringEntries.length;
  const regexEntriesLength = regexEntries.length;

  return (name, value): boolean => {
    // Check string names first (O(n) but n is usually small)
    for (let i = 0; i < stringEntriesLength; i++) {
      const [entryName, check] = stringEntries[i];

      if (entryName === name) return check(value);
    }

    // Then check regex names
    for (let i = 0; i < regexEntriesLength; i++) {
      const [entryName, check] = regexEntries[i];

      if (entryName.test(name)) return check(value);
    }

    return false;
  };
};
