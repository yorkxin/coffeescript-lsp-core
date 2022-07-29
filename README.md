# coffeescript-lsp-core

CoffeeScript Language Server Protocol core libraries in Node.js.

Used by [VSCode CoffeeScript Support](https://github.com/chitsaou/vscode-coffeescript-support) Extension.

## :wave: DEPRECATED DUE TO INACTIVE DEVELOPMENT :wave:
Check out this one instead: https://github.com/phil294/coffeesense/tree/master/server

## Contents

- `Parser` - Parses CoffeeScript AST nodes into `vscode-languageserver` interfaces.
- `SymbolIndex` - A database used to manage symbols.
- `bin/coffeescript-symbol-indexer.js` - A CLI that runs indexer. Used by VSCode CoffeeScript Support for background indexing.

## License

MIT
