import { describe, it, expect } from "vitest";
import {
  difference,
  differenceBy,
  differenceWith,
  keyBy,
  escape,
  unescape,
  escapeRegExp,
} from "../helpers";

describe("helpers", () => {
  describe("difference", () => {
    it("removes values present in other arrays", () => {
      expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
    });

    it("handles multiple exclude arrays", () => {
      expect(difference([1, 2, 3, 4], [2], [3, 99])).toEqual([1, 4]);
    });

    it("treats NaN as equal to NaN (SameValueZero)", () => {
      const input = [NaN, 1, 2];
      expect(difference(input, [NaN])).toEqual([1, 2]);
    });

    it("returns empty array when first argument is not an array", () => {
      // @ts-expect-error testing runtime behavior with invalid input
      expect(difference(null, [1, 2])).toEqual([]);
      // @ts-expect-error
      expect(difference(undefined, [1])).toEqual([]);
    });
  });

  describe("differenceBy", () => {
    it("excludes by iteratee result", () => {
      const arr = [2.1, 1.2, 3.5];
      const excluded = [2.3, 3.9];
      expect(differenceBy(arr, excluded, Math.floor)).toEqual([1.2]);
    });

    it("works with object iteratee", () => {
      const arr = [{ x: 1 }, { x: 2 }, { x: 3 }];
      const excluded = [{ x: 2 }];
      expect(differenceBy(arr, excluded, (o) => o.x)).toEqual([
        { x: 1 },
        { x: 3 },
      ]);
    });

    it("returns empty array when first argument is not an array", () => {
      // @ts-expect-error testing runtime behavior
      expect(differenceBy(null, [{ x: 1 }], (o: any) => o.x)).toEqual([]);
    });
  });

  describe("differenceWith", () => {
    it("excludes items when comparator returns true", () => {
      const a = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const b = [{ id: 2 }];
      const cmp = (u: { id: number }, v: { id: number }) => u.id === v.id;
      expect(differenceWith(a, b, cmp)).toEqual([{ id: 1 }, { id: 3 }]);
    });

    it("returns empty array when first argument is not an array", () => {
      // @ts-expect-error testing runtime behavior
      expect(differenceWith(undefined, [{ id: 1 }], () => false)).toEqual([]);
    });
  });

  describe("keyBy", () => {
    it("keys by iteratee function", () => {
      const arr = [
        { id: "a", v: 1 },
        { id: "b", v: 2 },
      ];
      const result = keyBy(arr, (item) => item.id);
      expect(result).toEqual({ a: { id: "a", v: 1 }, b: { id: "b", v: 2 } });
    });

    it("keys by property name (keyof)", () => {
      const arr = [
        { id: 1, name: "one" },
        { id: 2, name: "two" },
        { id: 1, name: "uno" },
      ];
      const result = keyBy(arr, "id");
      // last element with same key should win
      expect(result).toEqual({
        "1": { id: 1, name: "uno" },
        "2": { id: 2, name: "two" },
      });
    });

    it("works with empty array", () => {
      expect(keyBy([], "id")).toEqual({});
    });
  });

  describe("escape & unescape", () => {
    it("escapes HTML special characters", () => {
      const original = `& < > " '`;
      expect(escape(original)).toBe("&amp; &lt; &gt; &quot; &#39;");
    });

    it("unescapes HTML entities", () => {
      const encoded = "&amp;&lt;&gt;&quot;&#39;";
      expect(unescape(encoded)).toBe("&<>\"'");
    });

    it("unescape(escape(x)) === x for typical strings", () => {
      const s = `Tom & Jerry <cartoon> "fun" 'yes'`;
      expect(unescape(escape(s))).toBe(s);
    });
  });

  describe("escapeRegExp", () => {
    it("escapes regexp special characters so result can be used as literal", () => {
      const special = `^$.*+?()[\\]{}|`;
      const escaped = escapeRegExp(special);
      // Using the escaped string in a RegExp should match the original literal string
      const re = new RegExp("^" + escaped + "$");
      expect(re.test(special)).toBe(true);
    });

    it("leaves normal characters unchanged except escaping specials", () => {
      const plain = "abc123";
      expect(escapeRegExp(plain)).toBe(plain);
    });
  });
});
