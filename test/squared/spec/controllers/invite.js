'use strict';

describe('Controller: InviteCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  var InviteCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InviteCtrl = $controller('InviteCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
