'use strict';

var Promise = require('promise');
beforeEach(angular.mock.module('oc.lazyLoad', function ($provide) {
  var ocLazyLoadMock = jasmine.createSpyObj('$ocLazyLoad', ['load', 'inject', 'getModules', 'toggleWatch']);
  ocLazyLoadMock.inject.and.returnValue(Promise.resolve());
  $provide.value('$ocLazyLoad', ocLazyLoadMock);
}));

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
    _.forEach(providers, function (provider) {
      angular.mock.module([provider, function providerCallback(_provider) {
        this[provider] = _provider;
      }.bind(this)]);
    }, this);
  }

  /**
   * Inject each argument and assign to this context
   */
  this.injectDependencies = function () {
    var dependencies = _.toArray(arguments);
    return inject(function ($injector) {
      _.forEach(dependencies, function (dependency) {
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
      }, this);
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
      $scope: this.$scope
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
    this.injectDependencies('$compile', '$scope');
    this.view = this.$compile(angular.element(templateString))(this.$scope);
    this.$scope.$apply();
  };

  /**
   * Init a controller on this.controller and compile a template on this.view
   *
   * @param {String} controller Name of the controller
   * @param {String} template Path of the template
   * @param {Object} options Optional controller configuration
   */
  this.compileView = function (controller, template, options) {
    this.initController(controller, options);

    this.injectDependencies('$templateCache');
    var templateString = this.$templateCache.get(template);
    this.compileTemplate(templateString);
  };

  /**
   * Constructs and compiles a component
   * Sets this.view and this.controller with compiled template and controller
   *
   * @param {String} componentName Name of the component
   * @param {String} componentParamsObj Optional object of component bindings
   */
  this.compileComponent = function (componentName, componentParamsObj) {
    var component = _.kebabCase(componentName);
    var componentParams = '';
    if (_.isObject(componentParamsObj)) {
      componentParams = _.reduce(componentParamsObj, function (result, value, key) {
        result += ' ' + _.kebabCase(key) + '="' + value + '"';
        return result;
      }, '');
    }
    var componentString = '<' + component + componentParams + '></' + component + '>';
    this.compileTemplate(componentString);
    this.controller = this.view.controller(componentName);
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
