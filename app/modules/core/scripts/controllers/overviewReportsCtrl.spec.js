'use strict';

describe('Controller: Overview Reports', function () {
  var $rootScope, $scope, q, Notification, PartnerService, ReportsService;
  var customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
  var REFRESH = 'refresh';
  var READY = 'ready';

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(customerData.customerOptions[3].value),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(customerData.customerOptions[3].label),
  };

  var allCustomers = {
    value: 0,
    label: 'reports.allCustomers',
  };

  var customerList = [];
  customerList.push(allCustomers);
  _.forEach(customerData.customerOptions, function (org) {
    customerList.push({
      value: org.value,
      label: org.label,
    });
  });

  // fake function used by mock services
  var emptyFunction = function () {};
  var validateService = {
    validate: emptyFunction,
  };

  beforeEach(angular.mock.module('Core'));

  describe('OverviewReportsCtrl - Expected Responses', function () {
    beforeEach(inject(function ($controller, _$rootScope_, _$q_, _Notification_) {
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      Notification = _Notification_;
      q = _$q_;

      spyOn(Notification, 'notify');
      spyOn(validateService, 'validate');
      spyOn($scope, '$on').and.callThrough();
      spyOn(AmCharts, 'makeChart').and.callFake(function (div, data) {
        return {
          'dataProvider': data,
          validateData: validateService.validate,
        };
      });

      PartnerService = {
        getManagedOrgsList: jasmine.createSpy('getManagedOrgsList').and.callFake(function () {
          return q.when({
            data: {
              organizations: _.cloneDeep(customerData.customerResponse),
            },
          });
        }),
      };

      ReportsService = {
        getPartnerMetrics: jasmine.createSpy('getPartnerMetrics').and.callFake(emptyFunction),
      };

      $controller('OverviewReportsCtrl', {
        $scope: $scope,
        Authinfo: Authinfo,
        Notification: Notification,
        PartnerService: PartnerService,
        ReportsService: ReportsService,
      });
      $scope.$apply();
    }));

    it('should instantiate all variables', function () {
      expect($scope.entCount).toEqual(0);
      expect($scope.entitlementStatus).toEqual(REFRESH);
      expect($scope.totalOrgsData).toEqual(customerList);
      expect($scope.currentSelection).toEqual(allCustomers);
      expect($scope.$on.calls.count()).toEqual(1);
    });

    it('getCustomerReports should set all reports status to refresh', function () {
      $scope.entitlementStatus = READY;
      expect($scope.entitlementStatus).toEqual(READY);
      $scope.getCustomerReports();
      expect($scope.entitlementStatus).toEqual(REFRESH);
    });

    it('should get entitlements count for all customers', function () {
      $rootScope.$broadcast('entitlementsLoaded', getJSONFixture('core/json/partnerReports/entitlementsManagedOrgs.json'));
      expect($scope.entCount).toBe(30);
    });

    it('should get entitlements count for a single customer', function () {
      $scope.currentSelection = {
        value: '111-222-333',
      };
      $rootScope.$broadcast('entitlementsLoaded', getJSONFixture('core/json/partnerReports/entitlements.json'));
      expect($scope.entCount).toBe(15);
    });
  });
});
