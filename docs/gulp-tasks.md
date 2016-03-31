## Gulp.js Tasks

### Available arguments

There are several arguments that can be added to the gulp tasks. Arguments are listed after the main tasks.

### `gulp`

* Default task runs the 'help' task which lists all of the available tasks

### `gulp build`

* Cleans (deletes) files in the 'build' & 'dist' directories
* Builds (copies) files from the development (app) folder into the staging (build) folder
* Transpiles ES6 and TypeScript code into ES5 JavaScript
* Compiles HTML templates into JS template file and adds them to the $templatecache
* Compiles index file by adding CSS links and JS script tags for dependencies
* Runs Karma Unit Tests on build folder

(Optional arguments)
* `--verbose`
* `--nounit`

### `gulp dist`

* Runs `gulp build` task first
* Compresses the images and copies them to the production (dist) directory
* Processes Angular files and makes them safe for minification (ng-annotate)
* Combines all CSS files into a single file for production (concat)
* Minifies CSS file
* Combines all JS files into a single file for production (concat)
* Minifies and Uglifies JS file
* Revisions files to prevent caching
* Compiles index file by adding CSS link and JS script tag for compiled files
* Minifies HTML files

(Optional arguments)
* --verbose
* --nounit

### `gulp serve`

* Runs `gulp build` and starts a Browsersync server from the build folder
* Starts a watch task that watches all of the files in the development (app) folder for changes
* Changes to files triggers tasks that copy updated files to the build folder and reloads the browser
* SCSS file changes are compiled and injected into the browser WITHOUT reloading the app
* The default browser is Google Chrome
* When using the `--browserall` arg, all browsers will be kept in-sync (i.e. clicks, scrolls, typing, etc.)

(Optional arguments)
* `--verbose`
* `--nounit`
* `--browserall`
* `--firefox`
* `--safari`
* `--dist`

### `gulp clean`

* Cleans/deletes all files in the staging (build) and production (dist) directories

### `gulp analyze`

* Runs all linters (`eslint`, `jscs`, `json`)
* Creates an analysis report of the JavaScript code using the plato analyzer tool if `--plato` provided
* Creates an HTML report at `/report/plato/index.html` of the results

### `gulp jsb`

* Runs `gulp eslint:app`, `gulp eslint:e2e` and `gulp jsBeautifier:beautify` tasks

## Run the protractor e2e test:

* Configurations are located in `protractor-config.js`
* Test files are located at `test/e2e-protractor/<test-file>_spec.js`
* Page objects are located at `test/e2e-protractor/pages/*.page.js`
* See `test/README.md` for guidelines

### `gulp e2e`

* Runs setup tasks (build/dist and connect)
* Then runs E2E tests on the dist folder

###### Optional e2e Arguments

##### `gulp e2e --specs=[your module]`
* Runs only tests from the module folder specified

##### `gulp e2e --specs=test/directoryname/filepath_spec.js`
* Runs only the test from the file specified

##### `gulp e2e --nounit`
* Skips unit testing during the e2e setup task

##### `gulp e2e --nosetup`
* Skips the e2e setup task
* You will need to have started a server manually using the `gulp connect` task

##### `gulp e2e --noretry`
* Runs tests without retrying failures

##### `gulp e2e --nofailfast`
* Runs tests without skipping after first failure

##### `gulp e2e --debug`
* Runs protractor in 'debug' mode
* See [Debugging Protractor Tests](https://github.com/angular/protractor/blob/master/docs/debugging.md) for details

##### `$ gulp e2e --build`
* Runs the e2e tests from the staging(build) directory

##### You can add any combination of the optional arguments when running the e2e testing task
* For example: `gulp e2e --specs=squared --nounit --build`

### `gulp connect`

* Starts a simple server from the production(dist) directory
* Used be the e2e task for running protractor tests
* Does not include watch or livereload functionality (use gulp serve for these)

(Optional Arguments)
* `--build`

## List of All Optional Arguments

### `--build`

* Applies the task to the build directory

### `--dist`

* Applies the task to the dist or production directory

### `--verbose`

* Prints file names from the source streams to the terminal during the task process as well as in the task comments

### `--nounit`

* Runs the task without running the unit tests

### `--nosetup`

* Specific to the 'e2e' testing task, runs the task without running the build and connect setup tasks

### `--specs`

* Runs a specific set of E2E tests
* You can run a specific test module i.e. `--specs=squared`
* You can also run a specific test file, i.e. `--specs=test/e2e-protractor/squared/activate_spec.js`

### `--debug`

* Runs protractor in 'debug' mode see [Debugging Protractor Tests](https://github.com/angular/protractor/blob/master/docs/debugging.md) for details

### `--browserall`

* `gulp serve` specific.
* When running 'gulp serve', use `--browserall` to open Google Chrome, Firefox and Safari all in-sync

### `--firefox`

* `gulp serve` specific.
* When running 'gulp serve', use `--firefox` to open Firefox

### `--safari`

* `gulp serve` specific.
* When running 'gulp serve', use `--safari` to open Safari