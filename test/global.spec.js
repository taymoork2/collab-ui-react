'use strict';

beforeEach(function () {
  /**
   * Initialize each argument as a module
   */
  this.initModules = function () {
    var initModules = _.toArray(arguments);
    _.forEach(initModules, function (initModule) {
      module(initModule);
    });
  };

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
