## Setup the environment

* Recommended using [nvm](https://github.com/creationix/nvm) to manage your node versions
* Install current node.js [Long-term Support (LTS) v4.x](https://nodejs.org/en/download/)
  ![g-gif-update](https://sqbu-github.cisco.com/github-enterprise-assets/0000/2093/0000/5682/dbe73b7e-f717-11e5-9cbf-4d1c308fc385.gif)
* Run `./setup.sh` (found in the root directory)
  * Use `./setup.sh --restore` if ever needing to restore 'node_modules' dirs from the most recently successfully built dependencies (requires at least 1 successful run)
* Launch the app: `gulp serve`
* After git pulls, run npm install to make sure to pull new dependencies.

## Recommended plugins for your Text Editor / IDE

* [Visual Studio Code](https://code.visualstudio.com/): [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [Chrome Debugger](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
* Sublime Text: [EditorConfig](https://github.com/sindresorhus/editorconfig-sublime),  [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint), [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#sublime-text)
* Atom: [EditorConfig](https://github.com/sindresorhus/atom-editorconfig), [linter-eslint](https://github.com/AtomLinter/linter-eslint), [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#atom)
* WebStorm / IntelliJ: [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#webstorm) (EditorConfig and ESLint are handled by default in recent versions of JetBrains software)

## TypeScript Definitions

* Run 'gulp tsd' to install configured TypeScript definitions from tsd.json
* Definitions (\*.d.ts files) are installed under typings directory.
* Microsoft VSCode automatically detects definition files and provides IntelliSense support (https://code.visualstudio.com/Docs/languages/javascript)
* Add new TypeScript definitions using tsd (TypeScript Definition manager) from DefinitelyTyped (https://github.com/DefinitelyTyped/tsd)

## Adding External Dependencies

* Dependencies are added to the project through npm
* Add application dependencies with `npm install package_name --save`
* Add build dependencies with `npm install package_name --save-dev`
* Dependencies added to the `gulp.config.js` file will be automatically added to `index.html` and `karma.conf.js` files