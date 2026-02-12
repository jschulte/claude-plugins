/**
 * AST Parser Utility
 * Parses JavaScript/TypeScript files using @babel/parser
 */

import { parse, ParserPlugin } from '@babel/parser';
import * as t from '@babel/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ASTParsingError } from '../../types/errors.js';

export interface FunctionSignature {
  name: string;
  params: FunctionParameter[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  isStub: boolean;
  location: { line: number; column: number };
  docComment?: string;
}

export interface FunctionParameter {
  name: string;
  type?: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ClassDeclaration {
  name: string;
  isExported: boolean;
  extends?: string;
  implements: string[];
  methods: FunctionSignature[];
  properties: PropertyDeclaration[];
  location: { line: number; column: number };
}

export interface PropertyDeclaration {
  name: string;
  type?: string;
  isStatic: boolean;
  isPrivate: boolean;
  location: { line: number; column: number };
}

export interface ImportDeclaration {
  source: string;
  specifiers: ImportSpecifier[];
  location: { line: number; column: number };
}

export interface ImportSpecifier {
  imported: string;
  local: string;
  type: 'default' | 'namespace' | 'named';
}

export interface ExportDeclaration {
  name: string;
  type: 'function' | 'class' | 'variable' | 'type';
  isDefault: boolean;
  location: { line: number; column: number };
}

export interface ParsedFile {
  filePath: string;
  functions: FunctionSignature[];
  classes: ClassDeclaration[];
  imports: ImportDeclaration[];
  exports: ExportDeclaration[];
  hasErrors: boolean;
  errors: string[];
}

export class ASTParser {
  private parserPlugins: ParserPlugin[] = [
    'typescript',
    'jsx',
    'decorators-legacy',
    'classProperties',
    'objectRestSpread',
    'asyncGenerators',
    'dynamicImport',
    'optionalChaining',
    'nullishCoalescingOperator',
  ];

  /**
   * Parse a TypeScript/JavaScript file
   * @param filePath - Path to file
   * @returns Parsed file information
   */
  async parseFile(filePath: string): Promise<ParsedFile> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseCode(content, filePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ASTParsingError(filePath, message);
    }
  }

  /**
   * Parse code string
   * @param code - Source code
   * @param filePath - Optional file path for error reporting
   * @returns Parsed file information
   */
  parseCode(code: string, filePath: string = 'unknown'): ParsedFile {
    const result: ParsedFile = {
      filePath,
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      hasErrors: false,
      errors: [],
    };

    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: this.parserPlugins,
        errorRecovery: true,
      });

      // Extract functions, classes, imports, exports
      this.traverseAST(ast, result, code);
    } catch (error) {
      result.hasErrors = true;
      result.errors.push(error instanceof Error ? error.message : String(error));
    }

    return result;
  }

  /**
   * Find a specific function in a file
   * @param filePath - Path to file
   * @param functionName - Function name to find
   * @returns Function signature or null if not found
   */
  async findFunction(filePath: string, functionName: string): Promise<FunctionSignature | null> {
    const parsed = await this.parseFile(filePath);
    return parsed.functions.find(f => f.name === functionName) || null;
  }

  /**
   * Find a specific class in a file
   * @param filePath - Path to file
   * @param className - Class name to find
   * @returns Class declaration or null if not found
   */
  async findClass(filePath: string, className: string): Promise<ClassDeclaration | null> {
    const parsed = await this.parseFile(filePath);
    return parsed.classes.find(c => c.name === className) || null;
  }

  /**
   * Check if a function matches a specific signature
   * @param func - Function signature
   * @param expectedParams - Expected parameter names
   * @returns True if signature matches
   */
  verifySignature(func: FunctionSignature, expectedParams: string[]): boolean {
    if (func.params.length < expectedParams.length) {
      return false;
    }

    for (let i = 0; i < expectedParams.length; i++) {
      const param = func.params[i];
      const expected = expectedParams[i];

      // Allow optional parameters at the end
      if (!param && i >= expectedParams.length) {
        continue;
      }

      if (param.name !== expected) {
        return false;
      }
    }

    return true;
  }

  /**
   * Detect if a function is a stub (returns guidance text)
   * @param func - Function signature
   * @param fileContent - Full file content for body inspection
   * @returns True if function is a stub
   */
  async detectStub(func: FunctionSignature, fileContent: string): Promise<boolean> {
    if (func.isStub) {
      return true;
    }

    // Additional heuristics for stub detection
    const lines = fileContent.split('\n');
    const funcLine = func.location.line - 1;

    // Check for TODO/FIXME comments near function
    for (let i = Math.max(0, funcLine - 2); i < Math.min(lines.length, funcLine + 10); i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('todo') || line.includes('fixme') || line.includes('not implemented')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Traverse AST and extract information
   * @param ast - Babel AST
   * @param result - Result object to populate
   * @param code - Source code for stub detection
   */
  private traverseAST(ast: t.File, result: ParsedFile, code: string): void {
    const visitNode = (node: t.Node, parent?: t.Node) => {
      // Function declarations
      if (t.isFunctionDeclaration(node)) {
        const func = this.extractFunctionSignature(node, code);
        if (func) {
          func.isExported = this.isExported(node, parent);
          result.functions.push(func);
        }
      }

      // Arrow functions and function expressions (const foo = () => {})
      if (t.isVariableDeclaration(node)) {
        for (const decl of node.declarations) {
          if (t.isVariableDeclarator(decl) && t.isIdentifier(decl.id)) {
            if (t.isArrowFunctionExpression(decl.init) || t.isFunctionExpression(decl.init)) {
              const func = this.extractFunctionFromExpression(decl.id.name, decl.init, code);
              if (func) {
                func.isExported = this.isExported(node, parent);
                result.functions.push(func);
              }
            }
          }
        }
      }

      // Class declarations
      if (t.isClassDeclaration(node)) {
        const cls = this.extractClassDeclaration(node, code);
        if (cls) {
          cls.isExported = this.isExported(node, parent);
          result.classes.push(cls);
        }
      }

      // Imports
      if (t.isImportDeclaration(node)) {
        result.imports.push(this.extractImportDeclaration(node));
      }

      // Exports
      if (t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node)) {
        const exports = this.extractExportDeclaration(node);
        result.exports.push(...exports);
      }

      // Recursively visit child nodes
      for (const key in node) {
        const child = (node as any)[key];
        if (Array.isArray(child)) {
          child.forEach(c => {
            if (c && typeof c === 'object' && c.type) {
              visitNode(c, node);
            }
          });
        } else if (child && typeof child === 'object' && child.type) {
          visitNode(child, node);
        }
      }
    };

    visitNode(ast.program);
  }

  /**
   * Extract function signature from function declaration
   */
  private extractFunctionSignature(
    node: t.FunctionDeclaration,
    code: string
  ): FunctionSignature | null {
    if (!node.id) return null;

    const name = node.id.name;
    const params = this.extractParameters(node.params);
    const location = { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 };

    // Check if function is a stub
    const isStub = this.isFunctionStub(node, code);

    return {
      name,
      params,
      returnType: this.extractReturnType(node),
      isAsync: node.async || false,
      isExported: false, // Will be set by caller
      isStub,
      location,
      docComment: this.extractLeadingComment(node, code),
    };
  }

  /**
   * Extract function from arrow/function expression
   */
  private extractFunctionFromExpression(
    name: string,
    node: t.ArrowFunctionExpression | t.FunctionExpression,
    code: string
  ): FunctionSignature | null {
    const params = this.extractParameters(node.params);
    const location = { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 };

    // Check if function is a stub
    const isStub = this.isFunctionStub(node, code);

    return {
      name,
      params,
      returnType: this.extractReturnType(node),
      isAsync: node.async || false,
      isExported: false,
      isStub,
      location,
    };
  }

  /**
   * Extract parameters from function
   */
  private extractParameters(params: Array<t.Node>): FunctionParameter[] {
    return params.map(param => {
      if (t.isIdentifier(param)) {
        return {
          name: param.name,
          type: this.getTypeAnnotation(param),
          optional: param.optional || false,
        };
      } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
        return {
          name: param.left.name,
          type: this.getTypeAnnotation(param.left),
          optional: true,
          defaultValue: this.getCodeSlice(param.right),
        };
      } else if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
        return {
          name: `...${param.argument.name}`,
          type: this.getTypeAnnotation(param.argument),
          optional: false,
        };
      }
      return { name: 'unknown', optional: false };
    });
  }

  /**
   * Extract return type from function
   */
  private extractReturnType(
    node: t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression
  ): string | undefined {
    if ('returnType' in node && node.returnType && t.isTSTypeAnnotation(node.returnType)) {
      return this.typeToString(node.returnType.typeAnnotation);
    }
    return undefined;
  }

  /**
   * Check if function is a stub
   */
  private isFunctionStub(
    node: t.FunctionDeclaration | t.ArrowFunctionExpression | t.FunctionExpression,
    code: string
  ): boolean {
    const body = node.body;

    // Empty function
    if (t.isBlockStatement(body) && body.body.length === 0) {
      return true;
    }

    // Single return statement with string literal containing guidance
    if (t.isBlockStatement(body) && body.body.length === 1) {
      const stmt = body.body[0];
      if (t.isReturnStatement(stmt) && stmt.argument) {
        if (t.isStringLiteral(stmt.argument)) {
          const value = stmt.argument.value.toLowerCase();
          return (
            value.includes('todo') ||
            value.includes('implement') ||
            value.includes('not yet') ||
            value.includes('coming soon')
          );
        }
      }
    }

    return false;
  }

  /**
   * Extract class declaration
   */
  private extractClassDeclaration(node: t.ClassDeclaration, code: string): ClassDeclaration | null {
    if (!node.id) return null;

    const name = node.id.name;
    const location = { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 };

    const methods: FunctionSignature[] = [];
    const properties: PropertyDeclaration[] = [];

    for (const member of node.body.body) {
      if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
        const methodSig = this.extractMethodSignature(member, code);
        if (methodSig) {
          methods.push(methodSig);
        }
      } else if (t.isClassProperty(member) && t.isIdentifier(member.key)) {
        properties.push({
          name: member.key.name,
          type: this.getTypeAnnotation(member),
          isStatic: member.static || false,
          isPrivate: member.accessibility === 'private',
          location: { line: member.loc?.start.line || 0, column: member.loc?.start.column || 0 },
        });
      }
    }

    return {
      name,
      isExported: false,
      extends: node.superClass && t.isIdentifier(node.superClass) ? node.superClass.name : undefined,
      implements: [],
      methods,
      properties,
      location,
    };
  }

  /**
   * Extract method signature from class method
   */
  private extractMethodSignature(node: t.ClassMethod, code: string): FunctionSignature | null {
    if (!t.isIdentifier(node.key)) return null;

    const name = node.key.name;
    const params = this.extractParameters(node.params);
    const location = { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 };

    return {
      name,
      params,
      returnType: this.extractReturnType(node as any),
      isAsync: node.async || false,
      isExported: false,
      isStub: this.isFunctionStub(node as any, code),
      location,
    };
  }

  /**
   * Extract import declaration
   */
  private extractImportDeclaration(node: t.ImportDeclaration): ImportDeclaration {
    const specifiers: ImportSpecifier[] = node.specifiers.map(spec => {
      if (t.isImportDefaultSpecifier(spec)) {
        return {
          imported: 'default',
          local: spec.local.name,
          type: 'default' as const,
        };
      } else if (t.isImportNamespaceSpecifier(spec)) {
        return {
          imported: '*',
          local: spec.local.name,
          type: 'namespace' as const,
        };
      } else {
        return {
          imported: t.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value,
          local: spec.local.name,
          type: 'named' as const,
        };
      }
    });

    return {
      source: node.source.value,
      specifiers,
      location: { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 },
    };
  }

  /**
   * Extract export declarations
   */
  private extractExportDeclaration(
    node: t.ExportNamedDeclaration | t.ExportDefaultDeclaration
  ): ExportDeclaration[] {
    const exports: ExportDeclaration[] = [];
    const isDefault = t.isExportDefaultDeclaration(node);

    if (t.isExportNamedDeclaration(node) && node.declaration) {
      const decl = node.declaration;

      if (t.isFunctionDeclaration(decl) && decl.id) {
        exports.push({
          name: decl.id.name,
          type: 'function',
          isDefault: false,
          location: { line: decl.loc?.start.line || 0, column: decl.loc?.start.column || 0 },
        });
      } else if (t.isClassDeclaration(decl) && decl.id) {
        exports.push({
          name: decl.id.name,
          type: 'class',
          isDefault: false,
          location: { line: decl.loc?.start.line || 0, column: decl.loc?.start.column || 0 },
        });
      } else if (t.isVariableDeclaration(decl)) {
        for (const declarator of decl.declarations) {
          if (t.isIdentifier(declarator.id)) {
            exports.push({
              name: declarator.id.name,
              type: 'variable',
              isDefault: false,
              location: { line: declarator.loc?.start.line || 0, column: declarator.loc?.start.column || 0 },
            });
          }
        }
      }
    } else if (t.isExportDefaultDeclaration(node)) {
      const decl = node.declaration;
      let name = 'default';

      if (t.isFunctionDeclaration(decl) && decl.id) {
        name = decl.id.name;
      } else if (t.isClassDeclaration(decl) && decl.id) {
        name = decl.id.name;
      } else if (t.isIdentifier(decl)) {
        name = decl.name;
      }

      exports.push({
        name,
        type: t.isFunctionDeclaration(decl) ? 'function' : t.isClassDeclaration(decl) ? 'class' : 'variable',
        isDefault: true,
        location: { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 },
      });
    }

    return exports;
  }

  /**
   * Check if node is exported
   */
  private isExported(node: t.Node, parent?: t.Node): boolean {
    if (!parent) return false;
    return t.isExportNamedDeclaration(parent) || t.isExportDefaultDeclaration(parent);
  }

  /**
   * Get type annotation as string
   */
  private getTypeAnnotation(node: any): string | undefined {
    if (node.typeAnnotation && t.isTSTypeAnnotation(node.typeAnnotation)) {
      return this.typeToString(node.typeAnnotation.typeAnnotation);
    }
    return undefined;
  }

  /**
   * Convert TypeScript type to string
   */
  private typeToString(type: t.TSType): string {
    if (t.isTSStringKeyword(type)) return 'string';
    if (t.isTSNumberKeyword(type)) return 'number';
    if (t.isTSBooleanKeyword(type)) return 'boolean';
    if (t.isTSAnyKeyword(type)) return 'any';
    if (t.isTSVoidKeyword(type)) return 'void';
    if (t.isTSTypeReference(type) && t.isIdentifier(type.typeName)) {
      return type.typeName.name;
    }
    return 'unknown';
  }

  /**
   * Extract leading comment from node
   */
  private extractLeadingComment(node: t.Node, code: string): string | undefined {
    if (node.leadingComments && node.leadingComments.length > 0) {
      return node.leadingComments[0].value.trim();
    }
    return undefined;
  }

  /**
   * Get code slice for a node
   */
  private getCodeSlice(node: t.Node): string {
    if (t.isStringLiteral(node)) return `"${node.value}"`;
    if (t.isNumericLiteral(node)) return String(node.value);
    if (t.isBooleanLiteral(node)) return String(node.value);
    if (t.isIdentifier(node)) return node.name;
    return 'unknown';
  }
}

/**
 * Utility function to create an ASTParser instance
 */
export function createASTParser(): ASTParser {
  return new ASTParser();
}
