'use strict';

describe('Controller: EntitlementdialogCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  var EntitlementdialogCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EntitlementdialogCtrl = $controller('EntitlementdialogCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
