'use strict';

describe('Controller: WebexOverviewController', function () {
  var controller, $scope, $q, $stateParams, PartnerService, TrialWebexService;

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$stateParams_,
    _PartnerService_, _TrialWebexService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    PartnerService = _PartnerService_;
    TrialWebexService = _TrialWebexService_;
    $stateParams = _$stateParams_;

    spyOn(TrialWebexService, 'getTrialStatus').and.returnValue($q.when({
      siteUrl: 'webex.trial.com',
      timeZoneId: 1,
      pending: true
    }));
    spyOn(PartnerService, 'getSiteUrls').and.returnValue($q.when({
      data: ['webex.trial.com', 'webex.trial.com2']
    }));

    controller = $controller('CustomerWebexOverviewCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      $q: $q,
      PartnerService: PartnerService,
      TrialContextService: TrialWebexService
    });

    $scope.$apply();

  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  describe('controller functions', function () {
    beforeEach(function () {
      controller.domains = [];
      controller.custOrgId = null;
      controller.trialId = null;
      $scope.$apply();
    });

    it('should get webex domains for active sites', function () {
      controller.custOrgId = '1234';
      $scope.$apply();
      controller.getDomains();
      $scope.$apply();
      expect(controller.domains.length).toBe(2);

    });

    it('should get webex domains for trial site', function () {
      controller.trialId = '1234';
      $scope.$apply();
      controller.getDomains();
      $scope.$apply();
      expect(controller.domains.length).toBe(1);

    });

    it('when has trial and purchased domains should modify purchased domain and not create duplicate', function () {
      controller.trialId = '1234';
      controller.custOrgId = '1234';
      $scope.$apply();
      controller.getDomains();
      $scope.$apply();
      expect(controller.domains.length).toBe(2);
      expect(controller.domains[0].timeZone).not.toBe(null);
      expect(controller.domains[1].timeZone).toBe(null);
    });

    it('should build domain object correctly', function () {
      var site = controller.helpers.buildDomain('webex.site.com', 2, null);
      expect(site.siteUrl).toBe('webex.site.com');
      expect(site.timeZone).toBe('(GMT -10:00) Honolulu');
      expect(site.pending).toBe(true);

    });

  });

});
