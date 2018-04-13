'use strict';

describe('AddLinesCtrl: Ctrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight', 'Squared');
    this.injectDependencies(
      '$controller',
      '$httpBackend',
      '$q',
      '$scope',
      '$state',
      '$stateParams',
      'CommonLineService',
      'CsdmDataModelService',
      'DialPlanService',
      'FeatureToggleService',
      'Notification'
    );

    this.internalNumbers = getJSONFixture('huron/json/internalNumbers/numbersInternalNumbers.json');
    this.externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    this.externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    this.externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    this.sites = getJSONFixture('huron/json/settings/sites.json');

    this.$scope.wizard = {};
    this.$scope.wizard.current = {
      step: {
        name: 'fakeStep',
      },
    };

    this.$stateParams.wizard = {
      state: function () {
        return {
          data: {
            account: {
              name: 'Red River',
            },
          },
        };
      },
    };

    this.$scope.wizardData = {
      data: {
        deviceName: 'Red River',
      },
    };

    this.$scope.wizard.isLastStep = jasmine.createSpy('isLastStep').and.returnValue(false);

    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'notify');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve());

    spyOn(this.CommonLineService, 'getInternalNumberPool').and.returnValue(this.internalNumbers);
    spyOn(this.CommonLineService, 'loadInternalNumberPool').and.returnValue(this.$q.resolve(this.internalNumbers));
    spyOn(this.CommonLineService, 'getExternalNumberPool').and.returnValue(this.externalNumbers);

    spyOn(this.CommonLineService, 'loadExternalNumberPool').and.returnValue(this.$q.resolve(this.externalNumbers));
    spyOn(this.CommonLineService, 'loadPrimarySiteInfo').and.returnValue(this.$q.resolve(this.sites));
    spyOn(this.CommonLineService, 'mapDidToDn').and.returnValue(this.$q.resolve(this.externalNumberPoolMap));
    spyOn(this.DialPlanService, 'getDialPlan').and.returnValue(this.$q.resolve({
      extensionGenerated: 'false',
    }));

    spyOn(this.CommonLineService, 'assignMapUserList').and.returnValue([{
      name: 'Red River',
      externalNumber: this.externalNumberPool[0],
    }]);
    spyOn(this.CommonLineService, 'assignDNForUserList').and.callThrough();

    this.initController = function () {
      this.controller = this.$controller('AddLinesCtrl', {
        $scope: this.$scope,
        $state: this.$state,
        CommonLineService: this.CommonLineService,
      });
    };

    installPromiseMatchers();
  });

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });

  describe('Places Add DID and DN assignment', function () {
    beforeEach(function () {
      this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond({});
      this.initController();
      this.controller.addDnGridOptions.data = [{
        name: 'Red River',
      }];

      this.$scope.$apply();
      this.phoneNumber = '+14084744532';
    });

    it('activateDID', function () {
      this.controller.activateDID();
      this.$scope.$apply();

      expect(this.$scope.externalNumber.pattern).toEqual(this.phoneNumber);
      expect(this.CommonLineService.assignDNForUserList).toHaveBeenCalled();
    });

    it('mapDidToDn', function () {
      this.initController();
      this.$scope.showExtensions = false;
      this.controller.mapDidToDn();
      this.$scope.$apply();
      expect(this.$scope.externalNumber.pattern).toEqual(this.phoneNumber);
    });
  });

  describe('wizard functions', function () {
    beforeEach(function () {
      this.deviceCisUuid = 'deviceId';
      this.locationUuid = 'locationUuid';
      this.directoryNumber = 'directoryNumber';
      this.externalNumber = 'externalNumber';
      this.entitlements = ['something', 'else'];
    });

    describe('has next', function () {
      describe('with enableCalService', function () {
        beforeEach(function () {
          this.$stateParams.wizard = {
            state: function () {
              return {
                data: {
                  account: {
                    cisUuid: this.deviceCisUuid,
                    enableCalService: true,
                  },
                },
              };
            },
            next: _.noop,
          };
          this.initController();
        });

        it('should evaluate hasNext to true', function () {
          expect(this.controller.hasNextStep()).toBe(true);
        });
      });

      describe('with enableCalService false and it is editServices', function () {
        beforeEach(function () {
          this.$stateParams.wizard = {
            state: function () {
              return {
                data: {
                  function: 'editServices',
                  account: {
                    cisUuid: this.deviceCisUuid,
                    enableCalService: false,
                  },
                },
              };
            },
            next: _.noop,
          };
          this.initController();
        });

        it('should evaluate hasNext to false', function () {
          expect(this.controller.hasNextStep()).toBe(false);
        });
      });
    });

    describe('isDisabled', function () {
      beforeEach(function () {
        this.initController();
      });

      it('with empty internal number pool should be disabled', function () {
        this.CommonLineService.getInternalNumberPool.and.returnValue([]);
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: this.directoryNumber,
          externalNumber: this.externalNumber,
        });
        this.$scope.$apply();
        expect(this.controller.isDisabled()).toBe(true);
      });

      it('with empty external number pool should be disabled', function () {
        this.CommonLineService.getExternalNumberPool.and.returnValue([]);
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: this.directoryNumber,
          externalNumber: this.externalNumber,
        });
        this.$scope.$apply();
        expect(this.controller.isDisabled()).toBe(true);
      });

      it('without directoryNumber selected should be disabled', function () {
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({
          externalNumber: this.externalNumber,
        });
        this.$scope.$apply();
        expect(this.controller.isDisabled()).toBe(true);
      });

      it('with filled pools and directoryNumber selected should be enabled', function () {
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: this.directoryNumber,
          externalNumber: this.externalNumber,
        });
        this.$scope.$apply();
        expect(this.controller.isDisabled()).toBe(false);
      });
    });

    describe('next', function () {
      beforeEach(function () {
        var deviceCisUuid = this.deviceCisUuid;
        this.$stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                },
              },
            };
          },
          next: jasmine.createSpy('next'),
        };
        this.initController();
      });

      it('with only directoryNumber specified should set the wizardState with correct fields for show activation code modal', function () {
        this.controller.addDnGridOptions.data = [{
          assignedDn: { number: this.directoryNumber },
          externalNumber: { pattern: 'Ingen', uuid: 'none' },
        }];
        this.controller.next();
        this.$scope.$apply();
        expect(this.$stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = this.$stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.directoryNumber).toBe(this.directoryNumber);
        expect(wizardState.account.externalNumber).toBeUndefined();
      });

      it('with only externalNumber specified should set the wizardState with correct fields for show activation code modal', function () {
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({ externalNumber: this.externalNumber });
        this.controller.next();
        this.$scope.$apply();
        expect(this.$stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = this.$stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.directoryNumber).toBeUndefined();
        expect(wizardState.account.externalNumber).toBe(this.externalNumber);
      });
    });

    describe('save', function () {
      beforeEach(function () {
        var entitlements = this.entitlements;
        var deviceCisUuid = this.deviceCisUuid;

        this.$stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: entitlements,
                },
              },
            };
          },
          save: _.noop,
        };
        spyOn(this.$stateParams.wizard, 'save');
        this.initController();
        this.$scope.$dismiss = _.noop;
        spyOn(this.$scope, '$dismiss');
        spyOn(this.Notification, 'success');
        spyOn(this.Notification, 'errorResponse');
        spyOn(this.Notification, 'warning');
      });

      it('passes on the selected numbers to CsdmDataModeService', function () {
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({
          locationUuid: this.locationUuid,
          directoryNumber: this.directoryNumber,
          externalNumber: this.externalNumber,
        });
        var place = { cisUuid: this.deviceCisUuid };
        spyOn(this.CsdmDataModelService, 'reloadPlace').and.returnValue(this.$q.resolve(place));
        spyOn(this.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(this.$q.resolve());
        this.controller.save();
        this.$scope.$apply();
        expect(this.CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
          entitlements: this.entitlements,
          locationUuid: this.locationUuid,
          directoryNumber: this.directoryNumber,
          externalNumber: this.externalNumber,
        });
        expect(this.Notification.success).toHaveBeenCalled();
        expect(this.$scope.$dismiss).toHaveBeenCalled();
      });

      it('display warning when place not found', function () {
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: this.directoryNumber,
          externalNumber: this.externalNumber,
        });
        spyOn(this.CsdmDataModelService, 'reloadPlace').and.returnValue(this.$q.resolve());
        this.controller.save();
        this.$scope.$apply();
        expect(this.Notification.warning).toHaveBeenCalled();
        expect(this.$scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display error when fetching place fails', function () {
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: this.directoryNumber,
          externalNumber: this.externalNumber,
        });
        spyOn(this.CsdmDataModelService, 'reloadPlace').and.returnValue(this.$q.reject());
        this.controller.save();
        this.$scope.$apply();
        expect(this.Notification.errorResponse).toHaveBeenCalled();
        expect(this.$scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display error when update fails', function () {
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({
          directoryNumber: this.directoryNumber,
          externalNumber: this.externalNumber,
        });
        spyOn(this.CsdmDataModelService, 'reloadPlace').and.returnValue(this.$q.resolve({ cisUuid: this.deviceCisUuid }));
        spyOn(this.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(this.$q.reject());
        this.controller.save();
        this.$scope.$apply();
        expect(this.Notification.errorResponse).toHaveBeenCalled();
        expect(this.$scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display warning when no directoryNumber or externalNumber is set', function () {
        spyOn(this.controller, 'getSelectedNumbers').and.returnValue({});
        this.controller.save();
        this.$scope.$apply();
        expect(this.Notification.warning).toHaveBeenCalled();
        expect(this.$scope.$dismiss).toHaveBeenCalledTimes(0);
      });
    });
  });
});
