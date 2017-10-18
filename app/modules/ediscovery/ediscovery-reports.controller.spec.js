'use strict';

var ediscoveryModule = require('./ediscovery.module');
describe('Controller: EdiscoveryReportsController', function () {
  beforeEach(angular.mock.module(ediscoveryModule));

  var $controller, $q, $scope, $translate, Analytics, Authinfo, controller, EdiscoveryService, TrialService;

  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _$translate_, _Analytics_, _Authinfo_, _EdiscoveryService_, _TrialService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $translate = _$translate_;
    $q = _$q_;
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    EdiscoveryService = _EdiscoveryService_;
    TrialService = _TrialService_;

    var promise = $q.resolve({
      reports: {
        displayName: 'test',
        url: 'whatever',
        id: '12345678',
      },
      paging: {
        count: 20,
        limit: 10,
        next: 'n.a',
        offset: 0,
      },
    });

    spyOn(Analytics, 'trackEvent').and.returnValue($q.resolve({}));
    spyOn(Authinfo, 'getOrgId');
    spyOn(EdiscoveryService, 'getReports');
    spyOn(TrialService, 'getDaysLeftForCurrentUser');

    EdiscoveryService.getReports.and.returnValue(promise);
    Authinfo.getOrgId.and.returnValue('ce8d17f8-1734-4a54-8510-fae65acc505e');


    controller = $controller('EdiscoveryReportsController', {
      $translate: $translate,
      $scope: $scope,
      EdiscoveryService: EdiscoveryService,
    });
  }));

  afterEach(function () {
    $controller = undefined;
    $q = undefined;
    $scope = undefined;
    $translate = undefined;
    Authinfo = undefined;
  });

  describe('Initially', function () {
    it('gets reports', function () {
      expect(controller.readingReports).toBeTruthy();
      $scope.$apply();
      expect(EdiscoveryService.getReports.calls.count()).toBe(1);
      expect(controller.readingReports).toBeFalsy();
    });
  });
});
