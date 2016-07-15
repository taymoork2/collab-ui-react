'use strict';

describe('Controller: LineListCtrl', function () {
  var controller, $controller, $q, $scope, $timeout, FeatureToggleService, LineListService, Notification;

  var lines = getJSONFixture('huron/json/lines/numbers.json');
  var count = getJSONFixture('huron/json/lines/count.json');

  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$q_, $rootScope, _$controller_, _$timeout_, _FeatureToggleService_, _LineListService_, _Notification_) {
    $q = _$q_;
    $timeout = _$timeout_;
    $controller = _$controller_;
    $scope = $rootScope.$new();
    FeatureToggleService = _FeatureToggleService_;
    LineListService = _LineListService_;
    Notification = _Notification_;

    spyOn(Notification, 'errorResponse');
    spyOn(Notification, 'error');

    spyOn(LineListService, 'getLineList').and.returnValue($q.when(lines));
    spyOn(FeatureToggleService, 'supports');

    controller = $controller('LinesListCtrl', {
      $scope: $scope
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
      expect($scope.gridData.length).toBe(3);
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
      FeatureToggleService.supports.and.returnValue($q.when(true));

      controller.setFilter('assignedLines');
      $scope.$apply();

      expect(LineListService.getLineList.calls.count()).toEqual(1);
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'userid', '-asc', '', 'assignedLines', $scope.gridData);
    });

    it('should call getLineList with filter unassignedLines', function () {
      FeatureToggleService.supports.and.returnValue($q.when(true));

      controller.setFilter('unassignedLines');
      $scope.$apply();

      expect(LineListService.getLineList.calls.count()).toEqual(1);
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'userid', '-asc', '', 'unassignedLines', $scope.gridData);
    });
  });

  describe('getLineList with exception', function () {
    it('should display notification on exception', function () {
      LineListService.getLineList.and.returnValue($q.reject());
      controller = $controller('LinesListCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('getLineList lineListUpdate event', function () {
    it('should update line list', function () {
      LineListService.getLineList.calls.reset();
      $scope.$emit('lineListUpdated', {});

      expect(LineListService.getLineList.calls.count()).toEqual(1);
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'userid', '-asc', '', 'all', $scope.gridData);
    });
  });

  describe('getLineList sort event', function () {
    it('should getLineList with sort parameters', function () {
      var data = {};
      data.fields = ["internalNumber"];
      data.directions = ["desc"];

      LineListService.getLineList.calls.reset();
      $scope.$emit('ngGridEventSorted', data);

      expect(LineListService.getLineList.calls.count()).toEqual(1);
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'internalnumber', '-desc', '', 'all', $scope.gridData);
    });

    it('should not getLineList when sort parameters do not change', function () {
      var data = {};
      data.fields = ["userId"];
      data.directions = ["asc"];

      LineListService.getLineList.calls.reset();
      $scope.$emit('ngGridEventSorted', data);
      expect(LineListService.getLineList).not.toHaveBeenCalled();
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
      expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'userid', '-asc', 'abc', 'all', $scope.gridData);
    });
  });

});
