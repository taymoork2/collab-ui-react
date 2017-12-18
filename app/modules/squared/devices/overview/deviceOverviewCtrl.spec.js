'use strict';

describe('Controller: DeviceOverviewCtrl', function () {
  var $scope, $controller, $state, controller, $httpBackend;
  var $q, UrlConfig, CsdmDeviceService, Authinfo, Notification, CsdmDataModelService;
  var RemoteSupportModal, HuronConfig, FeatureToggleService, Userservice, TerminusService;
  var PstnAreaService, CsdmHuronDeviceService, ServiceSetup, DeviceOverviewService;

  var location = {
    zipName: 'Zip Code',
    typeName: 'State',
    areas: [{
      name: 'Texas',
      abbreviation: 'TX',
    }],
  };

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$q_, $rootScope, _$controller_, _$httpBackend_, _UrlConfig_, _CsdmDeviceService_, _Authinfo_,
    _Notification_, _RemoteSupportModal_, _HuronConfig_, _FeatureToggleService_, _Userservice_, _CsdmDataModelService_,
    _PstnAreaService_, _ServiceSetup_, _DeviceOverviewService_, _TerminusService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $state = {};
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;

    UrlConfig = _UrlConfig_;
    CsdmDeviceService = _CsdmDeviceService_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
    CsdmDataModelService = _CsdmDataModelService_;
    RemoteSupportModal = _RemoteSupportModal_;
    HuronConfig = _HuronConfig_;
    PstnAreaService = _PstnAreaService_;
    ServiceSetup = _ServiceSetup_;
    DeviceOverviewService = _DeviceOverviewService_;
    TerminusService = _TerminusService_;
  }

  function initSpies() {
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(200);
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/upgradeChannels').respond(200);
    $httpBackend.whenGET('http://thedeviceurl').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/sipendpoints/3/addonmodules').respond(200);
    $httpBackend.whenGET('https://cmi.huron-int.com/api/v1/voice/customers/sites').respond([]);
    spyOn(CsdmDataModelService, 'reloadItem').and.returnValue($q.reject());
    spyOn(CsdmHuronDeviceService, 'getLinesForDevice').and.returnValue($q.resolve([]));
    spyOn(CsdmHuronDeviceService, 'getDeviceInfo').and.returnValue($q.resolve({}));
    spyOn(PstnAreaService, 'getCountryAreas').and.returnValue($q.resolve(location));
    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.resolve());
    spyOn(ServiceSetup, 'getTranslatedTimeZones').and.returnValue($q.resolve());
    spyOn(DeviceOverviewService, 'getCountryOptions').and.returnValue($q.resolve());

    spyOn(TerminusService, 'customerNumberE911V2').and.callFake(function () {
      return {
        get: function () {
          return {
            $promise: $q.reject(),
          };
        },
      };
    });
  }

  CsdmHuronDeviceService = {
    getLinesForDevice: {},
    getDeviceInfo: {},
  };

  function initControllerWithSettings(channels, stateParams) {
    controller = $controller('DeviceOverviewCtrl', {
      $element: {
        find: jasmine.createSpy('find').and.returnValue({
          focus: _.noop,
        }),
      },
      $scope: $scope,
      channels: channels,
      $stateParams: stateParams,
      $state: $state,
      Userservice: Userservice,
      FeatureToggleService: FeatureToggleService,
    });
    $scope.$apply();
  }

  function initController() {
    initControllerWithSettings([], {
      currentDevice: {
        url: 'http://thedeviceurl',
        isHuronDevice: false,
        product: 'Cisco 8865',
        cisUuid: 2,
        huronId: 3,
        kem: [],
      },
      huronDeviceService: CsdmHuronDeviceService,
    });
  }

  it('should init controller', function () {
    initController();
    expect(controller).toBeDefined();
  });

  describe('upgrade channel', function () {
    var stateParams;

    describe('with device online', function () {
      beforeEach(function () {
        stateParams = {
          currentDevice: {
            isOnline: true,
          },
          huronDeviceService: CsdmHuronDeviceService,
        };
      });

      it('should show current channel if there are channels to choose for a Cloudberry device', function () {
        stateParams.currentDevice.isHuronDevice = false;
        stateParams.currentDevice.productFamily = 'Cloudberry';
        initControllerWithSettings(['very new stuff', 'a bit more conservative stable stuff'], stateParams);
        expect(controller.canChangeUpgradeChannel).toBeFalsy();
        expect(controller.shouldShowUpgradeChannel).toBe(true);
      });

      it('should be able to change channels if there are channels to choose for a Spark Board device', function () {
        stateParams.currentDevice.isHuronDevice = false;
        stateParams.currentDevice.productFamily = 'Darling';
        initControllerWithSettings(['very new stuff', 'a bit more conservative stable stuff'], stateParams);
        expect(controller.canChangeUpgradeChannel).toBe(true);
        expect(controller.shouldShowUpgradeChannel).toBeFalsy();
      });

      it('should not show anything if there are no channels to choose', function () {
        stateParams.currentDevice.isHuronDevice = false;
        initControllerWithSettings([], stateParams);
        expect(controller.canChangeUpgradeChannel).toBeFalsy();
        expect(controller.shouldShowUpgradeChannel).toBeFalsy();
      });

      it('should not show anything for Huron devices', function () {
        stateParams.currentDevice.isHuronDevice = true;
        initControllerWithSettings(['very new stuff', 'a bit more conservative stable stuff'], stateParams);
        expect(controller.canChangeUpgradeChannel).toBeFalsy();
        expect(controller.shouldShowUpgradeChannel).toBeFalsy();
      });
    });

    describe('with device offline', function () {
      beforeEach(function () {
        stateParams = {
          currentDevice: {
            isOnline: false,
          },
          huronDeviceService: CsdmHuronDeviceService,
        };
      });

      it('should show current channel if there are channels to choose for a Cloudberry device', function () {
        stateParams.currentDevice.isHuronDevice = false;
        stateParams.currentDevice.productFamily = 'Cloudberry';
        initControllerWithSettings(['very new stuff', 'a bit more conservative stable stuff'], stateParams);
        expect(controller.canChangeUpgradeChannel).toBeFalsy();
        expect(controller.shouldShowUpgradeChannel).toBe(true);
      });

      it('should show current channel if there are channels to choose for a Spark Board device', function () {
        stateParams.currentDevice.isHuronDevice = false;
        stateParams.currentDevice.productFamily = 'Darling';
        initControllerWithSettings(['very new stuff', 'a bit more conservative stable stuff'], stateParams);
        expect(controller.canChangeUpgradeChannel).toBeFalsy();
        expect(controller.shouldShowUpgradeChannel).toBe(true);
      });

      it('should not show anything if there are no channels to choose', function () {
        stateParams.currentDevice.isHuronDevice = false;
        initControllerWithSettings([], stateParams);
        expect(controller.canChangeUpgradeChannel).toBeFalsy();
        expect(controller.shouldShowUpgradeChannel).toBeFalsy();
      });

      it('should not show anything for Huron devices', function () {
        stateParams.currentDevice.isHuronDevice = true;
        initControllerWithSettings(['very new stuff', 'a bit more conservative stable stuff'], stateParams);
        expect(controller.canChangeUpgradeChannel).toBeFalsy();
        expect(controller.shouldShowUpgradeChannel).toBeFalsy();
      });
    });
  });

  describe('remote support', function () {
    beforeEach(function () {
      initController();
    });

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
        hasRemoteSupport: true,
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
        hasRemoteSupport: true,
      };
      expect(controller.showRemoteSupportButton()).toBe(true);
    });
  });

  describe('Tags', function () {
    beforeEach(function () {
      initController();
    });

    it('should ignore only whitespace tags', function () {
      controller.newTag = ' ';
      controller.addTag();
      expect(controller.isAddingTag).toBeFalsy();
      expect(controller.newTag).toBeUndefined();
    });

    it('should ignore already present tags', function () {
      controller.newTag = 'existing tag';
      controller.currentDevice = {
        tags: ['existing tag'],
      };
      controller.addTag();
      expect(controller.isAddingTag).toBeFalsy();
      expect(controller.newTag).toBeUndefined();
    });

    it('should ignore leading and trailing whitespace when checking for existing tags', function () {
      controller.newTag = ' existing tag ';
      controller.currentDevice = {
        tags: ['existing tag'],
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
        url: 'testUrl',
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
        url: 'testUrl',
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
        url: 'testUrl',
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
        url: 'testUrl',
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
        keyCode: 12,
      });
      $scope.$apply();
      expect(controller.addTag).not.toHaveBeenCalled();
    });

    it('should call addTag on Enter', function () {
      spyOn(controller, 'addTag');
      controller.addTagOnEnter({
        keyCode: 13,
      });
      $scope.$apply();
      expect(controller.addTag).toHaveBeenCalled();
    });
  });
});

describe('Huron Device', function () {
  var $scope, $controller, controller, $httpBackend;
  var $q, UrlConfig;
  var $stateParams, ServiceSetup, timeZone, newTimeZone, countries, newCountry, HuronConfig, FeatureToggleService,
    PstnModel, PstnService;
  var usStatesList = getJSONFixture('../../app/modules/huron/pstn/pstnAreaService/states.json');
  var $timeout;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);


  function dependencies(_$q_, $rootScope, _$controller_, _$httpBackend_, _UrlConfig_, _ServiceSetup_, _HuronConfig_,
    _FeatureToggleService_, _$timeout_, _PstnModel_, _PstnService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $timeout = _$timeout_;
    UrlConfig = _UrlConfig_;
    ServiceSetup = _ServiceSetup_;
    HuronConfig = _HuronConfig_;
    FeatureToggleService = _FeatureToggleService_;
    PstnModel = _PstnModel_;
    PstnService = _PstnService_;
    $stateParams = {
      currentDevice: {
        url: 'http://thedeviceurl',
        isHuronDevice: true,
      },
      huronDeviceService: CsdmHuronDeviceService($q),
    };
  }

  newTimeZone = {
    id: 'America/Anchorage',
    label: 'America/Anchorage',
  };

  newCountry = {
    label: 'Canada',
    value: 'CA',
  };

  function CsdmHuronDeviceService(q) {
    function setTimezoneForDevice() {
      return q.resolve(true);
    }

    function setCountryForDevice() {
      return q.resolve(true);
    }

    function setSettingsForAta() {
      return q.resolve(true);
    }

    function getDeviceInfo() {
      return q.resolve({ timeZone: 'America/Los_Angeles', country: 'US' });
    }

    function getLinesForDevice() {
      return q.resolve([]);
    }

    function getAtaInfo() {
      return q.resolve({});
    }

    return {
      setTimezoneForDevice: setTimezoneForDevice,
      setCountryForDevice: setCountryForDevice,
      setSettingsForAta: setSettingsForAta,
      getDeviceInfo: getDeviceInfo,
      getLinesForDevice: getLinesForDevice,
      getAtaInfo: getAtaInfo,
    };
  }

  function initSpies() {
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(200);
    $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/upgradeChannels').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
    $httpBackend.whenGET('http://thedeviceurl').respond(200);
    $httpBackend.whenGET(HuronConfig.getTerminusV2Url() + '/customers/numbers/e911').respond(200);
    $httpBackend.whenGET('modules/huron/pstn/pstnAreaService/states.json').respond(usStatesList);

    countries = getJSONFixture('huron/json/settings/countries.json');

    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.resolve(timeZone));
    spyOn(ServiceSetup, 'getSiteCountries').and.returnValue($q.resolve(countries));
    var sites = [{
      uuid: '777-888-666',
      steeringDigit: '5',
      siteSteeringDigit: '6',
    }];
    var site = {
      uuid: '1234567890',
      steeringDigit: '5',
      siteSteeringDigit: '6',
      country: 'US',
    };
    spyOn(ServiceSetup, 'listSites').and.returnValue($q.resolve(sites));
    spyOn(ServiceSetup, 'getSite').and.returnValue($q.resolve(site));
    spyOn($stateParams.huronDeviceService, 'setTimezoneForDevice').and.returnValue($q.resolve(true));
    spyOn($stateParams.huronDeviceService, 'setCountryForDevice').and.returnValue($q.resolve(true));
    spyOn($stateParams.huronDeviceService, 'setSettingsForAta').and.returnValue($q.resolve(true));
  }

  function initController() {
    controller = $controller('DeviceOverviewCtrl', {
      $element: {
        find: jasmine.createSpy('find').and.returnValue({
          focus: _.noop,
        }),
      },
      $scope: $scope,
      channels: {},
      $stateParams: $stateParams,
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

  describe('T38 support', function () {
    it('should show T38 when feature toggle is present and carrier supports it', function () {
      $stateParams = {
        currentDevice: {
          url: 'http://thedeviceurl',
          isHuronDevice: true,
          isATA: true,
        },
        huronDeviceService: CsdmHuronDeviceService($q),
      };
      spyOn(FeatureToggleService, 'csdmT38GetStatus').and.returnValue($q.resolve(true));
      spyOn(PstnModel, 'getProviderId').and.returnValue('carrier');
      spyOn(PstnService, 'getCarrierCapabilities').and.returnValue($q.resolve([{ capability: 'T38' }]));
      initController();
      $scope.$apply();

      expect(controller.showT38).toBe(true);
    });

    it('should fetch carrier id from PstnService if absent in PstnModel', function () {
      $stateParams = {
        currentDevice: {
          url: 'http://thedeviceurl',
          isHuronDevice: true,
          isATA: true,
        },
        huronDeviceService: CsdmHuronDeviceService($q),
      };
      spyOn(FeatureToggleService, 'csdmT38GetStatus').and.returnValue($q.resolve(true));
      spyOn(PstnService, 'getCustomer').and.returnValue($q.resolve({ pstnCarrierId: 'carrier' }));
      spyOn(PstnService, 'getCarrierCapabilities').and.returnValue($q.resolve([{ capability: 'T38' }]));
      initController();
      $scope.$apply();

      expect(controller.showT38).toBe(true);
    });

    it('should not show T38 when feature toggle is absent', function () {
      $stateParams = {
        currentDevice: {
          url: 'http://thedeviceurl',
          isHuronDevice: true,
          isATA: true,
        },
        huronDeviceService: CsdmHuronDeviceService($q),
      };
      spyOn(FeatureToggleService, 'csdmT38GetStatus').and.returnValue($q.resolve(false));
      initController();
      $scope.$apply();

      expect(controller.showT38).toBeFalsy();
    });

    it('should not show T38 when feature toggle is present but carrier does not support it', function () {
      $stateParams = {
        currentDevice: {
          url: 'http://thedeviceurl',
          isHuronDevice: true,
          isATA: true,
        },
        huronDeviceService: CsdmHuronDeviceService($q),
      };
      spyOn(FeatureToggleService, 'csdmT38GetStatus').and.returnValue($q.resolve(true));
      spyOn(PstnModel, 'getProviderId').and.returnValue('carrier');
      spyOn(PstnService, 'getCarrierCapabilities').and.returnValue($q.resolve([]));
      initController();
      $scope.$apply();

      expect(controller.showT38).toBeFalsy();
    });

    it('should update T38 status', function () {
      initController();
      controller.saveT38Settings();
      $scope.$apply();

      $timeout.flush();
      expect($stateParams.huronDeviceService.setSettingsForAta).toHaveBeenCalledWith(jasmine.any(Object), { t38FaxEnabled: false });
    });
  });

  describe('CPC support', function () {
    beforeEach(initController);


    it('should init controller', function () {
      expect(controller).toBeDefined();
    });

    it('should update CPC setting', function () {
      controller.saveCpcSettings();
      $scope.$apply();

      $timeout.flush();
      expect($stateParams.huronDeviceService.setSettingsForAta).toHaveBeenCalledWith(jasmine.any(Object), { cpcDelay: 2 });
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
