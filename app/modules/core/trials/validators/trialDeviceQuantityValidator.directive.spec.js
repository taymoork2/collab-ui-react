'use strict';

describe('Validator: DeviceQuantityValidator:', function () {
  beforeEach(function () {
    // modules
    this.initModules(
      'core.trial',
      'Core',
      'Huron',
      'Sunlight'
    );

    // dependencies
    this.injectDependencies(
      '$compile',
      '$rootScope',
      '$scope',
      '$q',
      '$translate',
      'Orgservice',
      'FeatureToggleService',
      'Analytics',
      '$httpBackend'
    );

    //spies
    this.$httpBackend
      .when('GET', 'https://identity.webex.com/identity/scim/null/v1/Users/me')
      .respond({});
    spyOn(this.Orgservice, 'getOrg');
    spyOn(this.Analytics, 'trackTrialSteps');
    this.initController('TrialDeviceController');

    // algendel: this validator is tightly bound to the parent controller therefore this odd setup.
    // once we refactor this to component the validation will be part of the component itself and this
    // will change. I chose to partially use rather than mock up the parent controller to make sure that
    // the flow of data between the two is working. This will all be refactored
    this.$rootScope.callTrial = {
      details: this.controller.details,
      getTypeQuantity: function () { return 2; },
      areTemplateOptionsDisabled: function () { return false; },
      getTotalQuantity: function () { return 2; },
      sx10: this.controller.sx10,
      mx300: this.controller.mx300,
      roomKit: this.controller.roomKit,
      phone7832: this.controller.phone7832,
      deviceLimit: this.controller.deviceLimit,
    };

    this.$scope.model = {
      device_sx10: {
        quantity: 2,
      },
      device_mx300: {
        quantity: 2,
      },
      device_roomKit: {
        quantity: 2,
      },
      device_phone7832: {
        quantity: 2,
      },
    };
    this.$scope.validationMessages = {
      device_sx10: {
        trialDeviceQuantityValidator: '',
      },
      device_mx300: {
        trialDeviceQuantityValidator: '',
      },
      device_roomKit: {
        trialDeviceQuantityValidator: '',
      },
      device_phone7832: {
        trialDeviceQuantityValidator: '',
      },
    };

    this.element = angular.element(
      '<form name="form">' +
        '<input ng-model="model.device_sx10.quantity" name="device_sx10" trial-device-quantity-validator = "{type: \'roomSystems\', name: \'sx10\'}" ' +
          'error-messages="validationMessages.device_sx10">' +
        '<input ng-model="model.device_mx300.quantity" name="device_mx300" trial-device-quantity-validator = "{type: \'roomSystems\', name: \'mx300\'}" ' +
          'error-messages="validationMessages.device_mx300">' +
          '<input ng-model="model.device_roomKit.quantity" name="device_roomKit" trial-device-quantity-validator = "{type: \'roomSystems\', name: \'roomKit\'}" ' +
          'error-messages="validationMessages.device_roomKit">' +
        '<input ng-model="model.device_phone7832.quantity" name="device_phone7832" trial-device-quantity-validator = "{type: \'callDevices\', name: \'phone7832\'}" ' +
          'error-messages="validationMessages.device_phone7832">' +
      '</form>'
    );
    this.compileTemplate(this.element);
    this.input = this.$scope.form.device_sx10;
  });

  describe('Device quantity validators', function () {
    describe('Input quantity validators', function () {
      it('should set the quantity invalid if it\'s over max allowed', function () {
        var expectedError = this.$translate.instant('trialModal.call.invalidQuantity', { min: this.controller.deviceLimit.CISCO_SX10.min, max: this.controller.deviceLimit.CISCO_SX10.max });
        this.input.$setViewValue('5');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        expect(this.$scope.validationMessages.device_sx10.trialDeviceQuantityValidator).toBe(expectedError);
      });

      it('should not validate quantity below 1 and above 5', function () {
        this.input.$setViewValue('6');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        this.input.$setViewValue('-1');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        this.input.$setViewValue('2');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(true);
      });

      it('should not validate quantity above 1 for mx300', function () {
        var expectedError = this.$translate.instant('trialModal.call.invalidQuantitySingle', { min: this.controller.deviceLimit.CISCO_MX300.min });
        this.input = this.$scope.form.device_mx300;
        this.input.$setViewValue('2');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        expect(this.$scope.validationMessages.device_mx300.trialDeviceQuantityValidator).toBe(expectedError);
      });

      it('should not validate quantity above 1 for Room Kit', function () {
        var expectedError = this.$translate.instant('trialModal.call.invalidQuantitySingle', { min: this.controller.deviceLimit.CISCO_ROOM_KIT.min });
        this.input = this.$scope.form.device_roomKit;
        this.input.$setViewValue('2');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        expect(this.$scope.validationMessages.device_roomKit.trialDeviceQuantityValidator).toBe(expectedError);
      });

      it('should validate if device is disabled', function () {
        this.$rootScope.callTrial.areTemplateOptionsDisabled = function () { return true; };
        this.$rootScope.callTrial.getTotalQuantity = function () { return 6; };
        this.input.$setViewValue('-1');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(true);
        expect(this.$scope.validationMessages.device_sx10.trialDeviceQuantityValidator).toBe('');
      });

      it('should validate quantity between 1 and 4', function () {
        this.input.$setViewValue('1');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(true);
        expect(this.$scope.validationMessages.device_sx10.trialDeviceQuantityValidator).toBe('');
        this.input.$setViewValue('4');
        this.$scope.$digest();
      });
    });
    describe('Input type quantity validators', function () {
      it('should set the quantity invalid if the phone quantity is over the max allowed', function () {
        var expectedError = this.$translate.instant('trialModal.call.invalidPhonesQuantity', { max: this.controller.deviceLimit.callDevices.max });
        this.input = this.$scope.form.device_phone7832;
        this.$rootScope.callTrial.getTypeQuantity = function () { return 6; };
        this.input.$setViewValue('1');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        expect(this.$scope.validationMessages.device_phone7832.trialDeviceQuantityValidator).toBe(expectedError);
      });

      it('should set the quantity invalid if the room ayarwma quantity is over the max allowed', function () {
        var expectedError = this.$translate.instant('trialModal.call.invalidRoomSystemsQuantity', { max: this.controller.deviceLimit.roomSystems.max });
        this.input = this.$scope.form.device_sx10;
        this.$rootScope.callTrial.getTypeQuantity = function () { return 5; };
        this.input.$setViewValue('1');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        expect(this.$scope.validationMessages.device_sx10.trialDeviceQuantityValidator).toBe(expectedError);
      });
    });

    describe('Input total quantity validators', function () {
      it('should set the quantity invalid if the total quantity is over the max allowed', function () {
        var expectedError = this.$translate.instant('trialModal.call.invalidTotalQuantity', { max: this.controller.deviceLimit.totalDevices.max });
        this.$rootScope.callTrial.getTypeQuantity = function () { return 3; };
        this.$rootScope.callTrial.getTotalQuantity = function () { return 6; };
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        expect(this.$scope.validationMessages.device_sx10.trialDeviceQuantityValidator).toBe(expectedError);
      });

      it('should validate when total quantity is between 1 and 7 for trial prior to 9/1/2016', function () {
        var controllerLocals = {
          controllerLocals: {
            $stateParams: {
              currentTrial: {
                startDate: new Date(2016, 7, 1),
              },
            },
          },
        };
        this.initController('TrialDeviceController', controllerLocals);
        this.$rootScope.callTrial.getTotalQuantity = function () { return 7; };
        this.$scope.$digest();
        expect(this.input.$valid).toBe(true);
      });

      it('should not validate when total quantity is over 5 for trial after to 9/1/2016', function () {
        var controllerLocals = {
          controllerLocals: {
            $stateParams: {
              currentTrial: {
                startDate: new Date(2016, 11, 11),
              },
            },
          },
        };
        this.initController('TrialDeviceController', controllerLocals);
        this.$rootScope.callTrial.getTotalQuantity = function () { return 7; };
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
      });

      it('should validate when quantity is between 1 and 5 for trial after 9/1/2016', function () {
        var controllerLocals = {
          controllerLocals: {
            $stateParams: {
              currentTrial: {
                startDate: new Date(2016, 11, 11),
              },
            },
          },
        };
        this.initController('TrialDeviceController', controllerLocals);
        this.$rootScope.callTrial.getTotalQuantity = function () { return 5; };
        this.input.$setViewValue('2');
        this.$scope.$digest();
        expect(this.input.$valid).toBe(true);
      });

      it('should trigger validation on change to total quantity even without the input change', function () {
        var expectedError = this.$translate.instant('trialModal.call.invalidTotalQuantity', { max: this.controller.deviceLimit.totalDevices.max });
        expect(this.input.$valid).toBe(true);
        this.$rootScope.callTrial.getTotalQuantity = function () { return 8; };
        this.$scope.$digest();
        expect(this.input.$valid).toBe(false);
        expect(this.$scope.validationMessages.device_sx10.trialDeviceQuantityValidator).toBe(expectedError);
      });
    });
  });
});
