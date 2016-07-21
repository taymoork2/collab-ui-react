'use strict';
describe('Controller: EdiscoveryReportsController', function () {
  beforeEach(angular.mock.module('Ediscovery'));

  var $controller, $q, $scope, $state, $translate, Authinfo, controller, EdiscoveryService, ReportUtilService;

  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _$state_, _$translate_, _Authinfo_, _EdiscoveryService_, _ReportUtilService_) {
    $state = _$state_;
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $translate = _$translate_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    EdiscoveryService = _EdiscoveryService_;
    ReportUtilService = _ReportUtilService_;

    sinon.stub(Authinfo, 'getOrgId');
    Authinfo.getOrgId.returns("ce8d17f8-1734-4a54-8510-fae65acc505e");

    sinon.stub(EdiscoveryService, 'getReports');
    var promise = $q.resolve({
      reports: {
        "displayName": "test",
        "url": "whatever",
        "id": "12345678"
      },
      paging: {
        count: 20,
        limit: 10,
        next: "n.a",
        offset: 0
      }
    });
    EdiscoveryService.getReports.withArgs(sinon.match.any, sinon.match.any).returns(promise);

    controller = $controller('EdiscoveryReportsController', {
      $translate: $translate,
      $scope: $scope,
      EdiscoveryService: EdiscoveryService
    });

  }));

  describe('Initially', function () {

    it('gets reports', function () {
      expect(controller.readingReports).toBeTruthy();
      $scope.$apply();
      expect(EdiscoveryService.getReports.callCount).toBe(1);
      expect(controller.readingReports).toBeFalsy();
    });

  });

});
