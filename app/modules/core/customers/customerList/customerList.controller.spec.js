'use strict';

describe('Controller: CustomerListCtrl', function () {
  var $rootScope, $scope, $httpBackend, HuronConfig, Config, Authinfo, $stateParams, $translate, $state, $templateCache, PartnerService, $window, TrialService, Orgservice, Log, Notification, $q;
  var controller, $controller;

  var adminJSONFixture = getJSONFixture('core/json/organizations/adminServices.json');
  var partnerService = getJSONFixture('core/json/partner/partner.service.json');
  var managedOrgsResponse = partnerService.managedOrgsResponse;
  var trialsResponse = partnerService.trialsResponse;
  var orgId = 1;
  var orgName = 'testOrg';
  var testOrg = {
    customerOrgId: '1234-34534-afdagfg-425345-afaf',
    customerName: 'ControllerTestOrg',
    customerEmail: 'customer@cisco.com'
  };
  var numberResponse = {
    numbers: [1, 2, 3]
  };
  var noNumberResponse = {
    numbers: []
  };

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$httpBackend_, _HuronConfig_, _Authinfo_, _$stateParams_, _$translate_, _$state_, _PartnerService_, _$window_, _TrialService_, _Orgservice_, _Notification_, _$controller_, _$q_) {
    $scope = $rootScope.$new();
    Authinfo = _Authinfo_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    $state = _$state_;
    PartnerService = _PartnerService_;
    $window = _$window_;
    TrialService = _TrialService_;
    Orgservice = _Orgservice_;
    Notification = _Notification_;
    $scope.timeoutVal = 1;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    $controller = _$controller_;
    $q = _$q_;

    spyOn($state, 'go');
    spyOn(Notification, 'error');

    spyOn(Authinfo, 'getOrgName').and.returnValue(orgName);
    spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(true);
    spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);

    spyOn(TrialService, 'getTrial').and.returnValue($q.when());
    spyOn(PartnerService, 'getManagedOrgsList').and.returnValue($q.when(managedOrgsResponse));
    spyOn(TrialService, 'getTrialsList').and.returnValue($q.when(trialsResponse));

    spyOn(Orgservice, 'getAdminOrg').and.callFake(function (callback, status) {
      callback(adminJSONFixture.getAdminOrg, 200);
    });
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback, orgId) {
      callback(getJSONFixture('core/json/organizations/Orgservice.json').getOrg, 200);
    });
  }));

  function initController() {
    controller = $controller('CustomerListCtrl', {
      $scope: $scope,
      $state: $state,
      Authinfo: Authinfo,
      Config: Config
    });

    $scope.$apply();
  }

  describe('Controller', function () {
    beforeEach(initController);

    it('should initialize', function () {
      expect($scope.activeFilter).toBe('all');
    });
  });

  describe('Click setup PSTN', function () {
    beforeEach(initController);

    it('not Terminus customer and has e164 numbers, should route to DID add', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + testOrg.customerOrgId).respond(404);
      $httpBackend.expectGET(HuronConfig.getCmiV2Url() + '/customers/' + testOrg.customerOrgId + '/numbers?type=external').respond(numberResponse);
      $scope.addNumbers(testOrg);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('didadd', {
        currentOrg: testOrg
      });
    });

    it('not Terminus customer and has no e164 numbers, should route to PSTN setup', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + testOrg.customerOrgId).respond(404);
      $httpBackend.expectGET(HuronConfig.getCmiV2Url() + '/customers/' + testOrg.customerOrgId + '/numbers?type=external').respond(noNumberResponse);
      $scope.addNumbers(testOrg);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: testOrg.customerOrgId,
        customerName: testOrg.customerName,
        customerEmail: testOrg.customerEmail
      });
    });

    it('exists as Terminus customer, should route to PSTN setup', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + testOrg.customerOrgId).respond(200);
      $scope.addNumbers(testOrg);
      $httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('pstnSetup', {
        customerId: testOrg.customerOrgId,
        customerName: testOrg.customerName,
        customerEmail: testOrg.customerEmail
      });
    });
  });

  describe('filterAction', function () {
    beforeEach(initController);

    it('a proper query wshould call out to partnerService and trialservice', function () {
      $scope.filterAction('1234');
      expect($scope.searchStr).toBe('1234');
      //this tests that getManagedOrgsList is  called , it is called once at init , so the count is expected to be 2 here
      expect(PartnerService.getManagedOrgsList.calls.count()).toEqual(2);
      expect(PartnerService.getManagedOrgsList).toHaveBeenCalledWith('1234');
      expect(TrialService.getTrialsList.calls.count()).toEqual(2);
      expect(TrialService.getTrialsList).toHaveBeenCalledWith('1234');
    });

  });

});
