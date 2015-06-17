'use strict';

describe('ExportUserStatusesController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var service, controller, $scope;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      $watch: sinon.stub()
    };
    controller = _$controller_('ExportUserStatusesController', {
      $scope: $scope,
      ExportUserStatusesController: service,
    });
  }));

  it('export header has correct names', function () {
    $scope.selectedServiceId = "myService";
    expect($scope.getHeader()).toEqual(["id", "email", "myService", "state", "message"]);
  });

});
