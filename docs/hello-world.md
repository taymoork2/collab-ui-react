## Adding a simple page ("Hello World")

**1. Add a new module**
* add new module folder:
  + `app/modules/helloWorld`
* add a feature/component directory to your module directory:
  + `.../helloWorld/sayHello`
* create a html template file to write:
  + `.../sayHello/sayHello.tpl.html`

```html
<!-- prefix controller references using controllerAs property in appconfig.js -->
<span>{{sayHello.hello}}</span>
```
* create the controller that writes "Hello World" to the scope:
  + `.../sayHello/sayHello.controller.js`

```js
(function(){
  angular.module('HelloWorld')
    .controller('SayHelloController', SayHelloController);

  /*@ngInject*/
  function SayHelloController(/*DI list*/){
    var vm = this;
    vm.hello = 'Hello world';
  }
})();
```
  * `.../say-hello/say-hello.controller.js`
* add an entry for the module for the app to bootstrap in: [app/scripts/app.js]

```js
angular.module('HelloWorld', [/* module dependencies array*/]);
```

* add a state for the route to your page in: [app/scripts/appconfig.js]

```js
.state('say-hello', {
  url: '/say-hello',
  views: {
    'main@': {
      templateUrl: 'modules/helloWorld/sayHello/sayHello.tpl.html',
      controller: 'SayHelloController',
      controllerAs: 'sayHello'
    }
  }
})
```
* find the proper permissions level / role (who can see this controller) adding a tab to `config.js` -> tabs array under: [app/modules/core/config/config.js]

```js
// use the 'state' key from appconfig
User: ['say-hello',..]
```

* Add a tab to include it in the ui for high level features in [app/modules/core/config/tabConfig.js]

```js
// it must match the 'state' and 'url' properties in the appconfig.js
{
    tab: 'sayHelloTab',
    icon: 'icon-user',
    title: 'tabs.sayHelloTab',
    state: 'say-hello',
    link: '/say-hello'
  },
```

**2. Add its proper unit and end-to-end tests**

* write unit tests and place them side by side the corresponding code under test
  * All unit tests are named the same as the corresponding code file, but append .spec.js
  * `'app/modules/helloWorld/sayHello/sayHello.controller.spec.js'`

* ***if your code is a core journey***
  * add a functional test folder for your module
    * `test/e2e-protractor/helloWorld`
  * add the new test directory to `config.e2eSuites` in `config/config.js`:
    * `helloWorld: e2e + '/helloWorld/**/*_spec.js'`
* **Testing Resources**
  * https://docs.angularjs.org/guide/unit-testing
  * http://www.pluralsight.com/courses/play-by-play-angular-testing-papa-bell
  * http://www.bradoncode.com/tutorials/angularjs-unit-testing/

**3. Test and Run**
* run the app using:
```bash
$ npm start
```
* you should see your new menu and when you click on it you should see the hello world page
* test the app using `npm run protractor -- --suite <module>`, this will test your module
* test the entire suite by running: `npm run protractor -- --suite jenkins`