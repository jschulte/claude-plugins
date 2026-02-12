import { describe, it, expect } from 'vitest';
import { ASTParser, createASTParser } from '../ast-parser.js';

describe('ASTParser', () => {
  const parser = new ASTParser();

  describe('parseCode', () => {
    it('parses a simple function declaration', () => {
      const code = `function greet(name: string): string { return "hello " + name; }`;
      const result = parser.parseCode(code);
      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe('greet');
      expect(result.functions[0].params[0].name).toBe('name');
      expect(result.functions[0].params[0].type).toBe('string');
      expect(result.functions[0].returnType).toBe('string');
      expect(result.functions[0].isStub).toBe(false);
    });

    it('parses async functions', () => {
      const code = `async function fetchData(url: string): Promise<void> { await fetch(url); }`;
      const result = parser.parseCode(code);
      expect(result.functions[0].isAsync).toBe(true);
    });

    it('parses arrow function expressions', () => {
      const code = `const add = (a: number, b: number): number => a + b;`;
      const result = parser.parseCode(code);
      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe('add');
      expect(result.functions[0].params).toHaveLength(2);
    });

    it('parses function expressions', () => {
      const code = `const multiply = function(a: number, b: number): number { return a * b; };`;
      const result = parser.parseCode(code);
      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe('multiply');
    });

    it('detects empty function stubs', () => {
      const code = `function placeholder() {}`;
      const result = parser.parseCode(code);
      expect(result.functions[0].isStub).toBe(true);
    });

    it('detects TODO return string stubs', () => {
      const code = `function notReady() { return "TODO: implement this"; }`;
      const result = parser.parseCode(code);
      expect(result.functions[0].isStub).toBe(true);
    });

    it('detects "not yet" return string stubs', () => {
      const code = `function later() { return "not yet implemented"; }`;
      const result = parser.parseCode(code);
      expect(result.functions[0].isStub).toBe(true);
    });

    it('parses class declarations with methods', () => {
      const code = `
class Calculator {
  add(a: number, b: number): number { return a + b; }
  subtract(a: number, b: number): number { return a - b; }
}`;
      const result = parser.parseCode(code);
      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].name).toBe('Calculator');
      expect(result.classes[0].methods).toHaveLength(2);
    });

    it('parses class with extends', () => {
      const code = `class Dog extends Animal { bark() { return "woof"; } }`;
      const result = parser.parseCode(code);
      expect(result.classes[0].extends).toBe('Animal');
    });

    it('parses import declarations', () => {
      const code = `import { readFile } from 'fs/promises';
import path from 'path';
import * as util from 'util';`;
      const result = parser.parseCode(code);
      expect(result.imports).toHaveLength(3);
      expect(result.imports[0].source).toBe('fs/promises');
      expect(result.imports[0].specifiers[0].type).toBe('named');
      expect(result.imports[1].specifiers[0].type).toBe('default');
      expect(result.imports[2].specifiers[0].type).toBe('namespace');
    });

    it('parses export declarations', () => {
      const code = `export function doWork() { return 1; }
export class Worker {}
export const VALUE = 42;`;
      const result = parser.parseCode(code);
      expect(result.exports).toHaveLength(3);
      expect(result.exports[0].type).toBe('function');
      expect(result.exports[1].type).toBe('class');
      expect(result.exports[2].type).toBe('variable');
    });

    it('parses default exports', () => {
      const code = `export default function main() { return true; }`;
      const result = parser.parseCode(code);
      expect(result.exports[0].isDefault).toBe(true);
    });

    it('marks exported functions as exported', () => {
      const code = `export function hello() { return "hi"; }`;
      const result = parser.parseCode(code);
      expect(result.functions[0].isExported).toBe(true);
    });

    it('handles parameters with defaults', () => {
      const code = `function greet(name: string = "world") { return name; }`;
      const result = parser.parseCode(code);
      expect(result.functions[0].params[0].optional).toBe(true);
      expect(result.functions[0].params[0].defaultValue).toBe('"world"');
    });

    it('handles rest parameters', () => {
      const code = `function sum(...nums: number[]) { return nums.reduce((a, b) => a + b, 0); }`;
      const result = parser.parseCode(code);
      expect(result.functions[0].params[0].name).toBe('...nums');
    });

    it('handles parse errors gracefully', () => {
      const code = `this is not valid javascript {{{`;
      const result = parser.parseCode(code);
      expect(result.hasErrors).toBe(true);
    });

    it('sets filePath in result', () => {
      const result = parser.parseCode('const x = 1;', 'test.ts');
      expect(result.filePath).toBe('test.ts');
    });

    it('defaults filePath to unknown', () => {
      const result = parser.parseCode('const x = 1;');
      expect(result.filePath).toBe('unknown');
    });
  });

  describe('verifySignature', () => {
    it('returns true when params match', () => {
      const func = parser.parseCode('function foo(a: string, b: number) { return a; }').functions[0];
      expect(parser.verifySignature(func, ['a', 'b'])).toBe(true);
    });

    it('returns false when params do not match', () => {
      const func = parser.parseCode('function foo(a: string) { return a; }').functions[0];
      expect(parser.verifySignature(func, ['x', 'y'])).toBe(false);
    });

    it('returns false when function has fewer params than expected', () => {
      const func = parser.parseCode('function foo(a: string) { return a; }').functions[0];
      expect(parser.verifySignature(func, ['a', 'b', 'c'])).toBe(false);
    });

    it('allows extra optional params on function', () => {
      const func = parser.parseCode('function foo(a: string, b: number, c: boolean) { return a; }').functions[0];
      expect(parser.verifySignature(func, ['a', 'b'])).toBe(true);
    });
  });

  describe('createASTParser', () => {
    it('returns an ASTParser instance', () => {
      const p = createASTParser();
      expect(p).toBeInstanceOf(ASTParser);
    });
  });
});
