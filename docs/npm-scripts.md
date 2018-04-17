# npm Commands and Scripts

(yes, they're still npm scripts, but since we switched to `yarn` for managing npm dependencies, we use `yarn` here as well for consistency)

## Optional Arguments

Long-form arguments (e.g. `--foo`, `--bar=baz`) are passed through to the underlying script commands.

eg. `yarn start --noopen` passes the `--noopen` argument to underlying `start` script

#### Common build arguments

* `lite-server` arguments
  * `--noopen` to stop a new window on `serve`

* `webpack` arguments must be prefixed with `env.`
  * `--env.nolint` to prevent lint loaders during build
  * `--env.analyze` to open the bundle visual analyzer
  * `--env.noprogress` to hide the progress reporter

#### Common test arguments

* `--env.coverage` to enable code coverage
* `--env.lint` to enable linting during tests
* `--debug` to request debug mode
* `--phantomjs` to run tests through PhantomJS browser
* `--production-backend` to run e2e against production services
* `--sauce` to run e2e through SauceLabs
* `--specs` to specify specific e2e spec files
* `--suite` to specify e2e protractor suite
* `--verbose` to enable verbose logging

## Standard Commands

### `yarn`

* Install project dependencies

### `yarn start`

* Alias for `yarn serve`
* Installs yarn dependencies before serving
* Can opt-out of linting with `--env.nolint`

### `yarn test`

* Alias for `yarn ktest-all`
* Runs parallel karma unit tests with `karma.conf.js`
* Can opt-in to linting with `--env.lint`
* Can opt-in to code coverage with `--env.coverage`

## Custom Scripts

### `yarn analyze`

* Build the application with webpack
* Opens webpack-bundle-analyzer for the dist output

### `yarn build`

* Build the application with webpack
* Build output to `dist` directory

### `yarn clean-dist`

* Clean `build`, `dist` and `dist-source-map` directories

### `yarn commit`

* Starts a wizard to write a proper [git commit message](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit)

### `yarn coverage-report`

* Generates html/cobertura coverage report from the combined unit test instanbul results

### `yarn e2e`

* Runs protractor against production services and jenkins suite
* Used by the Jenkins build scripts

### `yarn eslint`

* Run eslint on entire project
* Use `yarn eslint --fix` to try to autofix as many issues as possible

### `yarn gauntlet-push`

* Runs `./bin/gauntlet-push.sh`
* Defaults to a fork remote name matching your userid
* Can specify specific fork with an argument `--fork=<remote>`

### `yarn json-verify`

* Verifies well-formed `.json` files

### `yarn ktest-all`

* Runs `./bin/ktest-all`
* Runs all karma unit tests in parallel

### `yarn ktest-all-no-parallel`

* Runs `./bin/ktest-all --no-parallel`
* Runs all karma unit tests

### `yarn ktest-all-watch`

* Runs `./bin/ktest-all --no-parallel --no-single-run --auto-watch`
* Runs all karma unit tests in watch mode for iterative development
* Reruns tests on app/test file changes
* Focus tests (`fdescribe`, `fit`) to isolate tests

### `yarn ktest-debug <tests>`

* Runs `./bin/ktest --no-parallel --no-single-run --debug`
* Runs specific karma unit tests in debug mode (chrome browser)

### `yarn ktest-watch <tests>`

* Runs `./bin/ktest --no-parallel --no-single-run --auto-watch`
* Runs specific karma unit tests in watch mode for iterative development

### `yarn languages-verify`

* Runs test to verify `l10n` language json files used in the app

### `yarn lint`

* Run eslint and tslint on entire project

### `yarn protractor`

* Updates webdriver and runs protractor

### `yarn protractor --specs <tests>`

* Updates webdriver and runs protractor on tests in specified files

### `yarn rebase-branch-and-update-fork`

* Runs `./bin/rebase-branch-and-update-fork.sh`
* Defaults to a fork remote name matching your userid
* Can specify specific fork with an argument `--fork=<remote>`

### `yarn serve`

* Bundles the application as webpack middleware and serves the dev application

### `yarn serve-dist`

* Serves the static content from the `dist` directory

### `yarn ts-spec-delete`

* Backwards-compatible utility to delete old compiled TypeScript spec files in the `app` directory

### `yarn tslint`

* Run tslint on entire project

### `yarn typings`

* Reinstalls TypeScript definitions from `typings.json`

### `yarn webdriver`

* Update webdriver
