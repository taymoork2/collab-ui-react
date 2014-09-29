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
* $ bower install && npm install
* Launch the app: $ grunt serve
* Before pushing any code to jenkins, always use git pull --rebase
* After git pulls, run bower install and npm install to make sure to pull new dependencies.

Run the protractor e2e test:
----------------------------

* Run the tests: $ grunt protractor
* Configurations are located in protractor-config.js
* Test files are located at test/e2e-protractor/\<test-file\>_spec.js
* Page objects are located at test/e2e-protractor/pages/*.page.js
* See test/README.md for guidelines

Run the karma unit tests:
-------------------------

* Run the tests: $ grunt karma
* Configurations are located in karma.conf.js (add dependencies to be loaded for the test in the file)
* Unit test files are located at test/someModule/spec/.../test-file.js

Run all the tests:
------------------

* To run unit tests and e2e tests: $ npm test or $ grunt test

