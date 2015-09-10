'use strict';

describe('Controller: LineListCtrl', function () {
  var controller, $q, $scope, $state, $httpBackend, $window, HuronConfig, Notification, Config, LineListService, $timeout;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$q_, $rootScope, _$httpBackend_, $controller, _$timeout_, _$translate_, _LineListService_, _Config_, _Notification_, Log, _HuronConfig_) {
    $q = _$q_;
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    Config = _Config_;
    Notification = _Notification_;
    LineListService = _LineListService_;
    $timeout = _$timeout_;
    $httpBackend.whenGET('/modules/huron/lines/all.json?count=100&searchStr=&skip=0&sortBy=name&sortOrder=ascending').respond(200, [{
      "internalNumber": "1000",
      "externalNumber": "+12145551000",
      "device": ["DX650", "DX70"],
      "userName": "john.doe@familymart.com"
    }, {
      "internalNumber": "1001",
      "externalNumber": "+12145551001",
      "device": "DX70",
      "userName": "michael.doe@familymart.com"
    }]);

    controller = $controller('LinesListCtrl', {
      $scope: $scope
    });
    $httpBackend.flush();
    $rootScope.$apply();
    $timeout.flush();

    spyOn(LineListService, 'getLineList');
    spyOn(Notification, "notify");

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('LineListCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    describe('after initialization', function () {
      it('should have filters and placeholders', function () {
        expect(controller.filters).toBeDefined();
        expect(controller.placeholder).toBeDefined();
      });

      it('should have filled with grid data', function () {
        expect($scope.gridData.length).toBe(2);
      });

    });

    describe('filter', function () {
      beforeEach(function () {
        LineListService.getLineList.and.returnValue($q.when());
      });

      it('should exist', function () {
        expect(controller.setFilter).toBeDefined();
      });

      it('should call getLineList with filter', function () {
        controller.setFilter('assignedLines');
        expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'name', 'ascending', '', 'assignedLines');
      });

      it('should call getLineList with filter', function () {
        controller.sort.by = 'externalNumber';
        controller.sort.order = 'descending';
        controller.setFilter('all');
        expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'externalNumber', 'descending', '', 'all');
      });
    });

    describe('search pattern filter', function () {
      beforeEach(function () {
        LineListService.getLineList.and.returnValue($q.when());
      });

      it('should exist', function () {
        expect(controller.filterList).toBeDefined();
      });

      it('should call getLineList with filter', function () {
        controller.filterList('100');
        $timeout.flush();
        expect(LineListService.getLineList).toHaveBeenCalledWith(0, 100, 'name', 'ascending', '100', 'all');
      });

    });

  });
});
