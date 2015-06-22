'use strict';

describe('ExportUserStatusesController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Authinfo, service, controller, $scope, $httpBackend, UssService;

  beforeEach(inject(function (_$controller_) {

    $scope = {
      $watch: sinon.stub()
    };
    Authinfo = {
      getServices: function () {
        return [{
          "ciService": "squared-fusion-cal",
          "displayName": "myService"
        }];
      }
    };

    controller = _$controller_('ExportUserStatusesController', {
      Authinfo: Authinfo,
      UssService: UssService,
      $scope: $scope
    });
  }));

  it('column title for service name is based on authinfo displayname', function () {
    $scope.selectedServiceId = "squared-fusion-cal";
    $scope.getHeader();
    expect($scope.loading).toBe(true);
    expect($scope.getHeader()).toEqual(["id", "email", "myService", "state", "message"]);
  });

});
