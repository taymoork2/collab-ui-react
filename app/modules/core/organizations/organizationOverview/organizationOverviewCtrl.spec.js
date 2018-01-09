'use strict';

describe('Controller: organizationOverviewCtrl', function () {
  var controller, $scope, Orgservice, $q, $controller, Notification, currentOrganization;
  var authInfo = {
    getOrgId: jasmine.createSpy('getOrgId'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function ($rootScope, _$controller_, _Notification_, _$q_, _Orgservice_) {
    $scope = $rootScope.$new();
    Orgservice = _Orgservice_;
    $controller = _$controller_;
    Notification = _Notification_;
    $q = _$q_;
    currentOrganization = getJSONFixture('core/json/organizations/adminServices.json').getAdminOrg;

    spyOn(Orgservice, 'getEftSetting').and.returnValue($q.resolve({
      data: {
        eft: true,
      },
    }));
    spyOn(Orgservice, 'setEftSetting').and.returnValue($q.resolve({}));
    spyOn(Orgservice, 'setHybridServiceReleaseChannelEntitlement').and.returnValue($q.resolve({}));
    spyOn(Orgservice, 'getAdminOrg').and.callFake(function (callback) {
      callback(currentOrganization, 200);
    });
    spyOn(Notification, 'errorResponse');
  }));

  function initController(services) {
    currentOrganization.services = services;
    controller = $controller('OrganizationOverviewCtrl', {
      $scope: $scope,
      Authinfo: authInfo,
      $stateParams: {
        currentOrganization: currentOrganization,
      },
    });
    $scope.$apply();
  }

  describe('OrganizationOverviewCtrl Initialization: ', function () {
    beforeEach(function () {
      initController();
    });

    it('should initialize the OrganizationOverviewCtrl controller', function () {
      expect(controller).toBeDefined();
    });

    it('should load the the org on init', function () {
      expect(Orgservice.getAdminOrg.calls.count()).toEqual(1);
    });
  });

  describe('test that updateEftToggle function sets isEFT: ', function () {
    beforeEach(function () {
      initController();
    });

    it('should check if updateEftToggle in success state sets isEFT to true', function () {
      _.set($scope, 'currentOrganization.isEFT', false);
      $scope.updateEftToggle();
      $scope.$apply();
      expect($scope.isEFT).toEqual(true);
      expect($scope.eftToggleLoading).toEqual(false);
    });
  });

  describe('test the updateEftToggle function; call to getEftSetting errors: ', function () {
    beforeEach(function () {
      Orgservice.getEftSetting = jasmine.createSpy().and.returnValue($q.reject());
      initController();
    });

    it('should gracefully error', function () {
      $scope.updateEftToggle();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
      expect($scope.eftToggleLoading).toEqual(false);
    });
  });

  describe('test that setEftToggle function sets isEFT: ', function () {
    beforeEach(function () {
      initController();
    });

    it('should check if setEftToggle in success state sets isEFT to value passed', function () {
      $scope.currentEftSetting = false;
      var setting = true;
      $scope.setEftToggle(setting);
      $scope.$apply();
      expect($scope.isEFT).toEqual(setting);
    });
  });

  describe('test that setEftToggle function sets isEFT: ', function () {
    beforeEach(function () {
      Orgservice.setEftSetting = jasmine.createSpy().and.callFake(function () {
        return $q.reject();
      });
      initController();
    });

    it('should check if setEftToggle in error state gracefully errors', function () {
      $scope.currentEftSetting = false;
      var setting = true;
      $scope.setEftToggle(setting);
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should check if setEftToggle in error state reverts the isEFT toggle', function () {
      $scope.currentEftSetting = false;
      var setting = true;
      $scope.setEftToggle(setting);
      $scope.$apply();
      expect($scope.isEFT).toEqual($scope.currentEftSetting);
    });
  });

  describe('test that allow hybrid services release channels behave: ', function () {
    it('should not show hybrid services if missing squared-fusion-mgmt entitlement', function () {
      initController([]);
      expect($scope.showHybridServices).toBeFalsy();
    });

    it('should show hybrid services and init the release channels when squared-fusion-mgmt is entitled', function () {
      initController(['squared-fusion-mgmt']);
      expect($scope.showHybridServices).toBeTruthy();
      expect($scope.betaChannel).toBeDefined();
      expect($scope.betaChannel.newAllow).toBeFalsy();
      expect($scope.betaChannel.oldAllow).toBeFalsy();
      expect($scope.betaChannel.name).toEqual('beta');
      expect($scope.latestChannel).toBeDefined();
      expect($scope.latestChannel.newAllow).toBeFalsy();
      expect($scope.latestChannel.oldAllow).toBeFalsy();
      expect($scope.latestChannel.name).toEqual('latest');
    });

    it('should init the release channels to allowed if beta and latest entitlements are set', function () {
      initController(['squared-fusion-mgmt', 'squared-fusion-mgmt-channel-beta', 'squared-fusion-mgmt-channel-alpha', 'squared-fusion-mgmt-channel-latest']);
      expect($scope.showHybridServices).toBeTruthy();
      expect($scope.betaChannel.newAllow).toBeTruthy();
      expect($scope.betaChannel.oldAllow).toBeTruthy();
      expect($scope.betaChannel.name).toEqual('beta');
      expect($scope.alphaChannel.newAllow).toBeTruthy();
      expect($scope.alphaChannel.oldAllow).toBeTruthy();
      expect($scope.alphaChannel.name).toEqual('alpha');
      expect($scope.latestChannel.newAllow).toBeTruthy();
      expect($scope.latestChannel.oldAllow).toBeTruthy();
      expect($scope.latestChannel.name).toEqual('latest');
    });

    it('should set allow true for the beta release channel when not entitled and toggled', function () {
      initController(['squared-fusion-mgmt']);
      var channelSentToBackend = null;
      var allowSentToBackend = null;
      Orgservice.setHybridServiceReleaseChannelEntitlement.and.callFake(function (orgId, channel, allow) {
        channelSentToBackend = channel;
        allowSentToBackend = allow;
        return $q.resolve({});
      });
      $scope.betaChannel.newAllow = true;
      $scope.toggleReleaseChannelAllowed($scope.betaChannel);
      $scope.$apply();
      expect(Orgservice.setHybridServiceReleaseChannelEntitlement.calls.count()).toEqual(1);
      expect(channelSentToBackend).toEqual('beta');
      expect(allowSentToBackend).toBeTruthy();
      expect($scope.betaChannel.oldAllow).toBeTruthy();
    });

    it('should set allow true for the alpha release channel when not entitled and toggled', function () {
      initController(['squared-fusion-mgmt']);
      var channelSentToBackend = null;
      var allowSentToBackend = null;
      Orgservice.setHybridServiceReleaseChannelEntitlement.and.callFake(function (orgId, channel, allow) {
        channelSentToBackend = channel;
        allowSentToBackend = allow;
        return $q.resolve({});
      });
      $scope.alphaChannel.newAllow = true;
      $scope.toggleReleaseChannelAllowed($scope.alphaChannel);
      $scope.$apply();
      expect(Orgservice.setHybridServiceReleaseChannelEntitlement.calls.count()).toEqual(1);
      expect(channelSentToBackend).toEqual('alpha');
      expect(allowSentToBackend).toBeTruthy();
      expect($scope.alphaChannel.oldAllow).toBeTruthy();
    });

    it('should set allow true for the latest release channel when not entitled and toggled', function () {
      initController(['squared-fusion-mgmt']);
      var channelSentToBackend = null;
      var allowSentToBackend = null;
      Orgservice.setHybridServiceReleaseChannelEntitlement.and.callFake(function (orgId, channel, allow) {
        channelSentToBackend = channel;
        allowSentToBackend = allow;
        return $q.resolve({});
      });
      $scope.latestChannel.newAllow = true;
      $scope.toggleReleaseChannelAllowed($scope.latestChannel);
      $scope.$apply();
      expect(Orgservice.setHybridServiceReleaseChannelEntitlement.calls.count()).toEqual(1);
      expect(channelSentToBackend).toEqual('latest');
      expect(allowSentToBackend).toBeTruthy();
      expect($scope.latestChannel.oldAllow).toBeTruthy();
    });

    it('should set allow false for the beta release channel when entitled and toggled', function () {
      initController(['squared-fusion-mgmt', 'squared-fusion-mgmt-channel-beta']);
      var channelSentToBackend = null;
      var allowSentToBackend = null;
      Orgservice.setHybridServiceReleaseChannelEntitlement.and.callFake(function (orgId, channel, allow) {
        channelSentToBackend = channel;
        allowSentToBackend = allow;
        return $q.resolve({});
      });
      $scope.betaChannel.newAllow = false;
      $scope.toggleReleaseChannelAllowed($scope.betaChannel);
      $scope.$apply();
      expect(Orgservice.setHybridServiceReleaseChannelEntitlement.calls.count()).toEqual(1);
      expect(channelSentToBackend).toEqual('beta');
      expect(allowSentToBackend).toBeFalsy();
      expect($scope.betaChannel.oldAllow).toBeFalsy();
    });

    it('should set allow false for the alpha release channel when entitled and toggled', function () {
      initController(['squared-fusion-mgmt', 'squared-fusion-mgmt-channel-alpha']);
      var channelSentToBackend = null;
      var allowSentToBackend = null;
      Orgservice.setHybridServiceReleaseChannelEntitlement.and.callFake(function (orgId, channel, allow) {
        channelSentToBackend = channel;
        allowSentToBackend = allow;
        return $q.resolve({});
      });
      $scope.alphaChannel.newAllow = false;
      $scope.toggleReleaseChannelAllowed($scope.alphaChannel);
      $scope.$apply();
      expect(Orgservice.setHybridServiceReleaseChannelEntitlement.calls.count()).toEqual(1);
      expect(channelSentToBackend).toEqual('alpha');
      expect(allowSentToBackend).toBeFalsy();
      expect($scope.alphaChannel.oldAllow).toBeFalsy();
    });

    it('should set allow false for the latest release channel when entitled and toggled', function () {
      initController(['squared-fusion-mgmt', 'squared-fusion-mgmt-channel-latest']);
      var channelSentToBackend = null;
      var allowSentToBackend = null;
      Orgservice.setHybridServiceReleaseChannelEntitlement.and.callFake(function (orgId, channel, allow) {
        channelSentToBackend = channel;
        allowSentToBackend = allow;
        return $q.resolve({});
      });
      $scope.latestChannel.newAllow = false;
      $scope.toggleReleaseChannelAllowed($scope.latestChannel);
      $scope.$apply();
      expect(Orgservice.setHybridServiceReleaseChannelEntitlement.calls.count()).toEqual(1);
      expect(channelSentToBackend).toEqual('latest');
      expect(allowSentToBackend).toBeFalsy();
      expect($scope.latestChannel.oldAllow).toBeFalsy();
    });

    it('should reset toggle to original value and notify an error when updating channel entitlement fails', function () {
      initController(['squared-fusion-mgmt']);
      Orgservice.setHybridServiceReleaseChannelEntitlement.and.callFake(function () {
        return $q.reject();
      });
      $scope.latestChannel.newAllow = true;
      $scope.toggleReleaseChannelAllowed($scope.latestChannel);
      $scope.$apply();
      expect(Orgservice.setHybridServiceReleaseChannelEntitlement.calls.count()).toEqual(1);
      expect($scope.latestChannel.newAllow).toBeFalsy();
      expect($scope.latestChannel.oldAllow).toBeFalsy();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });
});
