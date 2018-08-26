/// <reference types="coffeescript-types" />
import * as Nodes from 'coffeescript/lib/coffeescript/nodes';
import { Diagnostic, SymbolInformation, SymbolKind } from 'vscode-languageserver';
export interface ISymbolMetadata {
    name: string;
    kind: SymbolKind;
}
export declare class Parser {
    includeClosure: boolean;
    constructor({ includeClosure }?: {
        includeClosure: boolean;
    });
    validateSource(src: string): Diagnostic[];
    getSymbolsFromSource(src: string): SymbolInformation[];
    getExportedSymbolsFromSource(src: string): SymbolInformation[];
    _parse(src: string): Nodes.Block;
    getSymbolsFromClass(classNode: Nodes.Class): SymbolInformation[];
    getSymbolsFromBlock(block: Nodes.Block, container?: ISymbolMetadata): SymbolInformation[];
    getSymbolsFromObj(objNode: Nodes.Obj, container?: ISymbolMetadata): SymbolInformation[];
    getSymbolsFromAssign(assign: Nodes.Assign, container?: ISymbolMetadata): SymbolInformation[];
}
