'use strict';

describe('Controller: WebexOverviewController', function () {
  var controller, $controller, $scope, $q, $stateParams, PartnerService;

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$stateParams_, _PartnerService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    PartnerService = _PartnerService_;
    $stateParams = _$stateParams_;
    $controller = _$controller_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666',
      trialId: '12345'
    };


    spyOn(PartnerService, 'getSiteUrls').and.returnValue($q.when({
      data: {
        provOrderStatusResponses: [
          {
            siteUrl: 'webex.trial.com',
            timeZoneId: 1,
            provOrderStatus: 'PROVISIONED'
          }, {
            siteUrl: 'webex.nontrialsite.com',
            timeZoneId: 2,
            provOrderStatus: 'ERROR'
          }]
      }
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
      expect(controller.domains[1].siteUrl).toBe('webex.nontrialsite.com');
    });

    it('should build domain object correctly', function () {
      var site = controller.helpers.buildDomain('webex.site.com', 2, null);
      expect(site.siteUrl).toBe('webex.site.com');
      expect(site.timeZone).toBe('(GMT -10:00) Honolulu');
      expect(site.pending).toBe(true);

    });

  });

});
