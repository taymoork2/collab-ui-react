## Setup the environment (If necessary)

* Install node.js version <= v0.12.x (for npm): http://nodejs.org/download/
* Run `./setup.sh` (found in the root directory)
  * Use `./setup.sh --restore` if ever needing to restore 'node_modules' and 'bower_components' dirs from the most recently successfully built dependencies (requires at least 1 successful run)
* Launch the app: `gulp serve`
* Before pushing any code to jenkins, always use `git fetch upstream && git merge upstream/master`
* After git pulls, run bower install and npm install to make sure to pull new dependencies.

## Recommended plugins for your Text Editor / IDE

* Sublime Text: [EditorConfig](https://github.com/sindresorhus/editorconfig-sublime),  [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint), [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#sublime-text)
* Atom: [EditorConfig](https://github.com/sindresorhus/atom-editorconfig), [linter-eslint](https://github.com/AtomLinter/linter-eslint), [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#atom)
* WebStorm / IntelliJ: [AngularJS snippets](https://github.com/johnpapa/angular-styleguide/tree/master/a1#webstorm) (EditorConfig and ESLint are handled by default in recent versions of JetBrains software)

## TypeScript Definitions

* Run 'gulp tsd' to install configured TypeScript definitions from tsd.json
* Definitions (\*.d.ts files) are installed under typings directory.
* Microsoft VSCode automatically detects definition files and provides IntelliSense support (https://code.visualstudio.com/Docs/languages/javascript)
* Add new TypeScript definitions using tsd (TypeScript Definition manager) from DefinitelyTyped (https://github.com/DefinitelyTyped/tsd)

## Adding External Dependencies

* Dependencies are added to the project through Bower
* Add dependencies with `bower install package_name --save`
* Dependencies added to the `gulp.config.js` file will be automatically added to `index.html` and `karma.conf.js` files