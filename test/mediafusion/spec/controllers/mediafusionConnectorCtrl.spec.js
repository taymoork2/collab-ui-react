'use strict';

//Below is the Test Suit written for mediafusionConnectorCtrl.
describe('Controller: mediafusionConnectorCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MediafusionCtrl, scope;

  /* Initialize the controller and a mock scope
   * Reading the json data to application variable.
   * Making a fake call to return json data to make unit test cases to be passed.
   */
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();

    MediafusionCtrl = $controller('mediafusionConnectorCtrl', {
      $scope: scope
    });
  }));

  it('MediafusionCtrl controller should be defined', function () {
    expect(MediafusionCtrl).toBeDefined();
  });

  it('scope should not be null', function () {
    expect(scope).not.toBeNull();
  });

  it('scope should be defined', function () {
    expect(scope).toBeDefined();
  });

  it('grid oprions should be defined', function () {
    expect(scope.gridOptions).toBeDefined();
  });

});
