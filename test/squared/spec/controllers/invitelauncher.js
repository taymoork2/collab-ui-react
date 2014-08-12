'use strict';

describe('Controller: InvitelauncherCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  var InvitelauncherCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InvitelauncherCtrl = $controller('InvitelauncherCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
