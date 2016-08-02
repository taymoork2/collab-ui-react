## Setup the environment

* Project requires node v4 and npm v2.
* Use [nvm](https://github.com/creationix/nvm) to manage your node versions
  * `nvm install 4` to install node v4 with npm v2
* `npm install` to install project dependencies (need to rerun after branch updates for new dependencies)
* `npm start` or `npm run serve` to serve the dev application

#### Alternative node/npm installation
* If you dislike the convenience of a node version manager, you can install node/npm directly
* Install `node4-lts`: `brew tap homebrew/versions && brew install node4-lts`
* Install npm 2: `brew install npm && npm install -g npm@latest-2`

#### Alternative project dependencies installation
* `setup.sh` facilitates dependency installation for Jenkins builds by using checksums and archiving last good dependencies
* Developers can also use `setup.sh` to install their node_modules, but it's **primary** functionality is for Jenkins
* Run `./setup.sh` (found in the root directory)
  * Use `./setup.sh --restore` if ever needing to restore 'node_modules' dirs from the most recently successfully built dependencies (requires at least 1 successful run)

## Recommended plugins for your Text Editor / IDE

* [Visual Studio Code](https://code.visualstudio.com/): [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [Chrome Debugger](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
* Sublime Text: [EditorConfig](https://github.com/sindresorhus/editorconfig-sublime),  [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint), [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#sublime-text)
* Atom: [EditorConfig](https://github.com/sindresorhus/atom-editorconfig), [linter-eslint](https://github.com/AtomLinter/linter-eslint), [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#atom)
* WebStorm / IntelliJ: [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#webstorm) (EditorConfig and ESLint are handled by default in recent versions of JetBrains software)

## TypeScript Definitions

* `npm run typings` to install configured TypeScript definitions from `typings.json`
* Definitions (\*.d.ts files) are installed under typings directory.
* Microsoft VSCode automatically detects definition files and provides IntelliSense support (https://code.visualstudio.com/Docs/languages/javascript)
* Add new TypeScript definitions using [typings (TypeScript Definition manager)](https://github.com/typings/typings)

## Adding External Dependencies

* Dependencies are added to the project through npm
* Add application dependencies with `npm install <package_name> --save`
* Add build dependencies with `npm install <package_name> --save-dev`
* [`require`](https://webpack.github.io/docs/commonjs.html) the package in the application for webpack to bundle the dependency in the included module
