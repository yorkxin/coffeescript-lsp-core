declare module 'coffeescript' {
  import { Block } from 'coffeescript/lib/coffeescript/nodes';
  export function nodes(source: string, options?: any): Block;
}

// http://coffeescript.org/annotated-source/nodes.html
declare module 'coffeescript/lib/coffeescript/nodes' {
  import { Scope } from 'coffeescript/lib/coffeescript/scope';

  interface AbstractO {
    index: number;
    level: number;
    indent: number;
    sharedScope: boolean;
    scope?: Scope;
  }

  type ChildKind = 'accessor' | 'alias' | 'args' | 'array' | 'attempt' | 'base' | 'body' |
                   'cases' | 'child' | 'class' | 'clause' | 'condition' | 'defaultBinding' |
                   'elseBody' | 'ensure' | 'expression' | 'expressions' | 'first' | 'from' |
                   'guard' | 'index' | 'name' | 'namedImports' | 'object' | 'objects' | 'original' |
                   'otherwise' | 'params' | 'parent' | 'properties' | 'range' | 'recovery' | 'second' |
                   'source' | 'specifiers' | 'step' | 'subject' | 'to' | 'value' | 'variable';

  /**
   * The various nodes defined below all compile to a collection of **CodeFragment** objects.
   * A CodeFragments is a block of generated code, and the location in the source file where the code
   * came from. CodeFragments can be assembled together into working code just by catting together
   * all the CodeFragments' `code` snippets, in order.
   */
  export class CodeFragment {
    public locationData: LocationData;
    public toString(): string;
  }

  /**
   * The **Base** is the abstract base class for all nodes in the syntax tree.
   * Each subclass implements the `compileNode` method, which performs the
   * code generation for that node. To compile a node to JavaScript,
   * call `compile` on it, which wraps `compileNode` in some generic extra smarts,
   * to know when the generated code needs to be wrapped up in a closure.
   * An options hash is passed and cloned throughout, containing information about
   * the environment from higher in the tree (such as if a returned value is
   * being requested by the surrounding function), information about the current
   * scope, and indentation level.
   */
  export abstract class Base {

    /*
     * Default implementations of the common node properties and methods. Nodes
     * will override these with custom logic, if needed.
     */

    /*
     * `children` are the properties to recurse into when tree walking. The
     * `children` list *is* the structure of the AST. The `parent` pointer, and
     * the pointer to the `children` are how you can traverse the tree.
     */
    public children: ChildKind[];

    /*
     * Track comments that have been compiled into fragments, to avoid outputting
     * them twice.
     */
    public compiledComments: Base[];

    public locationData: LocationData;
    public contains(pred: Base): true | undefined;

    /** Pull out the last node of a node list. */
    public lastNode(list: Base[]): Base | null;

    /**
     * `toString` representation of the node, for inspecting the parse tree.
     * This is what `coffee --nodes` prints out.
     * @param {string?} [idt = '']
     * @param {string?} [name = this.constructor.name]
    */
    public toString(idt?: string, name?: string): string;

    /**
     * Passes each child to a function, breaking when the function returns `false`.
     */
    public eachChild(func: (child: Base) => boolean): Base;
    public traverseChildren(crossScope: boolean, func: (child: Base) => boolean): void;

    /**
     * `replaceInContext` will traverse children looking for a node for which `match` returns
     * true. Once found, the matching node will be replaced by the result of calling `replacement`.
     */
    public replaceInContext(match: (child: Base) => boolean, replacement: (childOrChildren: Base | Base[], context: Base) => Base): boolean;

    public unwrapAll(): Base;

    /*
     * `isStatement` has to do with “everything is an expression”. A few things
     * can’t be expressions, such as `break`. Things that `isStatement` returns
     * `true` for are things that can’t be used as expressions. There are some
     * error messages that come from `nodes.coffee` due to statements ending up
     * in expression position.
     */
    public isStatement(o?: AbstractO): boolean;

    /*
    * `includeCommentFragments` lets `compileCommentFragments` know whether this node
    * has special awareness of how to handle comments within its output.
    */
    public includeCommentFragments(): boolean;

    /*
    * `jumps` tells you if an expression, or an internal part of an expression
    * has a flow control construct (like `break`, or `continue`, or `return`,
    * or `throw`) that jumps out of the normal flow of control and can’t be
    * used as a value. This is important because things like this make no sense;
    * we have to disallow them.
    */
    public jumps(o?: AbstractO): boolean;

    /*
    * If `node.shouldCache() is false`, it is safe to use `node` more than once.
    * Otherwise you need to store the value of `node` in a variable and output
    * that variable several times instead. Kind of like this: `5` need not be
    * cached. `returnFive()`, however, could have side effects as a result of
    * evaluating it more than once, and therefore we need to cache it. The
    * parameter is named `shouldCache` rather than `mustCache` because there are
    * also cases where we might not need to cache but where we want to, for
    * example a long expression that may well be idempotent but we want to cache
    * for brevity.
    */
    public shouldCache(o?: AbstractO): boolean;

    public isChainable(o?: AbstractO): boolean;
    public isAssignable(o?: AbstractO): boolean;
    public isNumber(o?: AbstractO): boolean;

    /** Is this node used to assign a certain variable? */
    public assigns(name: string): boolean;

    /*
    * `fragmentsList` is an array of arrays of fragments. Each array in fragmentsList will be
    * concatenated together, with `joinStr` added in between each, to produce a final flat array
    * of fragments.
    */
    public joinFragmentArrays(fragmentsList: Base[], joinStr: string): any[];
  }

  /**
   * A **HoistTargetNode** represents the output location in the node tree for a hoisted node.
   * @see Base#hoist
   */
  export class HoistTarget extends Base {
    public isStatement(o: AbstractO): boolean;
  }

  export class Block extends Base {
    public expressions: Base[];
  }

  // Literal

  /**
   * `Literal` is a base class for static values that can be passed through
   * directly into JavaScript without translation, such as: strings, numbers,
   * `true`, `false`, `null`...
   */
  export class Literal extends Base {
    public value: string;
  }

  export class NumberLiteral extends Literal {}
  export class InfinityLiteral extends NumberLiteral {}
  export class NaNLiteral extends NumberLiteral {}
  export class StringLiteral extends Literal {}
  export class RegexLiteral extends Literal {}
  export class PassthroughLiteral extends Literal {}
  export class IdentifierLiteral extends Literal {}
  export class CSXTag extends IdentifierLiteral {}
  export class PropertyName extends Literal {}
  export class StatementLiteral extends Literal {}
  export class ThisLiteral extends Literal {}
  export class UndefinedLiteral extends Literal {}
  export class NullLiteral extends Literal {}
  export class BooleanLiteral extends Literal {}

  /* A `return` is a *pureStatement*—wrapping it in a closure wouldn’t make sense. */
  export class Return extends Base {
    public expression: Base[];
  }

  export class YieldReturn extends Return {}
  export class AwaitReturn extends Return {}

  export class Value extends Base {
    public base: Obj | Literal | PropertyName | Code | Call;
    public properties: Assign[] | Access[];
    public isDefaultValue: boolean;

    public shouldCache(): boolean;
    public assigns(name: string): boolean;
    public jumps(o: AbstractO): boolean;

    public isAssignable(): boolean;
    public isStatement(o: AbstractO): boolean;

    public hasProperties(): boolean;
    public isArray(): boolean;
    public isRange(): boolean;
    public isNumber(): boolean;
    public isString(): boolean;
    public isRegex(): boolean;
    public isUndefined(): boolean;
    public isNull(): boolean;
    public isBoolean(): boolean;
    public isAtomic(): boolean;
    public isNotCallable(): boolean;
    public isObject(onlyGenerated: boolean): boolean;
    public isSplice(): boolean;
    public looksStatic(className: string): boolean;
  }

  export class HereComment extends Base {
    public content: string;
    public newLine: boolean;
    public unshift: boolean;
  }

  export class LineComment extends Base {
    public content: string;
    public newLine: boolean;
    public unshift: boolean;
  }

  export class Call extends Base {
    public variable: Value;
    public args: Param[];
    // soak: boolean
    // token: Token

    public isNew: boolean;
    public csx: boolean;
  }

  export class SuperCall extends Call {
  }

  export class Super extends Base {
    public ancestor: Base;
  }

  export class RegexWithInterpolations extends Call {}
  export class TaggedTemplateCall extends Call {}

  export class Extends extends Base {
    public child: IdentifierLiteral;
    public parent: IdentifierLiteral;
  }

  export class Access extends Base {
    public name: IdentifierLiteral | PropertyName;
  }

  export class Index extends Base {
    public index: Value;
  }

  export class Range extends Base {
    public from: Value;
    public to: Value;
  }

  export class Slice extends Base {
    public range: Range;
  }

  export class Obj extends Base {
    public generated: boolean;
    public lhs: boolean;
    public objects: PropertyName[];
    public properties: Assign[];
    public hasSplat(): boolean;
  }

  export class Arr extends Base {
    public lhs: boolean;
    public objects: PropertyName[];
  }

  export class Class extends Base {
    public variable: Value;
    public parent: Base;
    public body: Block;
  }

  /** import and export */
  export class ModuleDeclaration extends Base {
    public clause: Base;
    public source: string;
  }

  export class ImportDeclaration extends ModuleDeclaration {}
  export class ImportClause extends Base {
    public defaultBinding: Base;
    public namedImports: Base;
  }

  export class ExportDeclaration extends ModuleDeclaration {}
  export class ExportNamedDeclaration extends ExportDeclaration {}
  export class ExportDefaultDeclaration extends ExportDeclaration {}
  export class ExportAllDeclaration extends ExportDeclaration {}

  export class ModuleSpecifierList extends Base {
    public specifiers: ModuleSpecifier[];
  }
  export class ImportSpecifierList extends ModuleSpecifierList {}
  export class ExportSpecifierList extends ModuleSpecifierList {}
  export class ModuleSpecifier extends Base {
    public original: Base;
    public alias: Base;
  }

  export class ImportSpecifier extends ModuleSpecifier {}
  export class ImportNamespaceSpecifier extends ImportSpecifier {}
  export class ExportSpecifier extends ModuleSpecifier {}

  class Assign extends Base {
    public variable?: Value;
    public value: Value | Code;
    public context: string;
    public options: {
      param: string
      subpattern: string
      operatorToken: string
      moduleDeclaration: 'import' | 'export',
    };
  }

  export class FuncGlyph extends Base {
    public glyph: '->' | '=>';
  }

  export class Code extends Base {
    public params: Param[];
    public body: Block;
    public funcGlyph: FuncGlyph;
    public bound: boolean;
    public isGenerator: boolean;
    public isAsync: boolean;
    public isMethod: boolean;
  }

  export class Param extends Base {
    public name: Literal | Value;
    public value?: Value;
    public splat?: Splat;
  }

  export class Splat extends Base {
    public name: Literal;
  }

  export class Expansion extends Base {}

  export class While extends Base {
    public condition: Base;
    public guard: Base;
    public body: Block;
  }

  export class Op extends Base {
    public first: string;
    public sencond: string;
  }

  export class In extends Base {
    public object: Base;
    public array: Base;
  }

  export class Try extends Base {
    public attempt: Block;
    public recovery: Block;
    public ensure: Block;
  }

  export class Throw extends Base {
    public expression: Base;
  }

  export class Existence extends Base {
    public expression: Base;
  }

  export class Parens extends Base {
    public body: Base;
  }

  export class StringWithInterpolations extends Base {
    public body: Base;
  }

  export class For extends While {
    public body: Block;
    public source: Base;
    public guard: Base;
    public step: Base;
  }

  export class Switch extends Base {
    public subject: Base;
    public cases: Base;
    public otherwise: Base;
  }

  export class If extends Base {
    public condition: Base;
    public body: Block;
    public elseBody: Block;
  }

  export interface LocationData {
    first_line: number;
    first_column: number;
    last_line: number;
    last_column: number;
  }
}

declare module 'coffeescript/lib/coffeescript/scope' {
  export class Scope {
    public variables: Array<{ name: string, type: string}>;
    public positions: any;
    public utilities?: any;
  }
}
