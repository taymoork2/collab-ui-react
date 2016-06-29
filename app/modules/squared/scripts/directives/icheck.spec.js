'use strict';

describe('Directive: icheck', function () {

  // load the directive's module
  beforeEach(module('Squared'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  xit('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<icheck>this is the icheck directive</icheck>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the icheck directive');
  }));
});
