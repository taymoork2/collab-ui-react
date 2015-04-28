WebexSquared AdminWebClient
===========================


Technology
----------

* UI is developed using Angular JS:
  https://angularjs.org
  https://github.com/johnpapa/angularjs-styleguide
* UI is composed of a core module and service modules for different functional groups
* Modules are developed using directives, here is a good read on the topic:
  http://briantford.com/blog/angular-bower
* The backend of the application are written in Java Web Services, the ui services call the REST APIs
* Styling the application is done using LESS:
  http://webdesign.tutsplus.com/articles/get-into-less-the-programmable-stylesheet-language--webdesign-5216
* Styling is based on Bootstrap CSS, a custom Cisco Bootstrap CSS is used for the portal:
  http://collab-lib.cisco.com/dist/#/overview
* Localization is done using angular translation
* Unit testing is written using Karma
* End to end testing is based on the JS Selenium framework: Protractor

Pull the code from the repository
---------------------------------

* git clone git@sqbu-github.cisco.com:WebExSquared/wx2-admin-web-client.git
* Once you have the repository you should be able to run: grunt serve from the root directory of the repo.
  If that doesnt work, you can manually install the necessary components for grunt in the next step

Setup the environment (If necessary)
------------------------------------

* Use setup.sh or (if it fails):
* install node.js version <= v0.10.28 (for npm): http://nodejs.org/download/
* update gem and install gem dependencies: $ gem update --system
* $ gem install sass (Make sure to install sass first)
* $ gem install compass
* Run package managers in the cloned project to pull dependencies:
* $ npm install && bower install
* Launch the app: $ grunt serve
* Before pushing any code to jenkins, always use git pull --rebase
* After git pulls, run bower install and npm install to make sure to pull new dependencies.

Project structure
-----------------

* Every functional group has a directory structure under app/modules
* There is no need to edit the index.html file, all dependencies are managed through build.config.js
* Each module has a feature directory that contains the following content:
  - html template files
  - javacript controllers
  - directive JS files
  - less style sheets
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
  http://10.89.58.222/collab-library/presentation/

  PLAY RECORDING (1 hr 8 min 11 sec) 
  https://cisco.webex.com/ciscosales/lsr.php?RCID=10b20fbacd884535bcbcffbf06d458d6 

* clone the repo
* add a folder under the app/modules directory
* add a feature directory under the module directory you created
* add a test folder for your module under test/e2e-protractor
* create a html template file to write <span> {{hello}} </span>
* create the controller js file that writes "Hello World" to the scope: $scope.hello = 'Hello World!';
* add a module to bootstrap to the app in: app/scripts/app.js
* add a state for the route to your page in: app/scripts/appconfig.js for your module
* add a menu option by adding a tab to config.js -> tabs array under: app/modules/core/scripts/services/config.js
* write an end to end protractor test and place it under: test/e2e-protractor/[your module]
* add a grunt task for your end to end test when executing tests in gruntfile.js
* run the app using: grunt serve
* you should see your new menu and when you click on it you should see the hello world page
* test the app using grunt test-[your module], this will test your module
* test the entire suite by running: grunt test


Adding External Dependencies
----------------------------

* Dependencies are added to the project through Bower
* Add dependencies with $ bower install &lt;package name&gt; --save
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

