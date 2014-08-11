'use strict';

describe('Controller: ActivateCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  var ActivateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ActivateCtrl = $controller('ActivateCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
