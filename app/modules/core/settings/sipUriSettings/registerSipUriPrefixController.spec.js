'use strict';

describe('Controller: RegisterSipUriPrefixCtrl', function () {
  var controller, $scope, Config, Orgservice, SparkDomainManagementService, $q, $controller, Notification;
  var orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  var getOrgStatus = 200;
  var rootScope;

  var authInfo = {
    getOrgId: sinon.stub().returns('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, _$controller_, _Notification_, _Config_, _$q_, _Orgservice_, _SparkDomainManagementService_) {
    $scope = $rootScope.$new();
    rootScope = $rootScope;
    SparkDomainManagementService = _SparkDomainManagementService_;
    Config = _Config_;
    $controller = _$controller_;
    Orgservice = _Orgservice_;
    Notification = _Notification_;
    $q = _$q_;

    SparkDomainManagementService.checkDomainAvailability = jasmine.createSpy().and.returnValue($q.when({
      data: {
        isDomainAvailable: true,
        isDomainReserved: false
      }
    }));

    SparkDomainManagementService.addSipUriDomain = jasmine.createSpy().and.returnValue($q.when({
      data: {
        isDomainAvailable: false,
        isDomainReserved: true
      }
    }));

    Orgservice.getLicensesUsage = jasmine.createSpy().and.returnValue($q.when([{
      licenses: [{
        offerName: 'SD'
      }]
    }]));

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback, status) {
      callback(orgServiceJSONFixture.getOrg, getOrgStatus);
    });
    spyOn(Notification, 'error');
  }));

  function initController() {
    controller = $controller('RegisterSipUriPrefixCtrl', {
      $scope: $scope,
      Authinfo: authInfo
    });

    $scope.$apply();
  }

  describe('test controller creation initialization', function () {
    beforeEach(initController);

    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });
    it('should call the Orgservice and set the displayName', function () {
      expect($scope.cloudSipUriField.inputValue).not.toBe('');
    });
  });

  describe('test Orgservice getOrg callback sets displayName under different conditions', function () {
    beforeEach(function () {
      Orgservice.getOrg.and.callFake(function (callback, status) {
        callback({
          verifiedDomains: ['AtlasTestSipUri.com', 'AtlasTest.com'],
          orgSettings: {}
        }, 200);
      });
      initController();
    });

    it('should set displayName using the verifiedDomains from response', function () {
      expect($scope.cloudSipUriField.inputValue).toBe('atlastestsipuri');
    });
  });

  describe('test Orgservice getOrg callback setting displayName', function () {
    beforeEach(function () {
      Orgservice.getOrg.and.callFake(function (callback, status) {
        callback(orgServiceJSONFixture.getOrg, 201);
      });
      initController();
    });

    it('should gracefully error', function () {
      expect(Notification.error).toHaveBeenCalled();
    });
  });

  describe('test if checkSipUriAvailability function sets isUrlAvailable to true', function () {
    beforeEach(initController);

    it('should check if checkSipUriAvailability in success state sets isUrlAvailable to true ', function (done) {
      $scope.cloudSipUriField.inputValue = 'shatest1';
      $scope.checkSipUriAvailability().then(function () {
        expect($scope.cloudSipUriField.isUrlAvailable).toEqual(true);
        expect(SparkDomainManagementService.checkDomainAvailability).toHaveBeenCalledWith($scope.cloudSipUriField.inputValue);
        done();
      });
      $scope.$apply();
    });

    it('should disable the field and clear error on the field validation', function () {
      $scope.cloudSipUriField.isUrlAvailable = true;
      $scope.cloudSipUriField.isConfirmed = true;
      $scope._saveDomain();
      $scope.$apply();
      expect($scope.cloudSipUriField.isError).toEqual(false);
      expect($scope.cloudSipUriField.isDisabled).toEqual(true);
    });

    it('should check if checkSipUriAvailability in success state is set to false ', function () {
      $scope.cloudSipUriField.inputValue = 'amtest2';
      $scope.checkSipUriAvailability();
      expect($scope.cloudSipUriField.isUrlAvailable).toEqual(false);
    });
  });

  describe('test if addSipUriDomain errors gracefully', function () {
    beforeEach(function () {
      SparkDomainManagementService.addSipUriDomain.and.returnValue($q.reject());
      initController();
    });

    it('addSipUriDomain should error gracefully', function () {
      $scope.cloudSipUriField.isUrlAvailable = true;
      $scope.cloudSipUriField.isConfirmed = true;
      $scope._saveDomain();
      $scope.$apply();
      expect(Notification.error).toHaveBeenCalled();
    });
  });

  describe('test if checkRoomLicense function sets isRoomLicensed to true', function () {
    beforeEach(initController);

    it('checkRoomLicense should set Room license to true', function () {
      expect($scope.cloudSipUriField.isRoomLicensed).toEqual(true);
    });
  });

  describe('test if checkRoomLicense function sets isRoomLicensed to false', function () {
    beforeEach(function () {
      Orgservice.getLicensesUsage.and.returnValue($q.when([{
        licenses: [{
          offerName: 'CF'
        }]
      }]));
      initController();
    });

    it('checkRoomLicense should set Room license to false', function () {
      expect($scope.cloudSipUriField.isRoomLicensed).toEqual(false);
    });
  });
});
