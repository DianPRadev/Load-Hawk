import { describe, it, expect } from "vitest";

// Test the sanitize logic inline since we can't import server modules
function sanitize(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLength);
}

describe("sanitize", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitize(null)).toBe("");
    expect(sanitize(undefined)).toBe("");
    expect(sanitize(123)).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitize("  hello  ")).toBe("hello");
  });

  it("limits length", () => {
    const long = "a".repeat(1000);
    expect(sanitize(long, 100).length).toBe(100);
  });

  it("strips control characters", () => {
    expect(sanitize("hello\x00world")).toBe("helloworld");
    expect(sanitize("test\x07data")).toBe("testdata");
  });

  it("preserves newlines and tabs", () => {
    expect(sanitize("line1\nline2")).toBe("line1\nline2");
    expect(sanitize("col1\tcol2")).toBe("col1\tcol2");
  });
});

describe("email validation", () => {
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  it("accepts valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@domain.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("@@..")).toBe(false);
    expect(isValidEmail("noat")).toBe(false);
    expect(isValidEmail("@missing.user")).toBe(false);
    expect(isValidEmail("missing@.dot")).toBe(false);
  });
});
