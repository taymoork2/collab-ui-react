WebexSquared AdminWebClient
===========================

Contributor Style Guides
-----------
These style guides establish and enforce best practices
in order to improve code quality, maintainability, and readability.
All contributors are expected to take the time to learn and apply them.
Adherence is mandatory. Please refactor non-compliant code.

* [Javascript Style Guide](https://github.com/airbnb/javascript)
* [Angular Style Guide](https://github.com/johnpapa/angularjs-styleguide)
* [Git Commit Style Guide](http://chris.beams.io/posts/git-commit/)

**Additional Conventions**
* Indent using spaces not tabs
  * 2 space indentation - Javascript, HTML, and CSS
* When using the bard.js test helper you need to add a ESLint globals comment at the
    top of the file containing the dependencies in the spec, example:
      `/* globals $httpBackend, $rootScope, Authinfo, Userservice */`

If you have any questions open an
[issue](https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/issues/new)
and include the text: "Please add $cec_user_id to the 'Atlas UI Dev Team' room. Thanks!"

Technology
-----------

* UI is developed using [Angular JS](https://angularjs.org)
* ES6(ES2015) JavaScript is transpiled with [TypeScript](http://www.typescriptlang.org)
* UI is composed of a core module and service modules for different functional groups
* Modules are developed using directives, here is a good read on the topic:
  http://briantford.com/blog/angular-bower
* The backend of the application are written in Java Web Services, the ui services call the REST APIs
* Styling the application is done using SASS:
  http://sass-lang.com/
* Styling is based on Bootstrap CSS, a custom Cisco Bootstrap CSS is used for the portal:
  http://collab-lib.cisco.com/dist/#/overview
* Localization is done using angular translation
* Unit testing is written using Jasmine with Karma
* End to end testing is based on the JS Selenium framework: Protractor
* Build process is built and run with Gulp.js

Contribute
-----------

We use pull requests, and consequentially the forking model.  To make a contribution, you will need to fork this repository, make some changes, and then create a pull request with your changes.

1. From this web page, click **Fork** at the upper-right hand corner of the page
2. Select your username (e.g. @zzatking)
3. After your new fork is created, you'll want to pull the fork to your local environment, and add the upstream and jenkins remotes:
 - `git clone git@sqbu-github.cisco.com:username/wx2-admin-web-client`
 - `git remote add upstream git@sqbu-github.cisco.com:WebExSquared/wx2-admin-web-client`
 - `git remote add jenkins ssh://username@sqbu-jenkins.cisco.com:2022/team/atlas/wx2-admin-web-client`

**Note**: If you get a Permission Denied (publickey) then follow these directions in Generating SSH Keys
 `https://help.github.com/articles/generating-ssh-keys/`

When you're making changes to your fork, you'll push to your fork with `git push origin master`, and your pull request will get automatically updated with the latest pushes you've made.

When your pull request gets approved by someone, this means you're able to push to jenkins with `git push jenkins master`. Clicking the "Merge" button will not merge into master since we used gated builds. This means that Jenkins is the only one who is capable of pushing to master to ensure our repository stays clean.

![Workflow](https://sqbu-github.cisco.com/github-enterprise-assets/0000/1342/0000/2160/82b4329c-45a0-11e5-9796-166e317fd59a.png)

To summarize, this is the process:

1. You fork the wx2-admin-web-client repository
2. You make changes on your fork
3. You commit and push your changes to your fork (`git add`, `git commit`)
    Update and test your code by executing the following:
    'git fetch upstream'
    'git merge upstream/master'
    'git push origin'
    'gulp e2e --nofailfaist'
    Confirm all tests have passed and rerun any that didn't using the specs option
    (e.g. 'gulp e2e --nounit --specs="test/e2e-protractor/squared/failedtest"'')
4. You create a pull request
5. Someone reviews your code and gives you feedback
6. Eventually, your code will get approved
7. You pull and test latest code (see step #3)
8. You push to Jenkins to start a build ('git push jenkins master')
9. Your code gets merged

Branching
---------

If you're in a situation where you've been assigned to fix many different issues and need to keep your local environment clean, branching with git provides a very easy way to do this. Below is a good example of how to fix a defect without cluttering up your environment.

Let's say you've been assigned to fix a defect (#123) where users aren't being saved properly. You've forked the wx2-admin-web-client repository as the `master` branch, and you want to go about making changes so that you can fix this defect right away. The following is a list of steps to follow to accomplish this in a well organized manner:

1. Start by updating your `master` branch with `git pull upstream master`
2. Push your local `master` onto your GitHub account with `git push origin master`. This will even out the branch on your account.
3. Checkout a new branch with the defect number: `git checkout -b de123`
4. Fix the defect by modifying the appropriate code
5. Once you've finished fixing the defect, add your changes and commit: `git add file1 file2 ...`, `git commit -m "DE123: Users weren't being saved properly"`
6. Push the changes on the `de123` branch to your local account: `git push origin de123`. You'll notice that when you visit your GitHub account's fork (https://github-sqbu.cisco.com/username/wx2-admin-web-client), it will have a new branch in the drop down menu. You might also see a highlighted pop-up that asks you if you want to Compare & create a pull request.
  - Prior to doing a PR, sync your code with master and test as follows:
    'git fetch upstream'
    'git merge upstream/master'
    'git push -f origin'
    'gulp e2e --nofailfaist'
    Confirm all tests have passed and rerun any that didn't using the specs option
    (e.g. 'gulp e2e --nounit --specs="test/e2e-protractor/squared/failedtest"'')
7. When your pull request gets accepted and you need to push to Jenkins, you'll want to push your specific branch: `git push jenkins de123:master`
  - Prior to pushing, repeat the sync steps outlined in step #6

What's really nice about this process is that you can create many branches that have a separate set of changes associated with them. When you want to start working on fixing a defect, you don't have to worry about mixing up the changes for one defect with the changes of another.

Keeping your fork up-to-date
----------------------------

When contributing, it's important to keep your fork up-to-date with the master. You can do so by running the following command: `git pull upstream master`

Setup the environment (If necessary)
------------------------------------

* Install node.js version <= v0.12.x (for npm): http://nodejs.org/download/
* Run `./setup.sh` (found in the root directory)
  * Use `./setup.sh --restore` if ever needing to restore 'node_modules' and 'bower_components' dirs from the most recently successfully built dependencies (requires at least 1 successful run)
* Launch the app: `gulp serve`
* Before pushing any code to jenkins, always use `git fetch upstream && git merge upstream/master`
* After git pulls, run bower install and npm install to make sure to pull new dependencies.

TypeScript Definitions
-----------------
* Run 'gulp tsd' to install configured TypeScript definitions from tsd.json
* Definitions (\*.d.ts files) are installed under typings directory.
* Microsoft VSCode automatically detects definition files and provides IntelliSense support (https://code.visualstudio.com/Docs/languages/javascript)
* Add new TypeScript definitions using tsd (TypeScript Definition manager) from DefinitelyTyped (https://github.com/DefinitelyTyped/tsd)

TypeScript & ES6(ES2015)
-----------------
* ES6 and TypeScript are the preferred method of writing JavaScript in the app
* Writing Angular 1.x code in TypeScript and/or ES6 will allow for easier migration to Angular 2

Project structure
-----------------

* Every functional group has a directory structure under `app/modules`
* There is no need to edit the index.html file, all dependencies are managed through `gulp.config.js`
* Each module has a feature directory that contains the following content:
  - html template files
  - javacript controllers
  - directive JS files
  - scss style sheets
  - images should not be stored in the modules directory
* images should be placed in the images directory. They should organized with the same directory structure as the modules
* We have decided to organize the folders based on component and feature to best manage functionality
* The core module is the main framework of the application, it consists of the following:
  - Header
  - Left nav bar
  - Content panel
  - CIS Integration
  - User list
  - Preview and detail panels for users
 * All functionality must integrate into core through the user list or navigation menu items

Adding a simple page ("Hello World")
------------------------------------

* **BEFORE WRITING CODE**
  Please read the following BEST PRACTICES guidelines:
  Here is the recording and the presentation.

  PRESENTATION
  http://collab-lib.cisco.com/collab-library/presentations/ui-best-practices/#/

  PLAY RECORDING (1 hr 8 min 11 sec)
  https://cisco.webex.com/ciscosales/lsr.php?RCID=10b20fbacd884535bcbcffbf06d458d6

**1. Clone the repo**

**2. Add a new module**
* add new module folder:
  * **+**`app/modules/hello-world`
* add a feature directory to your module directory:
  * **+**`.../hello-world/say-hello`
* create a html template file to write `<span>{{hello}}</span>`:
  * **+**`.../say-hello/say-hello.tpl.html`
* create the controller that writes "Hello World" to the scope: `$scope.hello = 'Hello World!';`
  * **+**`.../say-hello/say-hello.controller.js`
* add an entry for the module for the app to bootstrap in: `app/scripts/app.js`
* add a state for the route to your page in: `app/scripts/appconfig.js`
* add a menu option by adding a tab to `config.js` -> tabs array under: `app/modules/core/scripts/services/config.js`

**3. Add its unit and end-to-end tests**
* add a functional test folder for your module:
  * **+**`test/e2e-protractor/hello-world`
* add the new test directory to `config.testFiles.e2e` in **gulp/gulp.config.js**:
  * **+**`hello-world: e2e + '/hello-world/**/*_spec.js'`
* write unit tests and place them side by side the corresponding code under test
  * All unit tests are named the same as the corresponding code file, but append .spec.js
  * **+**`say-hello: 'app/modules/hello-world/say-hello/say-hello.controller.spec.js'`
* write an end to end protractor test and place it in the new e2e folder
* **Testing Resources**
  * https://docs.angularjs.org/guide/unit-testing
  * http://www.pluralsight.com/courses/play-by-play-angular-testing-papa-bell
  * http://www.bradoncode.com/tutorials/angularjs-unit-testing/

**4. Test and Run**
* run the app using: `gulp serve`
* you should see your new menu and when you click on it you should see the hello world page
* test the app using `gulp e2e --specs=[your module]`, this will test your module
* test the entire suite by running: `gulp e2e`


Adding External Dependencies
----------------------------

* Dependencies are added to the project through Bower
* Add dependencies with `bower install package_name --save`
* Dependencies added to the `gulp.config.js` file will be automatically added to `index.html` and `karma.conf.js` files

Gulp.js Tasks
-------------

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

* Runs `gulp analyze:eslint, analyze:jslint` and `gulp plato tasks`
* Creates an analysis report of the JavaScript code using the plato analyzer tool
* Creates an HTML report at `/report/plato/index.html` of the results

### `gulp jsb`

* Runs `gulp analyze:eslint` and `gulp jsBeautifier:beautify` tasks

Run the protractor e2e test:
----------------------------

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

List of All Optional Arguments
------------------------------

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
