# TypeScript Overview

<!-- toc -->

- [Overview](#overview)
- [TypeScript as modern JavaScript](#typescript-as-modern-javascript)
  * [ECMAScript](#ecmascript)
  * [Best feature of ES2015+](#best-feature-of-es2015)
  * [Promises](#promises)
  * [Let and Const](#let-and-const)
  * [Template Literals](#template-literals)
  * [Assignment Destructuring](#assignment-destructuring)
  * [Arrow Functions](#arrow-functions)
  * [Classes](#classes)
  * [Modules](#modules)
- [TypeScript as a typed language](#typescript-as-a-typed-language)
- [TypeScript and AngularJS specificities](#typescript-and-angularjs-specificities)
- [Converting an AngularJS service to TypeScript.](#converting-an-angularjs-service-to-typescript)
  * [Simple service](#simple-service)

<!-- tocstop -->

## Overview

TypeScript is often considered as a superset of JavaScript, bringing types and type inference to the table. It makes the code easier to use inside big teams (better auto-completion, better statis analysis). Also, it's the language of choice for writing Angular 2 code.

Because it's a superset of JavaScript, renaming our current `.js` files to `.ts` could almost be sufficient, but we wouldn't benefit from the typing system and the latest improvements made to the language.

## TypeScript as modern JavaScript

### ECMAScript

ECMAScript (or ES) is a scripting-language specification standardized by Ecma International. It was based on JavaScript, which now tracks ECMAScript. Other implementations of ECMAScript include JScript and ActionScript.

ECMAScript had a few releases, and in 1999 they released ECMAScript 3 before they went into hibernation for the next 10 years. ECMAScript released its 5th Edition in 2009 (the 4th edition was abandoned) with features such as strict mode. Since then, ECMAScript has gained a lot of momentum and ECMAScript 6 was released in June 2015. It's probably the biggest update the standard ever received.

The sixth edition is a significant milestone in the history of JavaScript. Besides the dozens of new features, ES6 marks a key inflection point where ECMAScript would become a rolling standard. Revisions are now known by their release year: ES6 is also known as ES2015, ES7 is also referred to as ES2016, and so on.

TypeScript syntax is following as close as possible the ECMAScript standard. TypeScript 2.1+ supports all features up to ES2016 as well what should become ES2017.

Read more:
* [The JavaScript Standard](https://ponyfoo.com/articles/standard)
* [What's new in TypeScript](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript)

### Best feature of ES2015+

Because ES3 was the current standard when most people learned JavaScript and because ES5 did not bring many syntax changes, it's common to not know what happened after, when ES2015 was introduced. Here is quick, subjective, summary of the best features. If you want to learn more, we recommend [ES6 Overview in 350 Bullet Points](https://ponyfoo.com/articles/es6).

### Promises

A promise represents the eventual result of an asynchronous operation, and makes asynchronous JavaScript code supposedly easier to read than callbacks. The primary way of interacting with a promise is through its `then` method, which registers callbacks to receive either a promise's eventual value or the reason why the promise cannot be fulfilled.

Promises in ES2015 follow the [Promises/A+ specification](https://promisesaplus.com), which was widely implemented in the wild by many libraries before it was standarized.

In Atlas UI, we prefer using the [AngularJS built-in $q service](https://docs.angularjs.org/api/ng/service/$q) for handling promises.

```js
function asyncGreet(name) {
  // perform some asynchronous operation, resolve or reject the promise when appropriate.
  return $q(function(resolve, reject) {
    setTimeout(function() {
      if (okToGreet(name)) {
        resolve('Hello, ' + name + '!');
      } else {
        reject('Greeting ' + name + ' is not allowed.');
      }
    }, 1000);
  });
}

asyncGreet('Robin Hood')
  .then(function(greeting) {
    alert('Success: ' + greeting);
  })
  .catch(function(reason) {
    alert('Failed: ' + reason);
});
```

### Let and Const

`let` and `const` are alternatives to `var` when declaring variables. They are block-scoped instead of lexically scoped to a function. They are hoisted to the top of the block, while `var` declarations are hoisted to top of the function, which was often confusing developers.

:warning: `const` variables don't make the assigned value immutable!

```js
const foo = { bar: 'baz' } // means foo will always reference the right-hand side object

const foo = { bar: 'baz' };
foo.bar = 'boo'; // won't throw
```

Our recommendation in TypeScript: always use `const`, unless you are reassigning the variable which means you have to use `let`. Never use `var`.

Read [ES6 Let, Const and the “Temporal Dead Zone” (TDZ) in Depth](https://ponyfoo.com/articles/es6-let-const-and-temporal-dead-zone-in-depth).

### Template Literals

You can now declare strings with \` (backticks), in addition to `"` and `'`. Template literals can be multiline and they allow interpolation like:
```js
const rating = 'awesome';
console.log(`Hey John,

ES2015 is ${rating}!

Cheers,
Thomas`);
```
Not more string concatenation!

Read [ES6 Template Literals in Depth](https://ponyfoo.com/articles/es6-template-strings-in-depth).

### Assignment Destructuring

```js
const { data } = response;
// is equivalent to
const data = response.data;

const { data: cluster } = reponse;
// is equivalent to
const cluster = reponse.data

// It also works for arrays
[a, b] = [0, 1] // results in a === 0 and b === 1
```

Read [ES6 JavaScript Destructuring in Depth](https://ponyfoo.com/articles/es6-destructuring-in-depth).

### Arrow Functions

Arrow functions are a terse way to declare a function.
```js
const multiplyBy2 = (num) => {
  return num * 2;
}
// is equivalent to
const multiplyBy2 = function (num) {
  return num * 2;
}
```

They are bound to their lexical scope. Technically it means that:
```js
const returnName = () => {
  return this.name;
};
// is equivalent to
const returnName = function () {
  return this.name;
}.bind(this);
```

They return immediately if their body is only an expression, and parenthesis are not necessary if there is only one argument.
```js
// The first example could be rewritten as
const multiplyBy2 = num => num * 2;
// useful when doing functional stuff like
[1, 2].map(x => x * 2);
```

Read [ES6 Arrow Functions in Depth](https://ponyfoo.com/articles/es6-arrow-functions-in-depth).

### Classes

They aren't "traditional" classes, they are syntax sugar on top of prototypal inheritance.

```js
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}
// is equivalent to
var Greeter = (function () {
  function Greeter(message) {
    this.greeting = message;
  }
  Greeter.prototype.greet = function () {
    return "Hello, " + this.greeting;
  };
  return Greeter;
}());
```

Read [ES6 Classes in Depth](https://ponyfoo.com/articles/es6-classes-in-depth).

### Modules

Probably one of the best feature of ES2015, `export` and `import` syntax. But AngularJS and its dependency injection system is crashing the party.

Read [ES6 Modules Additions in Depth](https://ponyfoo.com/articles/es6-modules-in-depth).

## TypeScript as a typed language

Besides featuring a modern JavaScript syntax, TypeScript also brings:
* [Types](https://www.typescriptlang.org/docs/handbook/basic-types.html)
* [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html) (it means that you don't have to specify the types all the time)
* [Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
* [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
* [The `readonly` modifier](https://www.typescriptlang.org/docs/handbook/classes.html#readonly-modifier)

## TypeScript and AngularJS specificities

Because TypeScript is a superset of JavaScript, in theory we could simply rename `.js` files to `.ts` files, add some type annotations and be done with it. But AngularJS 1 types annotations have been written with the new `class` syntax in mind. It means that we have to convert our code to classes to make the most of TypeScript. 

## Converting an AngularJS service to TypeScript.

### Simple service

Here is an AngularJS service written in TypeScript. following all our guidelines and coding style guide. All comments are there just to help you understand what you should be looking for, expect `/* @ngInject */` which should always be there.

```js
// This anonymous function, called IIFE, is there to prevent the `HybridClusterService` service to leak globally. 
(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('HybridClusterService', HybridClusterService);

  /* @ngInject */
  function HybridClusterService($http, Authinfo, HybridClusterUtilitiesService, UrlConfig) {
    // That's how we define which methods are public
    var service = {
      get: get,
      setClusterName: setClusterName,
    };

    return service;

    // This function is private, not exposed
    function extractDataFromResponse(res) {
      return res.data;
    }

    function get(clusterId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '?fields=@wide')
        .then(extractDataFromResponse)
        .then(this.HybridClusterUtilitiesService.addExtendedInformation);
    }

    function setClusterName(clusterId, newClusterName) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.patch(url, {
        name: newClusterName
      })
      .then(extractDataFromResponse);
    }
  }
})
```

This is the same service written in idiomatic AngularJS 1.x TypeScript:

```typescript
// We don't need `'use strict';` or an IIFE because files are scoped and run in strict mode by default!

// HybridClusterUtilitiesService is a service we have already converted to TypeScript
// so we import it to benefit from its exposed type annotations
import { HybridClusterUtilitiesService } from 'modules/hybrid-services/angular-services/hybrid-cluster-utilities.service';

interface ICluster {
  id: string;
  name: string;
  // when too lazy to detail the look of connectors
  connectors: any[];
}

export class HybridClusterService {
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService, // All built-in AngularJS services types are available through ng.I*
    private Authinfo, // Authinfo is not written in TypeScript so we can't defined its type
    private HybridClusterUtilitiesService: HybridClusterUtilitiesService,
    private UrlConfig, // Same as Authinfo
  ) {}

  private extractDataFromResponse(res: ng.IHttpPromiseCallbackArg<any>) {
    return res.data;
  }

  public get(clusterId: string) {
    // Injected services are available using `this.`
    return this.$http
      // template literals!
      .get<ICluster>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}?fields=@wide'`)
      .then(this.extractDataFromResponse)
      .then(this.HybridClusterUtilitiesService.addExtendedInformation);
  }

  public setClusterName(clusterId, newClusterName) {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}`;
    return this.$http.patch(url, {
      name: newClusterName,
    })
    .then(this.extractDataFromResponse);
  }
}

// We expose it to Angular at the end now (classes are not hoisted)
// And we export the name of the module, to be a good citizen
module.exports = angular
  .module('Hercules')
  .service('HybridClusterService', HybridClusterService)
  .name;
```
