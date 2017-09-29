'use strict';

describe('controller: CbgsCtrl', function () {
  var $q, $scope, $state, $stateParams, filter, innerFilterSpy, $timeout, $controller, controller, cbgService, Notification, $httpBackend, UrlConfig;
  var callbackGroups = getJSONFixture('gemini/callbackGroups.json');

  var currentCallbackGroup = {
    callbackGroupSites: [],
    ccaGroupId: 'ff808081552e92e101552efcdb750081',
    customerAttribute: null,
    customerName: 'Test-Feng',
    groupName: 'CB_11111_Test-Feng',
    status: 'P',
    totalSites: 0,
  };

  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpecs);
  beforeEach(initController);

  afterEach(function () {
    $q = $httpBackend = UrlConfig = $scope = $state = filter = innerFilterSpy = $timeout = $controller = controller = cbgService = Notification = undefined;
  });

  afterAll(function () {
    callbackGroups = currentCallbackGroup = undefined;
  });

  function dependencies(_$q_, _$state_, _$httpBackend_, _UrlConfig_, _$timeout_, $rootScope, _$controller_, _$stateParams_, _cbgService_, _Notification_) {
    $q = _$q_;
    $state = _$state_;
    $timeout = _$timeout_;
    cbgService = _cbgService_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
  }

  function initSpecs() {
    innerFilterSpy = jasmine.createSpy();
    filter = jasmine.createSpy().and.returnValue(innerFilterSpy);
    spyOn($state, 'go');
    spyOn(Notification, 'errorResponse');
    spyOn(cbgService, 'cbgsExportCSV').and.returnValue($q.resolve());
    spyOn(cbgService, 'getCallbackGroups').and.returnValue($q.resolve());
  }

  function initController() {
    $stateParams.companyName = 'CB_11111_Test-Feng';
    $stateParams.customerId = $stateParams.customerId === '' ? $stateParams.customerId : 'ff808081552992ec0155299619cb0001';

    var getCountriesUrl = UrlConfig.getGeminiUrl() + 'countries';
    $httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);

    controller = $controller('CbgsCtrl', { $scope: $scope, $filter: filter, $stateParams: $stateParams });
  }

  it('should $rootScope.$on execute', function () {
    $scope.$emit('cbgsUpdate', true);
    expect(cbgService.getCallbackGroups).toHaveBeenCalled();
  });

  it('should onRequest have been called with gem.modal.request', function () {
    controller.onRequest();
    expect($state.go).toHaveBeenCalledWith('gem.modal.request', jasmine.any(Object));
  });

  it('should showCbgDetails have been called', function () {
    $scope.showCbgDetails(currentCallbackGroup);
    expect($state.go).toHaveBeenCalled();
  });

  describe('init', function () {
    it('should return correct array data when invoked cbgService.getCallbackGroups', function () {
      controller.gridRefresh = true;
      cbgService.getCallbackGroups.and.returnValue($q.resolve(callbackGroups));
      initController.call(this);
      $scope.$apply();
      expect(controller.gridRefresh).toBe(false);
    });

    it('should call Notification.errorResponse when invoked cbgService.getCallbackGroups return error response', function () {
      cbgService.getCallbackGroups.and.returnValue($q.reject({ status: 404 }));
      initController.call(this);
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should call $state.go when customerId\'s length is zero', function () {
      $stateParams.customerId = '';
      initController.call(this);
      $scope.$apply();
      expect($state.go).toHaveBeenCalled();
    });
  });

  describe('exportCSV', function () {
    it('should Notification.errorResponse when return error response', function () {
      cbgService.cbgsExportCSV.and.returnValue($q.reject({ status: 404 }));
      controller.exportCSV();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('return correct data', function () {
      var csvData = {};
      cbgService.cbgsExportCSV.and.returnValue($q.resolve(csvData));
      controller.exportCSV();
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
      $scope.gridData_ = callbackGroups;
      controller.filterList('Test');
      $scope.$apply();
      $timeout.flush();
      expect(filter).toHaveBeenCalledWith('filter');
      expect(controller.gridRefresh).toBe(false);
    });
  });
});
