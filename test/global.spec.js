'use strict';

/* eslint no-restricted-globals:0 */

var looserKebabCase = require('../utils/looser-kebab-case');
var consoleWarn = console.warn;
console.warn = function () {
  consoleWarn.apply(console, arguments);
  fail('Unhandled warning in unit test');
};

var Promise = require('promise');
require('oclazyload');
beforeEach(angular.mock.module('oc.lazyLoad', function ($provide) {
  var ocLazyLoadMock = jasmine.createSpyObj('$ocLazyLoad', ['load', 'inject', 'getModules', 'toggleWatch']);
  ocLazyLoadMock.inject.and.returnValue(Promise.resolve());
  $provide.value('$ocLazyLoad', ocLazyLoadMock);
}));

var testDurations;
var beforeAllMock = jasmine.Suite.prototype.beforeAll;
jasmine.Suite.prototype.beforeAll = function () {
  self.lastSuite = this.result
  beforeAllMock.apply(this, arguments)
};
var executeMock = jasmine.Spec.prototype.execute;
jasmine.Spec.prototype.execute = function () {
  self.lastTest = this.result
  executeMock.apply(this, arguments)
};

logLongDurationTests();

// Cleanup Detached DOM and DocumentFragments
afterEach(function () {
  if (this.view) {
    this.view.remove();
    this.view = undefined;
  }
});

beforeEach(function () {
  /**
   * Initialize each argument as a module
   */
  this.initModules = function () {
    var initModules = _.toArray(arguments);
    _.forEach(initModules, function (initModule) {
      angular.mock.module(initModule);
    });
  };

  this.injectProviders = function () {
    var providers = _.toArray(arguments);
    _.forEach(providers, _.bind(function (provider) {
      angular.mock.module([provider, function providerCallback(_provider) {
        this[provider] = _provider;
      }.bind(this)]);
    }, this));
  };

  /**
   * Inject each argument and assign to this context
   */
  this.injectDependencies = function () {
    var argumentDependencies = _.toArray(arguments);
    var commonDependencies = ['$http', '$httpBackend', '$q', '$scope'];
    var dependencies = _.union(argumentDependencies, commonDependencies);
    return inject(function ($injector) {
      _.forEach(dependencies, _.bind(function (dependency) {
        // skip if we already have this dependency
        if (_.has(this, dependency)) {
          return;
        }
        // make a new scope
        if (_.eq(dependency, '$scope')) {
          this.$scope = $injector.get('$rootScope').$new();
        } else {
          this[dependency] = $injector.get(dependency);
        }
      }, this));
    });
  };

  /**
   * Initialize a controller on this.controller
   *
   * @param {String} controller Name of the controller
   * @param {Object} options Optional controller configuration
   */
  this.initController = function (controller, options) {
    this.injectDependencies('$controller', '$scope');
    this.controller = this.$controller(controller, _.extend({
      $scope: this.$scope,
    }, _.get(options, 'controllerLocals')));
    var controllerAs = _.get(options, 'controllerAs');
    if (controllerAs) {
      _.set(this.$scope, controllerAs, this.controller);
    }
    this.$scope.$apply();
  };

  /**
   * Compile a template string on this.view
   *
   * @param {String} templateString String to compile
   */
  this.compileTemplate = function (templateString) {
    this.compileTemplateNoApply(templateString);
    this.$scope.$apply();
  };

  /**
   * Compile a template string on this.view, but don't apply scope.
   * Must call <code>this.$scope.$apply()</code> for the template string to actually be compiled and the view to be valid.
   *
   * @param {String} templateString String to compile
   */
  this.compileTemplateNoApply = function (templateString) {
    // if we're recompiling another view in the same test
    // Cleanup Detached DOM and DocumentFragments
    if (this.view) {
      this.view.remove();
      this.view = undefined;
    }

    this.injectDependencies('$compile', '$scope');
    this.view = this.$compile(angular.element(templateString))(this.$scope);
  };

  /**
   * Init a controller on this.controller and compile a template on this.view
   *
   * @param {String} controller Name of the controller
   * @param {String} templateString The template string
   * @param {Object} options Optional controller configuration
   */
  this.compileViewTemplate = function (controller, templateString, options) {
    this.initController(controller, options);
    this.compileTemplate('<div>' + templateString + '</div>');
  };

  /**
   * Constructs and compiles a component
   * Sets this.view and this.controller with compiled template and controller
   *
   * @param {String} componentName Name of the component
   * @param {String} componentParamsObj Optional object of component bindings
   */
  this.compileComponent = function (componentName, componentParamsObj) {
    var componentString = this.buildComponentTemplateString(componentName, componentParamsObj);
    this.compileTemplate(componentString);
    this.controller = this.view.controller(componentName);
  };

  /**
   * Constructs and compiles a component without applying scope.
   * Sets this.view and this.controller with compiled template and controller. Must call <code>this.$scope.$apply()</code>
   * for the component to actually be compiled and the view to be valid.
   *
   * @param {String} componentName Name of the component
   * @param {Object} componentParamsObj Optional object of component bindings. Any members whose values are objects will
   *                  also be added to the scope (<code>this.$scope</code>)
   */
  this.compileComponentNoApply = function (componentName, componentParamsObj) {
    var componentString = this.buildComponentTemplateString(componentName, componentParamsObj);
    this.compileTemplateNoApply(componentString);
    this.controller = this.view.controller(componentName);
  };

  /**
   * Builds a template string for compiling a component.
   *
   * @param (String} componentName Name of the component
   * @param {Object} componentParamsObj Optional object of component bindings. Any members whose values are objects will
   *                  also be added to the scope (<code>this.$scope</code>)
   * @returns {string} A template string suitable for compiling
   */
  this.buildComponentTemplateString = function (componentName, componentParamsObj) {
    var component = looserKebabCase(componentName);
    var componentParams = '';
    this.injectDependencies('$scope'); // just in case we have objects to inject
    // save this.$scope to be accessible inside _.reduce()
    var scope = this.$scope;
    if (_.isObject(componentParamsObj)) {
      componentParams = _.reduce(componentParamsObj, function (result, value, key) {
        var valueString;
        if (_.isUndefined(value)) {
          return result;
        }
        if (!_.isString(value)) {
          // set value to the name of the key added to scope
          valueString = key;
          // add to scope
          scope[key] = value;
        } else {
          valueString = value;
        }
        result += ' ' + looserKebabCase(key) + '="' + valueString + '"';
        return result;
      }, '');
    }
    var componentString = '<' + component + componentParams + '></' + component + '>';
    return componentString;
  };

  // Inspired by https://velesin.io/2016/08/23/unit-testing-angular-1-5-components/
  this.spyOnComponent = function (name, options) {
    function componentSpy($provide) {
      componentSpy.bindings = [];

      $provide.decorator(name + 'Directive', function ($delegate) {
        var component = $delegate[0];

        if (_.isObjectLike(component.transclude)) {
          component.transclude = true; // replace custom transcludes with single transclusion
        }
        component.template = component.transclude ? '<div ng-transclude></div>' : '';
        component.controller = function () {
          componentSpy.bindings.push(this);
        };
        _.assignIn(component, options);
        return $delegate;
      });
    }

    return componentSpy;
  };
});

describe('Global Unit Test Config', function () {
  // NOTE: fixturesPath is a singleton.  Changing this path changes it
  // for all tests!  Please know what you are doing before changing.
  jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures';

  // if (jasmine.version) { //the case for version 2.0.0
  //   //console.log('jasmine-version:' + jasmine.version);
  // } else { //the case for version 1.3
  //   //console.log('jasmine-version:' + jasmine.getEnv().versionString());
  // }
});

function logLongDurationTests() {
  beforeAll(function () {
    testDurations = [];
  });

  beforeEach(function () {
    this.startTime = new Date();
  });

  afterEach(function () {
    this.endTime = new Date();
    testDurations.push({
      name: self.lastTest.fullName,
      duration: this.endTime - this.startTime,
    });
  });

  afterAll(function () {
    var longTests = _.chain(testDurations)
      .filter(function (test) {
        return test.duration > 300;
      })
      .sortBy('duration')
      .reverse()
      .take(10)
      .map(function (test) {
        return '\n' + test.name + '. Duration: ' + test.duration;
      })
      .join('')
      .value();

    if (longTests.length) {
      self.console.log('Longest Duration Tests (> 300ms):', longTests);
    }
  });
}
