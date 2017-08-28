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
  * To run the tests locally in development, you must start Atlas locally via `npm start`, then from another terminal window execute the protractor tests.
* Running a Single .spec File
  * To run a single test you can pass the --specs parameter:
`npm run protractor-babel -- --specs <path to spec file>`
```
npm run protractor-babel -- --specs ./test/e2e-protractor/huron/functional/call-settings_spec.js
```
* Via Sauce Labs
```
export SAUCE__MAX_INSTANCES="2"
export SAUCE__USERNAME="atlas-web-limited"
export SAUCE__ACCESS_KEY="b99c8bc7-4a28-4d87-8cd8-eba7c688d48c"
npm run protractor-babel -- --specs ./test/e2e-protractor/huron/functional/<test name>.js --sauce --int
```

* Ruuning all files in a given directory change directory to huron and apply the cmd.
```
npm run protractor-babel -- --suite huron --sauce --int
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
npm run protractor-babel -- --provisionerKeepCustomer --specs ./test/e2e-protractor/huron/functional/call-settings_spec.js
```

* By default, the provisioner will skip the first time setup wizard (ftsw).
* If you need to test some functionality of the first time setup wizard, the constructor will take a true/false value.
* `True` will cause the provisioner to not skip the ftsw. Default is `false`. Example:
* `const customer = huronCustomer('<test case>', null, null, null, null, true);`
```