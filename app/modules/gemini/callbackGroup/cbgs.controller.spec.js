'use strict';

describe('controller: CbgsCtrl', function () {
  var $q, $scope, $state, filter, innerFilterSpy, $timeout, $controller, defer, deferCSV, controller, cbgService, Notification;
  var callbackGroups = getJSONFixture('gemini/callbackGroups.json');
  var currentCallbackGroup = {
    "callbackGroupSites": [],
    "ccaGroupId": "ff808081552e92e101552efcdb750081",
    "customerAttribute": null,
    "customerName": "Test-Feng",
    "groupName": "CB_11111_Test-Feng",
    "status": "P",
    "totalSites": 0
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpecs);
  beforeEach(initController);

  function dependencies(_$q_, _$state_, _$timeout_, $rootScope, _$controller_, _cbgService_, _Notification_) {
    $q = _$q_;
    $state = _$state_;
    defer = $q.defer();
    deferCSV = defer;
    $timeout = _$timeout_;
    cbgService = _cbgService_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Notification = _Notification_;
  }

  function initSpecs() {
    innerFilterSpy = jasmine.createSpy();
    filter = jasmine.createSpy().and.returnValue(innerFilterSpy);
    spyOn($state, 'go').and.returnValue($q.resolve());
    spyOn(Notification, 'errorResponse').and.returnValue($q.resolve());
    spyOn(cbgService, 'cbgsExportCSV').and.returnValue(deferCSV.promise);
    spyOn(cbgService, 'getCallbackGroups').and.returnValue(defer.promise);
  }


  function initController() {
    controller = $controller("CbgsCtrl", {
      $scope: $scope,
      $filter: filter,
      cbgService: cbgService
    });
  }

  it('should $rootScope.$on execute', function () {
    $scope.$emit('cbgsUpdate', true);
    expect(cbgService.getCallbackGroups).toHaveBeenCalled();
  });

  it('should onRequest have been called with gem.modal.request', function () {
    controller.onRequest();
    expect($state.go).toHaveBeenCalledWith('gem.modal.request', jasmine.any(Object));
  });

  /* TODO next time will do
   it('', function () {
   var grid = new Grid({ id: 1 });
   var gridApi = new GridApi(grid);
   gridApi.selection = {
   on: { rowSelectionChanged: sinon.stub.returns(currentCallbackGroup) }
   };
   controller.gridOptions.onRegisterApi(gridApi);
   expect(1).toBe(1);
   });
   */

  it('should showCbgDetails have been called', function () {
    $scope.showCbgDetails(currentCallbackGroup);
    expect($state.go).toHaveBeenCalled();
  });

  describe('should cbgService.getCallbackGroups', function () {
    it('return correct array data ', function () {
      defer.resolve(callbackGroups);
      controller.gridRefresh = true;
      $scope.$apply();
      expect(controller.gridRefresh).toBe(false);
    });

    it('return uncorrect array data', function () {
      defer.reject({});
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('should exportCSV', function () {
    it('return error', function () {
      controller.exportCSV();
      deferCSV.reject({});
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('return correct data', function () {
      controller.exportCSV();
      var csvData = { content: { data: { body: {} } } };
      deferCSV.resolve(csvData);
      $scope.$apply();
      $timeout.flush();
      expect(controller.exportLoading).toBe(false);
    });
  });

  describe('should filterList', function () {
    it('gridData_ empty', function () {
      controller.filterList('Test');
      $scope.$apply();
      $timeout.flush();
      expect(controller.searchStr).toBe('Test');
    });

    it('gridData_ not empty', function () {
      $scope.gridData_ = callbackGroups.content.data.body;
      controller.filterList('Test');
      $scope.$apply();
      $timeout.flush();
      expect(filter).toHaveBeenCalledWith('filter');
      expect(controller.gridRefresh).toBe(false);
    });
  });
});
