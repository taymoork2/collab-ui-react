# Huron Functional Testing Guide
## General Info
* Our test partner in integration is **Huron UI TestPartner**
* Credentials are huron.ui.test.partner@gmail.com / Cisco@1234!
## Rules
* The test partner in integration is ONLY to be used for developing and running the functional tests.  **Do Not use this partner to create customers for manual testing for other slice development, BEMS cases, etc.  We have another partner for such uses and we reserve the right to obliterate any unrecognized customers from this partner without warning.**
* With the above rule in mind, not deleting a customer while iterating on development of functional tests is acceptable as long as the customer is deleted as soon as you are done with it.
* All tests are written in ES6 syntax.
* Protractor elements are abstracted into page elements.
* Use test utils in your expect statements, don't reinvent the wheel.
## Running Tests
* Locally
  * To run the tests locally in development, you must start Atlas locally via `yarn start`, then from another terminal window execute the protractor tests.
* Running a Single .spec File
  * To run a single test you can pass the --specs parameter:
`yarn protractor-babel --specs <path to spec file>`

```
yarn protractor-babel --specs  ./test/e2e-protractor/huron/functional/call-settings_spec.js
```
* Running with yarn:
`yarn protractor-babel --specs ./test/e2e-protractor/huron/functional/call-settings_spec.js`

* Via Sauce Labs
* Set following Environment variables to run the tests via Suaucelab.
* Unset following Environment variables to run the tests locally
```
export SAUCE__MAX_INSTANCES="2"
export SAUCE__USERNAME="atlas-web-limited"
export SAUCE__ACCESS_KEY="b99c8bc7-4a28-4d87-8cd8-eba7c688d48c"
export SAUCE__ORG_NAME="huron-ui-test-partner"

yarn protractor-babel --specs ./test/e2e-protractor/huron/functional/<test name>.js --int

```

* Ruuning all files in a given directory change directory to huron and apply the cmd.
```
yarn protractor-babel --suite huron --int

```

* The VS code debug launch config is  as follows for running a given sepc file in debugger mode

```
{
    "name": "Launch Protractor with Babel",
    "type": "node",
    "request": "launch",
    "program": "${workspaceRoot}/node_modules/.bin/protractor",
    // "args": [ "--specs", "${workspaceRoot}/test/e2e-protractor/squared/login_spec.js"],
    "args": [ "--specs", "${file}"],
    // "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/babel-node",
    // "runtimeArgs": [
    // "--nolazy"
    // ],
    "protocol": "inspector",
    "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/babel-node",
    "runtimeArgs": [
    "--presets=es2015"
    // "latest"
    ],
    // "stopOnEntry": false,
    "sourceMaps": true,
    "outFiles": []
    // "console": "internalConsole"
}
```

## Developing Tests
Listed below are some guidelines and best practices we need to follow when writing our tests.
* The outer `describe()` function should be formatted with 'Huron Functional: `<test name>`'
```
describe(‘Huron Functional: call-settings’, () => {…});
```
* The outer `describe()` function will implement a `beforeAll()` function that uses the provisioner to create the customer for the test and an `afterAll()` function that cleans up the customer via the provisioner when the test is done.
* The customer name will have the test name as part of its’ name.  Example:
```
customerName = `${os.userInfo().username}_call-settings`;
```
* The customer email will have the aforementioned customer name embedded in it.  Example:
```
`huron.ui.test.partner+${customerName}@gmail.com`
```
## Hints and Tips
We use [Jasmine 2](https://jasmine.github.io/) as our BDD test framework.  Listed below are some tips for test development:
* To disable a test, prepend with an `x`:
```
xit('should not run', () => {...});
```
* To disable an entire suite, prepend with an `x`:
```
xdescribe('should not run', () => {...});
```
* To force a test to be the only one run, prepend with an `f`:
```
fit('only I will run', () => {...});
```
* The same applies to a suite, prepend with an `f`:
```
fdescribe('only I will run', () => {...});
```
* To not have the provisioner delete your customer when done, use the `--provisionerKeepCustomer` flag when running protractor:
```
yarn protractor-babel --provisionerKeepCustomer --specs ./test/e2e-protractor/huron/functional/call-settings_spec.js
```
## Creating a customer:
```
const customer = huronCustomer({
  test: 'name-of-test',
  users: { noOfUsers: 5, noOfLines: 3 },
  places: { noOfPlaces: 3, noOfLines: 1 },
  numberRange: { beginNumber: '500', endNumber: '599' }
  pstn: 4,
  doHuntGroup: true,
  doCallPickup: true,
  doCallPark: true,
  doCallPaging: true,
  doAllFeatures: true,
  doFtsw: true,
  offers: 'CALL'
});
```
### `test:` This is the name of your test. Use kabob case.
### `users:` Define both the number of users and how many lines to provision for the test.
- Example: `users: { noOfUsers: 5, noOfLines: 3 }` will create 5 users, giving pstn to the first 3 users (max 10 users)
### `places:` Define both the number of places and how many lines to provision for the test.
- Example: `places: { nofOfPlaces: 3, nofOfLines: 2 }` will create 3 places, with the first 2 places recieving a pstn (max 5 places)
### `numberRange:` Defines the extension range, giving both a beginning number and and end number for the range.
### `pstn:` how many unassigned numbers to provision for testing. These can be added to users or places during testing.
* Note that if you create a group of users with 3 lines, a group of places with 1 line, and 4 pstns, you will provision a total of 8 lines, 3 assigned to users, 1 assigned to places, and 4 unassigned numbers.
### `doHuntGroup:` Toggles the hunt group feature. True toggles it on. If this is not called, it will default to false.
* This will create a hunt group with 2 users. Be sure there are at least 2 users created in the provisioner!
### `doCallPickup:` Toggles the call pickup feature. True toggles it on. If this is not called, it will default to false.
* This will create a call pickup group with 2 users. Be sure there are at least 2 users created in the provisioner!
### `doCallPark:` Toggles the call park feature. True toggles it on. If this is not called, it will default to false.
* This will create a call park group with 2 users. Be sure there are at least 2 users created in the provisioner!
### `doCallPaging:` Toggles the call paging feature. True toggles it on. If this is not called, it will default to false.
* This will create a call paging group with 1 user and 1 place. Be sure there are at least 1 of each created in the provisioner!
### `doAllFeatures:` Toggles all call features above to allow for testing.
* See the note on each of the above feature to see what gets implemented. This toggle will create 2 users and 2 places each with 2 dids. No need to add them via users and places toggle.
### `doFtsw:` Toggles the ability to do first time setup wizard. True allows for ftsw, false will have provisioner skip it.
### `offers:` Toggles different offers for customer.
- `'CALL'`: Creates a customer with call feature only
- `'ROOMSERVICES'`: Creates a customer with room services only
- `'NONE'`: Creates a customer with messaging only
- If not called, the customer will be created with call and roomservices.

### Also note that extensions have been fixedly assigned to prevent conflicts. As of now extensions are as follows:
- Places: 300-304
- Users: 310-319
- Hunt Group: 325
- Call Park: 350-359
- Call Paging: 375

Obviously if number range is set, the extensions will adjust (ie extension range is 500-599, Hunt Group will be 525).
