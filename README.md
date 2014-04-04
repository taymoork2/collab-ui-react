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
* After git pulls, run bower install and npm install to make sure to pull new dependencies. 

Run the protractor e2e test:
----------------------------

* Run the tests: $ npm test or $ grunt test
* Configurations are located in protractor-config.js
* Test files are located at test/e2e-protractor/\<test-file\>_spec.js

