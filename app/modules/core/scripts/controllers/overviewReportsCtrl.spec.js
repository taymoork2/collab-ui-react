'use strict';

describe('Controller: Overview Reports', function () {
  var controller, $rootScope, $scope, q, Notification, PartnerService, ReportsService, CannedDataService;
  var customerData = getJSONFixture('core/json/partnerReports/customerResponse.json');
  var REFRESH = 'refresh';
  var READY = 'ready';

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(customerData.customerOptions[3].value),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(customerData.customerOptions[3].label)
  };

  var reportStatusRefresh = {
    entitlements: REFRESH,
    avgCalls: REFRESH,
    activeUsers: REFRESH,
    contentShared: REFRESH
  };

  var reportStatusReady = {
    entitlements: READY,
    avgCalls: READY,
    activeUsers: READY,
    contentShared: READY
  };

  var allCustomers = {
    value: 0,
    label: 'reports.allCustomers'
  };

  var customerList = [];
  customerList.push(allCustomers);
  angular.forEach(customerData.customerOptions, function (org) {
    customerList.push({
      value: org.value,
      label: org.label
    });
  });

  var broadcastData = {
    data: {
      success: true
    }
  };

  // fake function used by mock services
  var emptyFunction = function () {};
  var validateService = {
    validate: emptyFunction
  };

  beforeEach(module('Core'));

  describe('OverviewReportsCtrl - Expected Responses', function () {
    beforeEach(inject(function ($controller, _$rootScope_, _$q_, _Notification_) {
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      Notification = _Notification_;
      q = _$q_;

      spyOn(Notification, 'notify');
      spyOn(validateService, 'validate');
      spyOn($scope, '$on');
      spyOn(AmCharts, 'makeChart').and.callFake(function (div, data) {
        return {
          'dataProvider': data,
          validateData: validateService.validate
        };
      });

      PartnerService = {
        getManagedOrgsList: jasmine.createSpy('getManagedOrgsList').and.callFake(function () {
          return q.when({
            data: {
              organizations: angular.copy(customerData.customerResponse)
            }
          });
        })
      };

      ReportsService = {
        getPartnerMetrics: jasmine.createSpy('getPartnerMetrics').and.callFake(emptyFunction)
      };

      CannedDataService = {
        isDemoAccount: jasmine.createSpy('isDemoAccount').and.callFake(function (id) {
          return false;
        }),
        getAllCustomersData: jasmine.createSpy('getAllCustomersData').and.callFake(emptyFunction),
        getIndCustomerData: jasmine.createSpy('getIndCustomerData').and.callFake(emptyFunction)
      };

      controller = $controller('OverviewReportsCtrl', {
        $scope: $scope,
        Authinfo: Authinfo,
        Notification: Notification,
        PartnerService: PartnerService,
        ReportsService: ReportsService,
        CannedDataService: CannedDataService
      });
      $scope.$apply();
    }));

    it('should instantiate all variables', function () {
      expect($scope.counts).toEqual({});
      expect($scope.reportStatus).toEqual(reportStatusRefresh);
      expect($scope.totalOrgsData).toEqual(customerList);
      expect($scope.currentSelection).toEqual(allCustomers);
      expect($scope.$on.calls.count()).toEqual(8);
    });

    it('getCustomerReports should set all reports status to refresh', function () {
      $scope.reportStatus = reportStatusReady;
      expect($scope.reportStatus).toEqual(reportStatusReady);
      $scope.getCustomerReports();
      expect($scope.reportStatus).toEqual(reportStatusRefresh);
    });

    it('isRefresh should return true', function () {
      expect($scope.isRefresh('entitlements')).toBeTruthy();
    });

    it('isRefresh should return false', function () {
      $scope.reportStatus['entitlements'] = READY;
      expect($scope.isRefresh('entitlements')).toBeFalsy();
    });

    it('reloadReports should return the currentSelection to default and set all reports status to refresh', function () {
      $scope.currentSelection = customerList[2];
      $scope.reportStatus = reportStatusReady;
      expect($scope.currentSelection).toEqual(customerList[2]);
      expect($scope.reportStatus).toEqual(reportStatusReady);

      $scope.reloadReports();
      expect($scope.currentSelection).toEqual(allCustomers);
      expect($scope.reportStatus).toEqual(reportStatusRefresh);
    });
  });
});
