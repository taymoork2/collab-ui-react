'use strict';

describe('Controller: PartnerHomeCtrl', function () {
  var $scope, controller, $httpBackend, UrlConfig;

  var Orgservice;
  var adminJSONFixture = getJSONFixture('core/json/organizations/adminServices.json');

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873'),
    getMessageServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/messagingServices.json')),
    getCommunicationServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/commServices.json')),
    getConferenceServices: sinon.stub(),
    isPartnerAdmin: sinon.stub()
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _UrlConfig_, _Orgservice_) {
    $scope = $rootScope.$new();
    $rootScope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
    Orgservice = _Orgservice_;

    spyOn(Orgservice, 'getAdminOrg').and.callFake(function (callback, status) {
      callback(adminJSONFixture.getAdminOrg, 200);
    });

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    controller = $controller('PartnerHomeCtrl', {
      $scope: $scope,
      $rootScope: $rootScope,
      Orgservice: Orgservice
    });

  }));

  beforeEach(function () {
    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'organization/5632f806-ad09-4a26-a0c0-a49a13f38873/trials').respond(function () {
      var data = getJSONFixture('core/json/partner/trialsResponse.json');
      return [200, {
        trials: data
      }, {}];
    });
    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'organizations/5632f806-ad09-4a26-a0c0-a49a13f38873/managedOrgs').respond(function () {
      var data = getJSONFixture('core/json/partner/trialsResponse.json');
      return [200, {
        organizations: data
      }, {}];
    });
    $httpBackend.flush();
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('PartnerHomeCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
      expect($scope.totalTrials).toEqual(2);
      expect($scope.totalOrgs).toEqual(2);
    });

    it('should set the first row licenses states to trial', function () {
      expect($scope.trialsList[0].messaging.sortOrder).toEqual(1);
      expect($scope.trialsList[0].conferencing.sortOrder).toEqual(1);
      expect($scope.trialsList[0].communications.sortOrder).toEqual(0);
    });

    it('should set the second communications to canceled/suspended', function () {
      expect($scope.trialsList[1].messaging.sortOrder).toEqual(99);
      expect($scope.trialsList[1].conferencing.sortOrder).toEqual(99);
      expect($scope.trialsList[1].communications.sortOrder).toEqual(99);
    });

    it('should call isLicenseInfoAvailable', function () {
      expect($scope.isLicenseInfoAvailable(['one', 'two'])).toEqual(true);
    });

  });

});
