'use strict';

describe('Controller: DownloadsCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  var DownloadsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DownloadsCtrl = $controller('DownloadsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
