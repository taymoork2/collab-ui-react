# NPM Commands and Scripts

## Optional Arguments

Arguments are passed to npm commands after a special `--` delimiter

eg. `npm start -- --noopen` passes the `--noopen` argument to our `start` task

#### Common build arguments

* `--nolint` to prevent lint loaders during build
* `--noopen` to stop a new window on `serve`

#### Common test arguments

* `--debug` to request debug mode
* `--production-backend` to run e2e against production services
* `--sauce` to run e2e through SauceLabs
* `--specs` to specify specific e2e spec files
* `--suite` to specify e2e protractor suite
* `--verbose` to enable verbose logging

## Standard NPM Commands

### `npm install`

* Install project dependencies

### `npm start`

* Alias for `npm run serve`

### `npm test`

* Alias for `npm run ktest-all`
* Runs parallel karma unit tests with `karma.conf.js`

## Custom NPM Scripts

### `npm run build`

* Build the application with webpack
* Build output to `dist` directory

### `npm run clean`

* Clean `build`, `dist` and `test` directories

### `npm run clean-install`

* Clean npm cache, `node_modules` directories, and reinstall `node_modules`

### `npm run combine-coverage`

* Combines the unit test istanbul coverage results

### `npm run e2e`

* Runs protractor against production services and jenkins suite
* Used by the Jenkins build scripts

### `npm run eslint`

* Run eslint on entire project

### `npm run jsb`

* Run `js-beautify` on the app

### `npm run jsb-verify`

* Run `js-beautify` on the app without modification
* Errors on unbeautified files

### `npm run json-verify`

* Verifies well-formed `.json` files

### `npm run ktest-all`

* Runs `./bin/ktest-all`
* Runs all karma unit tests in parallel

### `npm run ktest-all-no-parallel`

* Runs `./bin/ktest-all --no-parallel`
* Runs all karma unit tests

### `npm run ktest-all-watch`

* Runs `./bin/ktest-all --no-parallel --no-single-run --auto-watch`
* Runs all karma unit tests in watch mode for iterative development
* Reruns tests on app/test file changes
* Focus tests (`fdescribe`, `fit`) to isolate tests

### `npm run ktest-debug -- <tests>`

* Runs `./bin/ktest --no-parallel --no-single-run --debug`
* Runs specific karma unit tests in debug mode (chrome browser)

### `npm run ktest-watch -- <tests>`

* Runs `./bin/ktest --no-parallel --no-single-run --auto-watch`
* Runs specific karma unit tests in watch mode for iterative development

### `npm run languages-verify`

* Runs test to verify `l10n` language json files used in the app

### `npm run protractor`

* Updates webdriver and runs protractor

### `npm run serve`

* Bundles the application as webpack middleware and serves the dev application

### `npm run serve-dist`

* Serves the static content from the `dist` directory

### `npm run ts-spec-delete`

* Backwards-compatible utility to delete old compiled TypeScript spec files in the `app` directory

### `npm run typings`

* Reinstalls TypeScript definitions from `typings.json`

### `npm run webdriver`

* Update webdriver
