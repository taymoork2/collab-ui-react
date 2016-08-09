'use strict';

describe('Controller: WebexOverviewController', function () {
  var controller, $controller, $scope, $q, $stateParams, PartnerService, TrialWebexService;

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$stateParams_,
    _PartnerService_, _TrialWebexService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    PartnerService = _PartnerService_;
    TrialWebexService = _TrialWebexService_;
    $stateParams = _$stateParams_;
    $controller = _$controller_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666',
      trialId: '12345'
    };

    spyOn(TrialWebexService, 'getTrialStatus').and.returnValue($q.when({
      siteUrl: 'webex.trial.com',
      timeZoneId: 1,
      pending: true
    }));
    spyOn(PartnerService, 'getSiteUrls').and.returnValue($q.when({
      data: ['webex.trial.com', 'webex.trial.com2']
    }));

  }));


  function initController() {
    controller = $controller('CustomerWebexOverviewCtrl', {
      $scope: $scope,
      $stateParams: $stateParams
    });
    $scope.$apply();
  }


  it('should be created successfully', function () {
    initController();
    expect(controller).toBeDefined();
  });

  describe('controller functions', function () {
    it('should get webex domains for active sites', function () {
      initController();
      expect(controller.domains.length).toBe(2);
    });

    it('when has trial and purchased domains should modify purchased domain and not create duplicate', function () {
      initController();
      expect(controller.domains.length).toBe(2);
      expect(controller.domains[0].timeZone).not.toBe(null);
      expect(controller.domains[1].timeZone).toBe(null);
    });

    it('should get webex domains for trial site', function () {
      $stateParams.currentCustomer.customerOrgId = null;
      initController();
      expect(controller.domains.length).toBe(1);
    });

    it('should build domain object correctly', function () {
      var site = controller.helpers.buildDomain('webex.site.com', 2, null);
      expect(site.siteUrl).toBe('webex.site.com');
      expect(site.timeZone).toBe('(GMT -10:00) Honolulu');
      expect(site.pending).toBe(true);

    });

  });

});
