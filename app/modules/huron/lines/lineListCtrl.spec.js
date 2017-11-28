'use strict';

describe('Controller: LineListCtrl', function () {
  var controller, $controller, $q, $scope, $timeout, FeatureToggleService, LineListService, Notification, $state, Authinfo;

  var lines = getJSONFixture('huron/json/lines/numbers.json');
  var customerInfo = {
    orgId: '91745f4e-308f-489e-8e7d-3f07b7df4f95',
    customerName: 'abcef',
    customerAdminEmail: 'abc@my.org',
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$q_, $rootScope, _$controller_, _$timeout_, _FeatureToggleService_, _LineListService_, _Notification_, _$state_, _Authinfo_) {
    $q = _$q_;
    $timeout = _$timeout_;
    $controller = _$controller_;
    $state = _$state_;
    $scope = $rootScope.$new();
    FeatureToggleService = _FeatureToggleService_;
    LineListService = _LineListService_;
    Notification = _Notification_;
    Authinfo = _Authinfo_;

    spyOn(Notification, 'errorResponse');
    spyOn(Notification, 'error');
    spyOn($state, 'go');

    spyOn(Authinfo, 'getOrgId').and.returnValue(customerInfo.orgId);
    spyOn(Authinfo, 'getOrgName').and.returnValue(customerInfo.customerName);
    spyOn(Authinfo, 'getCustomerAdminEmail').and.returnValue(customerInfo.customerAdminEmail);
    spyOn(Authinfo, 'getLicenseIsTrial').and.returnValue(true);

    spyOn(LineListService, 'getLineList').and.returnValue($q.resolve(lines));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));

    controller = $controller('LinesListCtrl', {
      $scope: $scope,
      $state: $state,
      Authinfo: Authinfo,
    });

    $scope.$apply();
    $timeout.flush();
  }));

  describe('after initialization', function () {
    it('LineListCtrl should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    it('should have filters and placeholders', function () {
      expect(controller.filters).toBeDefined();
      expect(controller.placeholder).toBeDefined();
    });

    it('should have grid data', function () {
      expect(controller.gridOptions.data.length).toBe(4);
    });

    it('should show Actions column', function () {
      expect(controller.gridOptions.columnDefs.length).toBe(5);
    });

    it('should show Actions icon on rows with unassingnable externalNumbers', function () {
      expect(controller.canShowActionsMenu(controller.gridOptions.data[0])).toBeFalsy();
      expect(controller.canShowActionsMenu(controller.gridOptions.data[1])).toBeFalsy();
      expect(controller.canShowActionsMenu(controller.gridOptions.data[2])).toBeFalsy();
      expect(controller.canShowActionsMenu(controller.gridOptions.data[3])).toBeTruthy();
    });

    it('should show Delete menu item on rows with unassingnable externalNumbers', function () {
      expect(controller.canShowExternalNumberDelete(controller.gridOptions.data[0])).toBeFalsy();
      expect(controller.canShowExternalNumberDelete(controller.gridOptions.data[1])).toBeFalsy();
      expect(controller.canShowExternalNumberDelete(controller.gridOptions.data[2])).toBeFalsy();
      expect(controller.canShowExternalNumberDelete(controller.gridOptions.data[3])).toBeTruthy();
    });
  });

  describe('filter', function () {
    beforeEach(function () {
      LineListService.getLineList.calls.reset();
    });

    it('should exist', function () {
      expect(controller.setFilter).toBeDefined();
    });

    it('should call getLineList with filter assignedLines', function () {
      controller.setFilter('assignedLines');
      $scope.$apply();

      expect(LineListService.getLineList.calls.count()).toEqual(1);
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'userid', '-asc', '', 'assignedLines', controller.gridOptions.data, true);
    });

    it('should call getLineList with filter unassignedLines', function () {
      controller.setFilter('unassignedLines');
      $scope.$apply();

      expect(LineListService.getLineList.calls.count()).toEqual(1);
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'userid', '-asc', '', 'unassignedLines', controller.gridOptions.data, true);
    });
  });

  describe('getLineList with exception', function () {
    it('should display notification on exception', function () {
      LineListService.getLineList.and.returnValue($q.reject());
      controller = $controller('LinesListCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('getLineList sort event', function () {
    it('should getLineList with sort parameters', function () {
      LineListService.getLineList.calls.reset();

      var sortColumns = [{
        name: 'internalnumber',
        sort: {
          direction: 'asc',
        },
      }];

      controller.sortColumn($scope, sortColumns);
      expect(LineListService.getLineList.calls.count()).toEqual(1);
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'internalnumber', '-asc', '', 'all', controller.gridOptions.data, true);
    });
  });

  describe('search pattern filter', function () {
    beforeEach(function () {
      LineListService.getLineList.calls.reset();
    });

    it('should exist', function () {
      expect(controller.filterList).toBeDefined();
    });

    it('should call getLineList with filter', function () {
      controller.filterList('abc');
      $timeout.flush();

      expect(LineListService.getLineList.calls.count()).toEqual(1);
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'userid', '-asc', 'abc', 'all', controller.gridOptions.data, true);
    });
  });

  describe('showProviderDetails, true case', function () {
    it('should change the state on reseller exists true', function () {
      controller.showProviderDetails();

      expect($state.go).toHaveBeenCalledWith('pstnWizard', {
        customerId: customerInfo.orgId,
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerAdminEmail,
        customerCommunicationLicenseIsTrial: true,
        customerRoomSystemsLicenseIsTrial: true,
        refreshFn: controller.getLineList,
      });
    });
  });
});
