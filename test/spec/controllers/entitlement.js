'use strict';

describe('Controller: EntitlementCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  var EntitlementCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EntitlementCtrl = $controller('EntitlementCtrl', {
      $scope: scope
    });
  }));

  // it('should attach a list of awesomeThings to the scope', function () {
  //   expect(scope.awesomeThings.length).toBe(3);
  // });
});
