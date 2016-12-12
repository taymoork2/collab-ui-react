'use strict';

describe('Controller: DeviceOverviewCtrl', function () {
  var $scope, $controller, $state, controller, $httpBackend;
  var $q, CsdmConfigService, CsdmDeviceService, Authinfo, Notification;
  var RemoteSupportModal, HuronConfig, FeatureToggleService, Userservice;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$q_, $rootScope, _$controller_, _$httpBackend_, _CsdmConfigService_, _CsdmDeviceService_,
                        _Authinfo_, _Notification_, _RemoteSupportModal_, _HuronConfig_, _FeatureToggleService_,
                        _Userservice_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $state = {};
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;

    CsdmConfigService = _CsdmConfigService_;
    CsdmDeviceService = _CsdmDeviceService_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
    RemoteSupportModal = _RemoteSupportModal_;
    HuronConfig = _HuronConfig_;
  }

  function initSpies() {
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/upgradeChannels').respond(200);
    $httpBackend.whenGET('http://thedeviceurl').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/sipendpoints/3/addonmodules').respond(200);
    $httpBackend.whenGET('modules/huron/pstnSetup/states.json').respond([{
      name: "Texas",
      abbreviation: "TX"
    }]);
  }

  var $stateParams = {
    currentDevice: {
      url: 'http://thedeviceurl',
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
      $stateParams: $stateParams,
      $state: $state,
      Userservice: Userservice,
      FeatureToggleService: FeatureToggleService
    });
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

    it('should post new tags to CsdmDeviceService for cloudberry devices', function () {
      controller.newTag = 'new tag';
      controller.currentDevice = {
        isCloudberryDevice: true,
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
        isCloudberryDevice: true,
        tags: ['old tag'],
        url: 'testUrl'
      };
      spyOn(CsdmDeviceService, 'updateTags').and.returnValue($q.resolve());
      controller.addTag();
      $scope.$apply();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalled();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalledWith('testUrl', ['old tag', 'new tag']);
    });

    it('should remove deleted tag from existing tags', function () {
      controller.currentDevice = {
        isCloudberryDevice: true,
        tags: ['old tag', 'old tag2'],
        url: 'testUrl'
      };
      spyOn(CsdmDeviceService, 'updateTags').and.returnValue($q.resolve());
      controller.removeTag('old tag');
      $scope.$apply();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalled();
      expect(CsdmDeviceService.updateTags).toHaveBeenCalledWith('testUrl', ['old tag2']);
    });

    it('should leave out leading and trailing whitespace when posting new tags to CsdmDeviceService', function () {
      controller.newTag = ' new tag ';
      controller.currentDevice = {
        isCloudberryDevice: true,
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

describe('Huron Device', function () {
  var $scope, $controller, controller, $httpBackend;
  var $q, CsdmConfigService;
  var $stateParams, ServiceSetup, timeZone, newTimeZone, countries, newCountry;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);


  function dependencies(_$q_, $rootScope, _$controller_, _$httpBackend_, _CsdmConfigService_, _ServiceSetup_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    CsdmConfigService = _CsdmConfigService_;
    ServiceSetup = _ServiceSetup_;
    $stateParams = {
      currentDevice: {
        url: 'http://thedeviceurl',
        isHuronDevice: true
      },
      huronDeviceService: CsdmHuronDeviceService($q)
    };
  }

  newTimeZone = {
    "id": "America/Anchorage",
    "label": "America/Anchorage"
  };

  newCountry = {
    "label": "Canada",
    "value": "CA"
  };

  function CsdmHuronDeviceService(q) {

    function setTimezoneForDevice() {
      return q.resolve(true);
    }

    function setCountryForDevice() {
      return q.resolve(true);
    }

    function getDeviceInfo() {
      return q.resolve({ timeZone: 'America/Los_Angeles', country: 'US' });
    }

    function getLinesForDevice() {
      return q.resolve([]);
    }

    return {
      setTimezoneForDevice: setTimezoneForDevice,
      setCountryForDevice: setCountryForDevice,
      getDeviceInfo: getDeviceInfo,
      getLinesForDevice: getLinesForDevice
    };
  }

  function initSpies() {
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/upgradeChannels').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
    $httpBackend.whenGET('http://thedeviceurl').respond(200);
    $httpBackend.whenGET('modules/huron/pstnSetup/states.json').respond([{
      name: "Texas",
      abbreviation: "TX"
    }]);
    countries = getJSONFixture('huron/json/settings/countries.json');

    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.when(timeZone));
    spyOn(ServiceSetup, 'getSiteCountries').and.returnValue($q.when(countries));
    spyOn($stateParams.huronDeviceService, 'setTimezoneForDevice').and.returnValue($q.when(true));
    spyOn($stateParams.huronDeviceService, 'setCountryForDevice').and.returnValue($q.when(true));


  }

  function initController() {
    controller = $controller('DeviceOverviewCtrl', {
      $scope: $scope,
      channels: {},
      $stateParams: $stateParams
    });

    $scope.$apply();
  }

  describe('timezone support', function () {
    beforeEach(initController);


    it('should init controller', function () {
      expect(controller).toBeDefined();
    });

    it('should update timezone id', function () {
      controller.selectedTimeZone = newTimeZone;
      controller.saveTimeZoneAndWait();
      $scope.$apply();

      expect($stateParams.huronDeviceService.setTimezoneForDevice).toHaveBeenCalledWith(jasmine.any(Object), newTimeZone.id);
    });
  });

  describe('country support', function () {
    beforeEach(initController);

    it('should init controller', function () {
      expect(controller).toBeDefined();
    });

    it('should update country value', function () {
      controller.selectedCountry = newCountry;
      controller.saveCountryAndWait();
      $scope.$apply();

      expect($stateParams.huronDeviceService.setCountryForDevice).toHaveBeenCalledWith(jasmine.any(Object), newCountry.value);
    });
  });
});
