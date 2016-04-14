/* globals $controller, $q, $rootScope, Notification, TrialDeviceController, TrialCallService, TrialDeviceService, TrialRoomSystemService*/
'use strict';

describe('Controller: TrialDeviceController', function () {
  var controller;
  var trialData = getJSONFixture('core/json/trials/trialData.json');

  beforeEach(module('core.trial'));
  beforeEach(module('Core'));

  beforeEach(function () {
    bard.inject(this, '$controller', '$q', '$rootScope', 'Notification', 'TrialCallService', 'TrialDeviceService', 'TrialRoomSystemService');

    controller = $controller('TrialDeviceController');
    $rootScope.$apply();
  });

  describe('controller data', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    it('should have nothing enabled', function () {
      var roomSystems = _.find(controller.details.roomSystems, {
        enabled: true
      });
      var phones = _.filter(controller.details.phones, {
        enabled: true
      });

      expect(roomSystems).toBeUndefined();
      expect(phones.length).toBe(0);
    });

    // the back end expects this as an enum and enums cant start with numbers
    it('should have all devices starting with \'CISCO_\'', function () {
      for (var i = 0; i < controller.details.roomSystems.length; i++) {
        var rsModel = controller.details.roomSystems[i].model;
        expect(_.startsWith(rsModel, 'CISCO_')).toBeTruthy();
      }
      for (var j = 0; j < controller.details.phones.length; j++) {
        var phoneModel = controller.details.phones[j].model;
        expect(_.startsWith(phoneModel, 'CISCO_')).toBeTruthy();
      }
    });

    it('should always have a recipient type === PARTNER || CUSTOMER', function () {
      var type = controller.shippingInfo.type;
      expect(controller.shippingInfo.type).toBeDefined();

      expect(type === 'CUSTOMER' || type === 'PARTNER').toBeTruthy();
    });

    it('should calculate quantity of devices', function () {
      var devices1 = [{
        model: 'CISCO_SX10',
        enabled: true,
        quantity: 2,
        readonly: false,
        valid: true
      }, {
        model: 'CISCO_8865',
        enabled: false,
        quantity: 2,
        readonly: false,
        valid: true

      }];
      var devices2 = [{
        model: 'CISCO_SX10',
        enabled: true,
        quantity: 5,
        readonly: false,
        valid: true

      }];
      var devices3 = [{
        model: 'CISCO_SX10',
        enabled: false,
        quantity: 2,
        readonly: false,
        valid: true

      }, {
        model: 'CISCO_8865',
        enabled: false,
        quantity: 2,
        readonly: false,
        valid: true

      }];

      expect(controller.calcQuantity(devices1)).toEqual(2);
      expect(controller.calcQuantity(devices1, devices2)).toEqual(7);
      expect(controller.calcQuantity(devices3)).toEqual(0);
    });

    it('should set quantity to current value', function () {
      var deviceModel = {
        enabled: true,
        quantity: 3,
        readonly: false

      };

      controller.setQuantity(deviceModel);

      expect(deviceModel.quantity).toBe(3);
      expect(deviceModel.enabled).toBe(true);
      expect(deviceModel.readonly).toBe(false);
    });

    it('should set quantity to $paramValue value', function () {
      var deviceModel = {
        enabled: false,
        quantity: 0,
        readonly: false

      };
      spyOn(controller, 'getQuantity').and.returnValue(2);

      controller.setQuantity(deviceModel);

      expect(deviceModel.quantity).toBe(2);
      expect(deviceModel.enabled).toBe(true);
      expect(deviceModel.readonly).toBe(true);
    });

    it('should set device trial limits', function () {
      bard.mockService(TrialDeviceService, {
        getData: trialData.enabled.trials.deviceTrial,
        getLimitsPromise: $q.when({
          activeDeviceTrials: 17,
          maxDeviceTrials: 20
        })
      });
      controller = $controller('TrialDeviceController');
      $rootScope.$apply();

      expect(controller.activeTrials).toEqual(17);
      expect(controller.maxTrials).toEqual(20);
      expect(controller.limitReached).toBe(false);
    });

    it('should set limitReached', function () {
      bard.mockService(TrialDeviceService, {
        getData: trialData.enabled.trials.deviceTrial,
        getLimitsPromise: $q.when({
          activeDeviceTrials: 20,
          maxDeviceTrials: 20
        })
      });
      controller = $controller('TrialDeviceController');
      $rootScope.$apply();

      expect(controller.activeTrials).toEqual(20);
      expect(controller.maxTrials).toEqual(20);
      expect(controller.limitReached).toBe(true);
    });

    it('should set limitsError', function () {
      bard.mockService(TrialDeviceService, {
        getData: trialData.enabled.trials.deviceTrial,
        getLimitsPromise: $q.reject()
      });
      controller = $controller('TrialDeviceController');
      $rootScope.$apply();

      expect(controller.limitsError).toBe(true);
      expect(controller.limitReached).toBe(true);
    });

    it('should notify limit approaching', function () {
      spyOn(Notification, 'warning');
      bard.mockService(TrialDeviceService, {
        getData: trialData.enabled.trials.deviceTrial,
        getLimitsPromise: $q.when({
          activeDeviceTrials: 17,
          maxDeviceTrials: 20
        })
      });
      controller = $controller('TrialDeviceController');
      $rootScope.$apply();

      expect(Notification.warning).toHaveBeenCalled();
    });
  });

  describe('input quantity validation', function () {
    it('should validate when device is not enabled', function () {
      var valid = controller.validateInputQuantity(2, 2, {
        model: {
          enabled: false
        }
      });
      expect(valid).toBe(true);
    });

    it('should validate quantity between 1 and 5', function () {
      var valid1 = controller.validateInputQuantity(1, 1, {
        model: {
          enabled: true
        }
      });
      var valid2 = controller.validateInputQuantity(5, 5, {
        model: {
          enabled: true
        }
      });

      expect(valid1).toBe(true);
      expect(valid2).toBe(true);
    });

    it('should not validate quantity below 1 and above 5', function () {
      var valid1 = controller.validateInputQuantity(0, 0, {
        model: {
          enabled: true
        }
      });
      var valid2 = controller.validateInputQuantity(6, 6, {
        model: {
          enabled: true
        }
      });

      expect(valid1).toBe(false);
      expect(valid2).toBe(false);
    });
  });

  describe('total quantity validation', function () {
    var model = {
      model: {
        enabled: true
      }
    };

    it('should validate when quantity is between 2 and 7', function () {
      spyOn(controller, 'calcQuantity').and.returnValues(0, 2, 0, 7);

      var valid1 = controller.validateTotalQuantity(null, null, model);
      var valid2 = controller.validateTotalQuantity(null, null, model);

      expect(valid1).toBe(true);
      expect(valid2).toBe(true);
    });

    it('should not validate when quantity is less than 2 or greater than 7', function () {
      spyOn(controller, 'calcQuantity').and.returnValues(0, 8, 0, 1);

      var valid1 = controller.validateTotalQuantity(null, null, model);
      var valid2 = controller.validateTotalQuantity(null, null, model);

      expect(valid1).toBe(false);
      expect(valid2).toBe(false);
    });

    it('should validate when device is not enabled', function () {
      var valid = controller.validateTotalQuantity(null, null, {
        model: {
          enabled: false
        }
      });
      expect(valid).toBe(true);
    });
  });

  describe('room systems quantity validation', function () {
    var model = {
      model: {
        enabled: true
      }
    };

    it('should validate when quantity is 5 or less', function () {
      spyOn(controller, 'calcQuantity').and.returnValue(5);

      var valid = controller.validateRoomSystemsQuantity(null, null, model);

      expect(valid).toBe(true);
    });

    it('should not validate when quantity is greater than 5', function () {
      spyOn(controller, 'calcQuantity').and.returnValue(6);

      var valid = controller.validateRoomSystemsQuantity(null, null, model);

      expect(valid).toBe(false);
    });

    it('should validate when device is not enabled', function () {
      var valid = controller.validateRoomSystemsQuantity(null, null, {
        model: {
          enabled: false
        }
      });
      expect(valid).toBe(true);
    });
  });

  describe('phones quantity validation', function () {
    var model = {
      model: {
        enabled: true
      }
    };

    it('should validate when quantity is 5 or less', function () {
      spyOn(controller, 'calcQuantity').and.returnValue(5);

      var valid = controller.validatePhonesQuantity(null, null, model);

      expect(valid).toBe(true);
    });

    it('should not validate when quantity is greater than 5', function () {
      spyOn(controller, 'calcQuantity').and.returnValue(6);

      var valid = controller.validatePhonesQuantity(null, null, model);

      expect(valid).toBe(false);
    });

    it('should validate when device is not enabled', function () {
      var valid = controller.validatePhonesQuantity(null, null, {
        model: {
          enabled: false
        }
      });
      expect(valid).toBe(true);
    });
  });

  describe('checkbox validation', function () {
    it('should validate when model valid is true', function () {
      var valid = controller.validateChecks(null, null, {
        model: {
          valid: true
        }
      });
      expect(valid).toBe(true);
    });

    it('should validate when one or more checkboxes are enabled true', function () {
      var valid = controller.validateChecks(null, null, {
        model: {
          enabled: true,
          valid: true
        }
      });
      expect(valid).toBe(true);
    });

    it('should not validate when all checkboxes are enabled false', function () {
      var valid = controller.validateChecks(null, null, {
        model: {
          enabled: false,
          valid: false
        }
      });
      expect(valid).toBe(false);
    });
  });

  describe('shipping address fields', function () {
    it('should be readonly when quantity is not valid', function () {
      spyOn(controller, 'calcQuantity').and.returnValues(0, 8, 0, 1);
      controller.toggleShipFields();

      expect(controller.shippingFields[0].templateOptions.disabled).toBe(true);
      expect(controller.shippingFields[1].templateOptions.disabled).toBe(true);
      expect(controller.shippingFields[2].templateOptions.disabled).toBe(true);
      expect(controller.shippingFields[3].templateOptions.disabled).toBe(true);
      expect(controller.shippingFields[4].templateOptions.disabled).toBe(true);
      expect(controller.shippingFields[5].templateOptions.disabled).toBe(true);
      expect(controller.shippingFields[6].templateOptions.disabled).toBe(true);
    });

    it('should be enabled when quantity is valid', function () {
      spyOn(controller, 'calcQuantity').and.returnValues(0, 2, 0, 7);
      controller.toggleShipFields();

      expect(controller.shippingFields[0].templateOptions.disabled).toBe(false);
      expect(controller.shippingFields[1].templateOptions.disabled).toBe(false);
      expect(controller.shippingFields[2].templateOptions.disabled).toBe(false);
      expect(controller.shippingFields[3].templateOptions.disabled).toBe(false);
      expect(controller.shippingFields[4].templateOptions.disabled).toBe(false);
      expect(controller.shippingFields[5].templateOptions.disabled).toBe(false);
      expect(controller.shippingFields[6].templateOptions.disabled).toBe(false);
    });
  });
});
