Testing Guidelines
===========================

Feature Toggles:
---------------------
* Can create conditional e2e test flows based on existence of feature toggles.
* Feature toggles are automatically initialized by the login page object: eg. `login.login('partner-admin')`
  * If you need to manually populate toggles, can be done directly with the utility `featureToggle.populateFeatureToggles(bearerToken)`
* Feature toggles can be used by importing the `featureToggle.utils.js` utility and referencing the same keys defined in `features.config.js` and used by the angular service `FeatureToggleService.features`
```js
// ${WX2_ADMIN_WEB_CLIENT_HOME}/test/e2e-protractor/utils/featureToggle.utils.js
var featureToggle = require('path/to/utils/featureToggle.utils');

it('should login', function () {
  login.login('partner-admin');
});

it('should do something conditional on atlasFeatureToggle', function () {
  if (featureToggle.features.atlasFeatureToggle) {
    utils.click(SOME_ELEMENT);
  } else {
    utils.click(ANOTHER_ELEMENT);
  }
});
```

Jasmine:
---------------------
* Suites (_describe()_ function)
  * Should be about a single feature/page
  * Can be nested
* Specs (_it()_ function)
  * Should be easy to read
  * Should be consise and specific to an individual use case
* Expectations (_expect()_ function)
  * Should be behavior driven
  * At least one expectation per spec
* Setup and Teardown
  * Can be used to initialize a page/test to a known state
  * _beforeEach()_ runs before each spec in a suite
  * _afterEach()_ runs after each spec in a suite
* Can disable suites and specs with _x_ prefix
  * _xdescribe()_
  * _xit()_

Protractor:
---------------------
* Angular vs non-angular apps
  * _browser_ object synchronizes with angular.  Will wait for angular to be ready (finshed timeouts and async requests).
  * _browser.driver_ object uses underlying WebDriverJS. Only use for non-angular apps.
* Avoid using Jasmine/WebDriverJS APIs when possible
  * _runs()_, _waits()_, _waitsFor()_, _browser.driver_
* Timeouts
  * Timed out waiting for Protractor to synchronize with the page
    * Asynchronous http requests and timeouts have not completed. Angular is not synchronized. Indicates performance problem.
  * Timed out waiting for spec to complete
    * Spec took longer than Jasmine's default timeout. Consider breaking up the spec into modular pieces or increasing the timeout for that individual spec.
* Promise management
  * WebDriverJS APIs are asynchronous and return promises, but are automatically managed for you in a control flow
    * Can execute serial commands instead of nesting _then()_ callback functions
    * Error handling specific actions - need to define a _then()_ callback and pass an error function
    * Jasmine expectations work with promises.  No need to nest expectations in callbacks.
      * _expect(pageElement.getText()).toEqual('My Text')_
  * Specs will wait to complete until control flow is empty
    * Corner case - asynchronous workflows not managed by WebDriverJS will need to completed with a _done()_ callback
* Animations
  * Can disable jQuery/Angular animations
  * Investigate use of Angular's animate service
  * Investigate webdriverjs-retry library for known animation scenarios
* Page Objects
  * Decouples page elements from test cases
  * Reduces code duplication
  * Easier maintenance
  * Create utility functions for events, actions, and assertions
