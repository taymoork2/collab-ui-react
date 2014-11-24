WebexSquared AdminWebClient
===========================


Setup the environment:
---------------------
* Use setup.sh or (if it fails):
* install node.js version >= v0.10.26 (for npm): http://nodejs.org/download/
* install rvm (to install ruby): $ \curl -sSL https://get.rvm.io | bash -s stable --ruby
* update gem and install gem dependencies: $ gem update --system
* $ gem install sass (Make sure to install sass first)
* $ gem install compass
* Run package managers in the cloned project to pull dependencies:
* $ npm install && bower install
* Launch the app: $ grunt serve
* Before pushing any code to jenkins, always use git pull --rebase
* After git pulls, run bower install and npm install to make sure to pull new dependencies.

Adding External Dependencies
----------------------------

* Dependencies are added to the project through Bower
* Add dependencies with $ bower install &lt;package name&gt; --save
* Dependencies are added to the index.html through the 'build.config.js' file
* Dependencies added to the 'build.config.js' file will be automatically added to index.html and karma.conf.js files

Grunt Tasks:
------------

### $ grunt

* Default task runs Build and Compile tasks

### $ grunt build

* Builds (copies) files from the development (app) folder into the staging (build) folder
* Compiles HTML templates into JS template file
* Compiles index file by adding CSS links and JS  script tags for dependencies
* Runs Karma Unit Tests on build folder

### $ grunt compile

* Must run $ grunt build first!
* Copies files from build folder to the dist folder
* Processes Angular files and makes them safe for minification (ng-annotate)
* Combines all CSS files into a single file for production (concat)
* Minifies CSS file
* Combines all JS files into a single file for production (concat)
* Minifies and Uglifies JS file
* Revisions files to prevent caching
* Compiles index file by adding CSS link and JS  script tag for compiled files
* Minifies HTML files
* Runs Karma Unit Tests on dist folder

### $ grunt serve

* Runs $ grunt build and starts a server from the build folder
* Starts a watch task that watches all of the files in the development (app) folder for changes
* Changes to files triggers tasks that copy updated files to the build folder and reloads the browser

### $ grunt serve:dist

* Runs $ grunt build and compile tasks, and starts a server from the dist folder
* No watch task is started on the dist folder

Run the protractor e2e test:
----------------------------

* Configurations are located in protractor-config.js
* Test files are located at test/e2e-protractor/<test-file>_spec.js
* Page objects are located at test/e2e-protractor/pages/*.page.js
* See test/README.md for guidelines

### $ grunt test

* Runs E2E tests on the dist folder

### $ grunt test:build

* Runs E2E tests on the build folder

### $ grunt test-squared

* Runs Squared specific E2E tests

### $ grunt test-huron

* Runs Huron specific E2E tests

### $ grunt test-hercules

* Runs Hercules specific E2E tests

Run the karma unit tests:
-------------------------

* Karma unit tests are run during the $ grunt build and $ grunt compile tasks

