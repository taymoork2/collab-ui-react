'use strict';

describe('Controller: DeviceOverviewCtrl', function () {
  var $scope, $controller, controller, $httpBackend;
  var $q, CsdmConfigService, CsdmDeviceService, CsdmCodeService, Authinfo, Notification, RemoteSupportModal;

  beforeEach(module('Hercules'));
  beforeEach(module('Squared'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$q_, $rootScope, _$controller_, _$httpBackend_, _CsdmConfigService_, _CsdmDeviceService_, _CsdmCodeService_, _Authinfo_, _Notification_, _RemoteSupportModal_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    CsdmConfigService = _CsdmConfigService_;
    HuronConfig = _HuronConfig_;
    CsdmDeviceService = _CsdmDeviceService_;
    CsdmCodeService = _CsdmCodeService_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
    RemoteSupportModal = _RemoteSupportModal_;
  }

  function initSpies() {
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkOnline=true&checkDisplayName=false').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/upgradeChannels').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
  }

  var $stateParams = {
    currentDevice: {
      isHuronDevice: false,
      product: 'Cisco 8865',
      cisUuid: 2,
      huronId: 3,
      kem: []
    }
  };

  function initController() {
    controller = $controller('DeviceOverviewCtrl', {
      $scope: $scope,
      channels: {},
      $stateParams: $stateParams
    });
    controller.form = {
      $setPristine: function () {},
      $setUntouched: function () {}
    };
    spyOn(controller.form, '$setPristine');
    spyOn(controller.form, '$setUntouched');
    $scope.$apply();
  }

  it('should init controller', function () {
    expect(controller).toBeDefined();
  });

  describe('remote support', function () {

    it('should not show remote support modal when readonly', function () {
      spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(true);
      spyOn(Notification, 'notifyReadOnly');
      spyOn(RemoteSupportModal, 'open');
      controller.showRemoteSupportDialog();

      expect(Authinfo.isReadOnlyAdmin).toHaveBeenCalled();
      expect(Notification.notifyReadOnly).toHaveBeenCalledTimes(1);
      expect(RemoteSupportModal.open).not.toHaveBeenCalled();
    });

    it('should not show remote support modal when not supported for device', function () {
      spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
      spyOn(Notification, 'notifyReadOnly');
      spyOn(RemoteSupportModal, 'open');

      controller.currentDevice = {};
      controller.showRemoteSupportDialog();

      expect(Authinfo.isReadOnlyAdmin).toHaveBeenCalled();
      expect(Notification.notifyReadOnly).not.toHaveBeenCalled();
      expect(RemoteSupportModal.open).not.toHaveBeenCalled();
    });

    it('should show remote support modal when supported and not readonly', function () {
      spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
      spyOn(Notification, 'notifyReadOnly');
      spyOn(RemoteSupportModal, 'open');

      controller.currentDevice = {
        hasRemoteSupport: true
      };
      controller.showRemoteSupportDialog();

      expect(Authinfo.isReadOnlyAdmin).toHaveBeenCalled();
      expect(Notification.notifyReadOnly).not.toHaveBeenCalled();
      expect(RemoteSupportModal.open).toHaveBeenCalled();
    });

    it('should not show remote support button when not supported', function () {
      controller.currentDevice = {};

      expect(controller.showRemoteSupportButton()).toBe(false);
    });

    it('should show remote support button when supported', function () {
      controller.currentDevice = {
        hasRemoteSupport: true
      };
      expect(controller.showRemoteSupportButton()).toBe(true);
    });

  });

  describe('Tags', function () {
    it('should ignore only whitespace tags', function () {
      controller.newTag = ' ';
      controller.addTag();
      expect(controller.isAddingTag).toBeFalsy();
      expect(controller.newTag).toBeUndefined();
    });

    it('should ignore already present tags', function () {
      controller.newTag = 'existing tag';
      controller.currentDevice = {
        tags: ['existing tag']
      };
      controller.addTag();
      expect(controller.isAddingTag).toBeFalsy();
      expect(controller.newTag).toBeUndefined();
    });

    it('should ignore leading and trailing whitespace when checking for existing tags', function () {
      controller.newTag = ' existing tag ';
      controller.currentDevice = {
        tags: ['existing tag']
      };
      controller.addTag();
      expect(controller.isAddingTag).toBeFalsy();
      expect(controller.newTag).toBeUndefined();
    });

    it('should post new tags to CsdmCodeDeviceService for activation codes', function () {
      controller.newTag = 'new tag';
      controller.currentDevice = {
        tags: [],
        url: 'testUrl',
        needsActivation: true
      };
      spyOn(CsdmCodeService, 'updateTags').and.returnValue($q.resolve());
      controller.addTag();
      $scope.$apply();
      expect(CsdmCodeService.updateTags).toHaveBeenCalled();
      expect(CsdmCodeService.updateTags).toHaveBeenCalledWith('testUrl', ['new tag']);
    });

    it('should post new tags to CsdmDeviceService for cloudberry devices', function () {
      controller.newTag = 'new tag';
      controller.currentDevice = {
        tags: [],
        url: 'testUrl'
      };
      spyOn(CsdmDeviceService, 'updateTags').and.returnValue($q.resolve());
      controller.addTag();
      $scope.$apply();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalled();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalledWith('testUrl', ['new tag']);
    });

    it('should append new tags to existing tags', function () {
      controller.newTag = 'new tag';
      controller.currentDevice = {
        tags: ['old tag'],
        url: 'testUrl'
      };
      spyOn(CsdmDeviceService, 'updateTags').and.returnValue($q.resolve());
      controller.addTag();
      $scope.$apply();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalled();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalledWith('testUrl', ['old tag', 'new tag']);
    });

    it('should leave out leading and trailing whitespace when posting new tags to CsdmDeviceService', function () {
      controller.newTag = ' new tag ';
      controller.currentDevice = {
        tags: [],
        url: 'testUrl'
      };
      spyOn(CsdmDeviceService, 'updateTags').and.returnValue($q.resolve());
      controller.addTag();
      $scope.$apply();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalled();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalledWith('testUrl', ['new tag']);
    });

    it('should ignore keys other than Enter', function () {
      spyOn(controller, 'addTag');
      controller.addTagOnEnter({
        keyCode: 12
      });
      $scope.$apply();
      expect(controller.addTag).not.toHaveBeenCalled();
    });

    it('should call addTag on Enter', function () {
      spyOn(controller, 'addTag');
      controller.addTagOnEnter({
        keyCode: 13
      });
      $scope.$apply();
      expect(controller.addTag).toHaveBeenCalled();
    });

  });
});
