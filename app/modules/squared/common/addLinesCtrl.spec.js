'use strict';

describe('AddLinesCtrl: Ctrl', function () {
  var controller, $stateParams, $state, $scope, Notification, $q, CommonLineService, CsdmPlaceService, DialPlanService;
  var $controller;
  var $httpBackend;
  var internalNumbers;
  var externalNumbers;
  var externalNumberPool;
  var externalNumberPoolMap;
  var sites;
  var entitylist;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$controller_, $rootScope, _$q_, _$state_, _$stateParams_, _Notification_, _CsdmPlaceService_, _CommonLineService_, _DialPlanService_, _$httpBackend_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    Notification = _Notification_;
    CommonLineService = _CommonLineService_;
    CsdmPlaceService = _CsdmPlaceService_;
    DialPlanService = _DialPlanService_;
    var current = {
      step: {
        name: 'fakeStep'
      }
    };

    var data = {
      data: {
        deviceName: "Red River"
      }
    };

    function state() {
      var data = {
        data: {
          name: 'Red River'
        }
      };
      return data;
    }

    $scope.entitylist = [{
      name: "Red River"
    }];

    $scope.wizard = {};
    $scope.wizard.current = current;

    $stateParams.wizard = {};
    $stateParams.wizard.state = state;
    $scope.wizardData = data;

    function isLastStep() {
      return false;
    }
    $scope.wizard.isLastStep = isLastStep;

    spyOn($state, 'go');

    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    entitylist = $scope.entitylist;
    entitylist[0].externalNumber = externalNumberPool[0];

    sites = getJSONFixture('huron/json/settings/sites.json');

    spyOn(Notification, 'notify');

    spyOn(CommonLineService, 'getInternalNumberPool').and.returnValue(internalNumbers);
    spyOn(CommonLineService, 'loadInternalNumberPool').and.returnValue($q.when(internalNumbers));
    spyOn(CommonLineService, 'getExternalNumberPool').and.returnValue(externalNumbers);

    spyOn(CommonLineService, 'loadExternalNumberPool').and.returnValue($q.when(externalNumbers));
    spyOn(CommonLineService, 'loadPrimarySiteInfo').and.returnValue($q.when(sites));
    spyOn(CommonLineService, 'mapDidToDn').and.returnValue($q.when(externalNumberPoolMap));
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when({
      extensionGenerated: 'false'
    }));

    spyOn(CommonLineService, 'assignMapUserList').and.returnValue((entitylist));

    entitylist[0].assignedDn = internalNumbers[0];
    spyOn(CommonLineService, 'assignDNForUserList').and.callThrough();
    spyOn(CsdmPlaceService, 'createCmiPlace');
  }));

  function initController() {
    controller = $controller('AddLinesCtrl', {
      $scope: $scope,
      $state: $state,
      CommonLineService: CommonLineService
    });

  }

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });
  beforeEach(installPromiseMatchers);

  describe('Places Add DID and DN assignment', function () {
    beforeEach(function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/null/v1/Users/me')
        .respond({});
      initController();
      $scope.entitylist = [{
        name: "Red River"
      }];

      $scope.$apply();
    });

    it('activateDID', function () {

      controller.activateDID();
      $scope.$apply();

      expect($scope.externalNumber.pattern).toEqual('+14084744532');
      expect(CommonLineService.assignDNForUserList).toHaveBeenCalled();
    });

    it('mapDidToDn', function () {
      initController();
      $scope.internalNumberPool = internalNumbers;
      $scope.externalNumberPool = externalNumberPool;
      $scope.showExtensions = false;
      controller.mapDidToDn();
      $scope.$apply();
      expect($scope.externalNumber.pattern).toEqual('+14084744532');
    });

  });

});
