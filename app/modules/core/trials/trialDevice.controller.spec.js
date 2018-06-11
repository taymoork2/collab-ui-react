'use strict';

var trialModule = require('./trial.module');

describe('Controller: TrialDeviceController', function () {
  beforeEach(function () {
    // TODO: fix the module dependencies
    this.initModules(
      trialModule,
      'Core',
      'Huron',
      'Sunlight'
    );
    this.injectDependencies(
      '$controller',
      '$httpBackend',
      '$q',
      '$scope',
      '$stateParams',
      'Analytics',
      'FeatureToggleService',
      'Notification',
      'Orgservice',
      'TrialCallService',
      'TrialDeviceService',
      'TrialRoomSystemService'
    );

    this.trialData = getJSONFixture('core/json/trials/trialData.json');

    this.stateParams = {
      details: {
        details: {
          devices: [
            {
              model: 'CISCO_8865',
              quantity: 1,
            }, {
              model: 'CISCO_7832',
              quantity: 1,
            }],
        },
      },
    };

    spyOn(this.Orgservice, 'getOrg');
    this.limitData = this.TrialDeviceService.getDeviceLimit();
    spyOn(this.Analytics, 'trackTrialSteps');
    spyOn(this.FeatureToggleService, 'atlasF281TrialRoomKitGetStatus').and.returnValue(this.$q.resolve(false));

    this.initController = function (params) {
      this.$scope.trialData = this.trialData.enabled;
      this.controller = this.$controller('TrialDeviceController', { $scope: this.$scope, $stateParams: params });
      this.$scope.$apply();
    };

    this.initController();
  });

  describe('controller data', function () {
    it('should have nothing enabled', function () {
      var roomSystems = _.find(this.controller.details.roomSystems, {
        enabled: true,
      });
      var phones = _.filter(this.controller.details.phones, {
        enabled: true,
      });
      var shippingInfo = _.find(this.controller.details.shippingInfo, {
        enabled: true,
      });

      expect(roomSystems).toBeUndefined();
      expect(phones.length).toBe(0);
      expect(shippingInfo).toBeUndefined();
    });

    // the back end expects this as an enum and enums cant start with numbers
    it('should have all devices starting with \'CISCO_\'', function () {
      for (var i = 0; i < this.controller.details.roomSystems.length; i++) {
        var rsModel = this.controller.details.roomSystems[i].model;
        expect(_.startsWith(rsModel, 'CISCO_')).toBeTruthy();
      }
      for (var j = 0; j < this.controller.details.phones.length; j++) {
        var phoneModel = this.controller.details.phones[j].model;
        expect(_.startsWith(phoneModel, 'CISCO_')).toBeTruthy();
      }
    });

    it('should always have a recipient type === PARTNER || CUSTOMER', function () {
      var type = this.controller.shippingInfo.type;
      expect(this.controller.shippingInfo.type).toBeDefined();

      expect(type === 'CUSTOMER' || type === 'PARTNER').toBeTruthy();
    });

    it('should calculate quantity of devices', function () {
      var devices1 = [{
        model: 'CISCO_SX10',
        enabled: true,
        quantity: 2,
        readonly: false,
        valid: true,
      }, {
        model: 'CISCO_DX80',
        enabled: true,
        quantity: 1,
        readonly: false,
        valid: true,
      }, {
        model: 'CISCO_8865',
        enabled: false,
        quantity: 2,
        readonly: false,
        valid: true,

      }];
      var devices2 = [{
        model: 'CISCO_SX10',
        enabled: true,
        quantity: 4,
        readonly: false,
        valid: true,

      }];
      var devices3 = [{
        model: 'CISCO_SX10',
        enabled: false,
        quantity: 2,
        readonly: false,
        valid: true,

      }, {
        model: 'CISCO_MX300',
        enabled: false,
        quantity: 2,
        readonly: false,
        valid: true,
      }, {
        model: 'CISCO_8865',
        enabled: false,
        quantity: 2,
        readonly: false,
        valid: true,

      }];

      expect(this.controller.calcQuantity(devices1)).toEqual(3);
      expect(this.controller.calcQuantity(devices1, devices2)).toEqual(7);
      expect(this.controller.calcQuantity(devices3)).toEqual(0);
    });

    it('should correctly calculate quantity by device type', function () {
      // default data has quality 3 of CISCO_8865 and 2 of CISCO_SX10
      spyOn(this.TrialCallService, 'getData').and.returnValue(this.trialData.enabled.trials.callTrial);
      spyOn(this.TrialRoomSystemService, 'getData').and.returnValue(this.trialData.enabled.trials.roomSystemTrial);

      this.controller.phone7832.quantity = 2;
      this.controller.phone7832.enabled = true;
      this.controller.phone8841.quantity = 1;
      this.controller.phone8841.enabled = true;
      this.controller.phone8845.quantity = 1;
      this.controller.phone8845.enabled = true;
      this.controller.sx10.quantity = 1;
      this.controller.sx10.enabled = true;
      this.controller.mx300.quantity = 1;
      this.controller.mx300.enabled = true;
      var roomSystemsQuantity = this.controller.getTypeQuantity('roomSystems');
      var phonesQuantity = this.controller.getTypeQuantity('phones');
      expect(roomSystemsQuantity).toBe(2);
      expect(phonesQuantity).toBe(4);
    });

    it('should set quantity to current value', function () {
      var deviceModel = {
        enabled: true,
        quantity: 3,
        readonly: false,

      };

      this.controller.setQuantity(deviceModel);

      expect(deviceModel.quantity).toBe(3);
      expect(deviceModel.enabled).toBe(true);
      expect(deviceModel.readonly).toBe(false);
    });

    it('should set quantity to $paramValue value', function () {
      var deviceModel = {
        enabled: false,
        quantity: 0,
        readonly: false,

      };
      spyOn(this.controller, 'getQuantity').and.returnValue(2);

      this.controller.setQuantity(deviceModel);

      expect(deviceModel.quantity).toBe(2);
      expect(deviceModel.enabled).toBe(true);
      expect(deviceModel.readonly).toBe(true);
    });

    it('should set device trial limits', function () {
      spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.trialData.enabled.trials.deviceTrial);
      spyOn(this.TrialDeviceService, 'getLimitsPromise').and.returnValue(this.$q.resolve({
        activeDeviceTrials: 17,
        maxDeviceTrials: 20,
      }));
      spyOn(this.TrialDeviceService, 'getDeviceLimit').and.returnValue(this.limitData);
      spyOn(this.TrialDeviceService, 'listTypes').and.returnValue({});
      this.initController();

      expect(this.controller.activeTrials).toEqual(17);
      expect(this.controller.maxTrials).toEqual(20);
      expect(this.controller.limitReached).toBe(false);
    });

    it('should set limitReached', function () {
      spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.trialData.enabled.trials.deviceTrial);
      spyOn(this.TrialDeviceService, 'getLimitsPromise').and.returnValue(this.$q.resolve({
        activeDeviceTrials: 20,
        maxDeviceTrials: 20,
      }));
      spyOn(this.TrialDeviceService, 'getDeviceLimit').and.returnValue(this.limitData);
      spyOn(this.TrialDeviceService, 'listTypes').and.returnValue({});
      this.initController();

      expect(this.controller.activeTrials).toEqual(20);
      expect(this.controller.maxTrials).toEqual(20);
      expect(this.controller.limitReached).toBe(true);
    });

    it('should set limitsError', function () {
      spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.trialData.enabled.trials.deviceTrial);
      spyOn(this.TrialDeviceService, 'getLimitsPromise').and.returnValue(this.$q.reject());
      spyOn(this.TrialDeviceService, 'getDeviceLimit').and.returnValue(this.limitData);
      spyOn(this.TrialDeviceService, 'listTypes').and.returnValue({});
      this.initController();

      expect(this.controller.limitsError).toBe(true);
      expect(this.controller.limitReached).toBe(true);
    });

    it('should notify limit approaching', function () {
      spyOn(this.Notification, 'warning');
      spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.trialData.enabled.trials.deviceTrial);
      spyOn(this.TrialDeviceService, 'getLimitsPromise').and.returnValue(this.$q.resolve({
        activeDeviceTrials: 17,
        maxDeviceTrials: 20,
      }));
      spyOn(this.TrialDeviceService, 'getDeviceLimit').and.returnValue(this.limitData);
      spyOn(this.TrialDeviceService, 'listTypes').and.returnValue({});
      this.initController();

      expect(this.Notification.warning).toHaveBeenCalled();
    });
  });

  describe('input quantity default setting', function () {
    it('should change the quantity to 0 when disabled', function () {
      var device = {
        model: 'CISCO_SX10',
        enabled: false,
        quantity: 3,
        readonly: false,
        valid: true,
        minQuantity: 1,
        maxQuantity: 3,
      };
      this.controller.setQuantityInputDefault(device);
      expect(device.quantity).toBe(0);
    });

    it('should change the quantity to default when enabled and has quantity 0', function () {
      var device = {
        model: 'CISCO_SX10',
        enabled: true,
        quantity: 0,
        readonly: false,
        valid: true,
        minQuantity: 1,
        maxQuantity: 3,
      };
      this.controller.setQuantityInputDefault(device);
      expect(device.quantity).toBe(1);
    });

    it('should not change the quantity when enabled and has quantity other than 0', function () {
      var device = {
        model: 'CISCO_SX10',
        enabled: true,
        quantity: 3,
        readonly: false,
        valid: true,
        minQuantity: 1,
        maxQuantity: 3,
      };
      this.controller.setQuantityInputDefault(device, 1);
      expect(device.quantity).toBe(3);
    });
  });

  describe('total device quantity calculation', function () {
    it('should calculate total quantity 0 when nothing is enabled', function () {
      var total = this.controller.getTotalQuantity();
      expect(total).toBe(0);
    });

    it('should calculate total quantity correcty when not 0', function () {
      // default data has quality 3 of CISCO_8865 and 2 of CISCO_SX10
      spyOn(this.TrialCallService, 'getData').and.returnValue(this.trialData.enabled.trials.callTrial);
      spyOn(this.TrialCallService, 'canAddCallDevice').and.returnValue(true);

      spyOn(this.TrialRoomSystemService, 'getData').and.returnValue(this.trialData.enabled.trials.roomSystemTrial);
      spyOn(this.TrialRoomSystemService, 'canAddRoomSystemDevice').and.returnValue(true);

      this.initController();

      var total = this.controller.getTotalQuantity();
      expect(total).toBe(5);
    });
    it('should calculate total quantity correcty when not 0 but trail is not enabled', function () {
      // default data has quality 3 of CISCO_8865 and 2 of CISCO_SX10
      spyOn(this.TrialCallService, 'getData').and.returnValue(this.trialData.enabled.trials.callTrial);
      spyOn(this.TrialCallService, 'canAddCallDevice').and.returnValue(true);

      spyOn(this.TrialRoomSystemService, 'getData').and.returnValue(this.trialData.enabled.trials.roomSystemTrial);
      spyOn(this.TrialRoomSystemService, 'canAddRoomSystemDevice').and.returnValue(false);

      this.initController();

      var total = this.controller.getTotalQuantity();
      expect(total).toBe(3);
    });
  });

  describe('checkbox validation', function () {
    it('should validate when model valid is true', function () {
      var valid = this.controller.validateChecks(null, null, {
        model: {
          valid: true,
        },
      });
      expect(valid).toBe(true);
    });

    it('should validate when one or more checkboxes are enabled true', function () {
      var valid = this.controller.validateChecks(null, null, {
        model: {
          enabled: true,
          valid: true,
        },
      });
      expect(valid).toBe(true);
    });

    it('should not validate when all checkboxes are enabled false', function () {
      var valid = this.controller.validateChecks(null, null, {
        model: {
          enabled: false,
          valid: false,
        },
      });
      expect(valid).toBe(false);
    });
  });

  describe('areAdditionalDevicesAllowed  function ', function () {
    it('should return false when limit is reached', function () {
      spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.trialData.enabled.trials.deviceTrial);
      spyOn(this.TrialDeviceService, 'getLimitsPromise').and.returnValue(this.$q.resolve({
        activeDeviceTrials: 20,
        maxDeviceTrials: 20,
      }));
      spyOn(this.TrialDeviceService, 'getDeviceLimit').and.returnValue(this.limitData);
      spyOn(this.TrialDeviceService, 'listTypes').and.returnValue({});

      this.initController();
      this.controller.canAddMoreDevices = false;
      this.$scope.$apply();

      var result = this.controller.areAdditionalDevicesAllowed();
      expect(result).toBe(false);
    });

    it('should return true when the limit is not reached', function () {
      spyOn(this.TrialDeviceService, 'getData').and.returnValue(this.trialData.enabled.trials.deviceTrial);
      spyOn(this.TrialDeviceService, 'getLimitsPromise').and.returnValue(this.$q.resolve({
        activeDeviceTrials: 15,
        maxDeviceTrials: 20,
      }));
      spyOn(this.TrialDeviceService, 'getDeviceLimit').and.returnValue(this.limitData);
      spyOn(this.TrialDeviceService, 'listTypes').and.returnValue({});
      this.initController();
      this.controller.canAddMoreDevices = false;
      this.$scope.$apply();

      var result = this.controller.areAdditionalDevicesAllowed();
      expect(result).toBe(true);
    });
  });

  describe('areTemplateOptionsDisabled function', function () {
    it('should set to true if device.enabled is false', function () {
      var device = {
        model: 'CISCO_SX10',
        enabled: false,
        quantity: 3,
        readonly: false,
        valid: true,
      };

      expect(this.controller.areTemplateOptionsDisabled(device)).toBeTruthy();
    });

    it('should set to false if device.enabled is true', function () {
      var device = {
        model: 'CISCO_DX80',
        enabled: true,
        quantity: 3,
        readonly: false,
        valid: true,
      };
      expect(this.controller.areTemplateOptionsDisabled(device)).toBeFalsy();
    });

    it('should set to false if device.readonly is true', function () {
      var device = {
        model: 'CISCO_MX300',
        enabled: false,
        quantity: 3,
        readonly: true,
        valid: true,
      };
      expect(this.controller.areTemplateOptionsDisabled(device)).toBeTruthy();
    });
  });

  describe('Shipping to additional countries ', function () {
    it('should show a largest list of countries when only CISCO_SX10 is selected', function () {
      this.controller.sx10.enabled = true;
      this.controller.sx10.quantity = 1;
      var countryList = this.controller.getCountriesForSelectedDevices();
      expect(countryList.length).toBeGreaterThan(2);
    });
    it('should have a list of countries to be US and Canada only when CISCO_SX10 and Desk Phone is selected', function () {
      this.initController();
      this.controller.sx10.enabled = true;
      this.controller.sx10.quantity = 1;
      this.controller.phone8865.enabled = true;
      this.controller.phone8865.quantity = 1;

      var countryList = this.controller.getCountriesForSelectedDevices();
      expect(countryList.length).toBe(2);
      expect(countryList).toContain({ country: 'United States' });
      expect(countryList).toContain({ country: 'Canada' });
    });
    it('should have a list of countries to still be US only when MX300 phone is selected', function () {
      this.controller.sx10.enabled = true;
      this.controller.sx10.quantity = 1;
      this.controller.mx300.enabled = true;
      this.controller.mx300.quantity = 1;
      this.controller.phone8865.enabled = true;
      this.controller.phone8865.quantity = 1;
      var countryList = this.controller.getCountriesForSelectedDevices();
      expect(countryList.length).toBe(1);
      expect(countryList).toContain({ country: 'United States' });
    });
  });

  describe('For existing trials', function () {
    it('should correctly populate existing device quantities and include them in total quantity calculation', function () {
      this.initController();
      var total = this.controller.getTotalQuantity();
      expect(total).toBe(0);
      this.initController(this.stateParams);
      total = this.controller.getTotalQuantity();
      expect(total).toBe(2);
      total = this.controller.getTotalQuantityBeingAdded();
      expect(total).toBe(0);
    });
  });

  describe('New RoomKit device', function () {
    describe('When "atlasF281TrialRoomKitGetStatus" feature toggle is true', function () {
      beforeEach(function () {
        this.FeatureToggleService.atlasF281TrialRoomKitGetStatus.and.returnValue(this.$q.resolve(true));
      });

      it('should show roomkit but not sx10 or mx300 for new trial', function () {
        this.initController();
        expect(this.controller.showRoomTrialDevice('sx10')).toBeFalsy();
        expect(this.controller.showRoomTrialDevice('mx300')).toBeFalsy();
        expect(this.controller.showRoomTrialDevice('dx80')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('roomKit')).toBeTruthy();
      });

      it('should show roomkit but not sx10 or mx300 in edit trial if they don\'t have them already in trial', function () {
        this.stateParams.details.details = {
          devices: [
            {
              model: 'CISCO_8865',
              quantity: 1,
            }, {
              model: 'CISCO_DX80',
              quantity: 1,
            },
          ],
        };

        this.initController(this.stateParams);
        expect(this.controller.showRoomTrialDevice('sx10')).toBeFalsy();
        expect(this.controller.showRoomTrialDevice('mx300')).toBeFalsy();
        expect(this.controller.showRoomTrialDevice('dx80')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('roomKit')).toBeTruthy();
      });

      it('should show roomkit and whatever spark room devices they had in the trial if they had one for edit trial ', function () {
        this.stateParams.details.details = {
          devices: [
            {
              model: 'CISCO_8865',
              quantity: 1,
            }, {
              model: 'CISCO_MX300',
              quantity: 1,
            },
          ],
        };
        this.initController(this.stateParams);
        expect(this.controller.showRoomTrialDevice('sx10')).toBeFalsy();
        expect(this.controller.showRoomTrialDevice('mx300')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('dx80')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('roomKit')).toBeTruthy();
      });
    });

    describe('When "atlasF281TrialRoomKitGetStatus" feature toggle is falsy', function () {
      beforeEach(function () {
        this.FeatureToggleService.atlasF281TrialRoomKitGetStatus.and.returnValue(this.$q.resolve(false));
      });

      it('should show sx10 and mx300 but not roomKit for room devices for a new trial', function () {
        expect(this.controller.showRoomTrialDevice('sx10')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('mx300')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('dx80')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('roomKit')).toBeFalsy();
      });

      it('should show sx10 and mx300 but not roomKit for room devices in existing trial', function () {
        expect(this.controller.showRoomTrialDevice('sx10')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('dx80')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('mx300')).toBeTruthy();
        expect(this.controller.showRoomTrialDevice('roomKit')).toBeFalsy();
      });
    });
  });
});
