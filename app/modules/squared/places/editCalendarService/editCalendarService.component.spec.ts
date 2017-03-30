import editCalendarService from './index';

describe('EditCalendarService component:', () => {
  const FUSION_CAL_ENTITLEMENT = 'squared-fusion-cal';
  const FUSION_GCAL_ENTITLEMENT = 'squared-fusion-gcal';
  let test;
  beforeEach(function () {
    this.initModules(editCalendarService, 'Core');
    this.injectDependencies(
      '$componentController',
      '$rootScope',
      '$httpBackend',
      'ServiceDescriptor',
      'CsdmDataModelService',
      'USSService',
      '$q',
    );
    test = this;

  });

  let state: any = defaultState();
  afterEach(function () {
    state = {};
    test.controller = null;
    jasmine.getJSONFixtures().clearCache();
    test.$rootScope.$digest();
    test.$rootScope = undefined;
  });

  function defaultState() {
    return {};
  }

  describe('init ()', () => {
    describe('where gcal service is not enabled and exchange is enabled', () => {
      beforeEach(() => {
        spyOn(test.ServiceDescriptor, 'getServices').and.returnValue(test.$q.resolve([{
          id: FUSION_GCAL_ENTITLEMENT,
          enabled: false,
        }, {
          id: FUSION_CAL_ENTITLEMENT,
          enabled: true,
        }]));
        state.controller = test.$componentController('editCalendarService', {
          $stateParams: {
            wizard: {
              state: () => {
                return {
                  data: {
                    account: { entitlements: ['webex-squared', 'spark'] },
                    atlasHerculesGoogleCalendarFeatureToggle: true,
                  },
                };
              },
            },
          },
        });
        state.controller.$onInit();
      });
      it('should select exchange and not show it', () => {
        test.$rootScope.$digest();
        expect(state.controller.getShowGCalService()).toBe(false);
        expect(state.controller.getShowServiceOptions()).toBe(false);
        expect(state.controller.getShowCalService()).toBe(false);
        expect(state.controller.calService).toBe(FUSION_CAL_ENTITLEMENT);
        // expect(test.view.find('#service2').disabled()).toBe(true);
      });
    });
    describe('with gcal service enabled and exchange enabled', () => {
      beforeEach(() => {
        spyOn(test.ServiceDescriptor, 'getServices').and.returnValue(test.$q.resolve([{
          id: FUSION_GCAL_ENTITLEMENT,
          enabled: true,
        }, {
          id: FUSION_CAL_ENTITLEMENT,
          enabled: true,
        }]));

        state.controller = test.$componentController('editCalendarService', {
          $stateParams: {
            wizard: {
              state: () => {
                return {
                  data: {
                    account: { entitlements: ['webex-squared', 'spark'] },
                    atlasHerculesGoogleCalendarFeatureToggle: true,
                  },
                };
              },
            },
          },
        });
        state.controller.$onInit();
      });
      it('should show both gcal and cal radio button, and select none', () => {
        test.$rootScope.$digest();

        expect(state.controller.getShowGCalService()).toBe(true);
        expect(state.controller.getShowCalService()).toBe(true);
        expect(state.controller.getShowServiceOptions()).toBe(true);
        expect(state.controller.calService).toBe('');
      });
    });
    describe('with gcal service enabled and exchange disabled', () => {
      beforeEach(() => {
        spyOn(test.ServiceDescriptor, 'getServices').and.returnValue(test.$q.resolve([{
          id: FUSION_GCAL_ENTITLEMENT,
          enabled: true,
        }, {
          id: FUSION_CAL_ENTITLEMENT,
          enabled: false,
        }]));

        state.controller = test.$componentController('editCalendarService', {
          $stateParams: {
            wizard: {
              state: () => {
                return {
                  data: {
                    account: { entitlements: ['webex-squared', 'spark'] },
                    atlasHerculesGoogleCalendarFeatureToggle: true,
                  },
                };
              },
            },
          },
        });
        state.controller.$onInit();
      });
      it('should select gcal', () => {
        test.$rootScope.$digest();

        expect(state.controller.getShowGCalService()).toBe(false);
        expect(state.controller.getShowCalService()).toBe(false);
        expect(state.controller.getShowServiceOptions()).toBe(false);
        expect(state.controller.calService).toBe(FUSION_GCAL_ENTITLEMENT);
      });
    });
    describe('on return from back, should select the correct cal service from previous step', () => {
    });
  });

  describe('nextEnabled function', () => {

    describe('with editServices as given wizard function', () => {
      beforeEach(() => {
        spyOn(test.ServiceDescriptor, 'getServices').and.returnValue(test.$q.resolve([{
          id: FUSION_GCAL_ENTITLEMENT,
          enabled: true,
        }, {
          id: FUSION_CAL_ENTITLEMENT,
          enabled: true,
        }]));
        state.wizardData = {
          state: () => {
            return { data: { function: 'editServices', account: { entitlements: ['webex-squared', 'spark'] } } };
          },
          next: () => {
          },
        };
        state.controller = test.$componentController('editCalendarService', {
          $stateParams: {
            wizard: state.wizardData,
          },
        });
        state.controller.$onInit();
      });
      it('then next should be disabled', () => {
        expect(state.controller.hasNextStep()).toBe(false);
      });
    });

    describe('with normal add place function for wizard', () => {
      beforeEach(() => {
        spyOn(test.ServiceDescriptor, 'getServices').and.returnValue(test.$q.resolve([{
          id: FUSION_GCAL_ENTITLEMENT,
          enabled: true,
        }, {
          id: FUSION_CAL_ENTITLEMENT,
          enabled: true,
        }]));
        state.wizardData = {
          state: () => {
            return { data: { function: 'addPlace', account: { entitlements: ['webex-squared', 'spark'] } } };
          },
          next: () => {
          },
        };
        state.controller = test.$componentController('editCalendarService', {
          $stateParams: {
            wizard: state.wizardData,
          },
        });
        state.controller.$onInit();
      });
      it('then next should be enabled', () => {
        expect(state.controller.hasNextStep()).toBe(true);
      });
    });
  });

  describe('next', () => {
    beforeEach(() => {
      spyOn(test.ServiceDescriptor, 'getServices').and.returnValue(test.$q.resolve([{
        id: FUSION_GCAL_ENTITLEMENT,
        enabled: true,
      }, {
        id: FUSION_CAL_ENTITLEMENT,
        enabled: true,
      }]));
      state.wizardData = {
        state: () => {
          return { data: { account: { entitlements: ['webex-squared', 'spark'] } } };
        },
        next: () => {
        },
      };
      state.controller = test.$componentController('editCalendarService', {
        $stateParams: {
          wizard: state.wizardData,
        },
      });
      state.controller.$onInit();
    });
    describe('with exchange selected', () => {
      let email = 'test@example.com';
      beforeEach(() => {
        state.controller.calService = FUSION_CAL_ENTITLEMENT;
        state.controller.emailOfMailbox = email;
      });
      it('should set externalIdentifier to exchange', () => {
        spyOn(state.wizardData, 'next');
        state.controller.next();

        expect(state.wizardData.next).toHaveBeenCalled();
        let wizardState = state.wizardData.next.calls.mostRecent().args[0];

        expect(wizardState.account.entitlements).toEqual(['webex-squared', 'spark', FUSION_CAL_ENTITLEMENT]);
        expect(wizardState.account.externalCalendarIdentifier.accountGUID).toEqual(email);
        expect(wizardState.account.externalCalendarIdentifier.providerID).toEqual(FUSION_CAL_ENTITLEMENT);
      });
    });

    describe('with google selected', () => {
      let email = 'test2@example.com';
      beforeEach(() => {
        state.controller.calService = FUSION_GCAL_ENTITLEMENT;
        state.controller.emailOfMailbox = email;
      });
      it('should set externalIdentifier to exchange', () => {
        spyOn(state.wizardData, 'next');
        state.controller.next();

        expect(state.wizardData.next).toHaveBeenCalled();
        let wizardState = state.wizardData.next.calls.mostRecent().args[0];

        expect(wizardState.account.entitlements).toEqual(['webex-squared', 'spark', FUSION_GCAL_ENTITLEMENT]);
        expect(wizardState.account.externalCalendarIdentifier.accountGUID).toEqual(email);
        expect(wizardState.account.externalCalendarIdentifier.providerID).toEqual(FUSION_GCAL_ENTITLEMENT);
      });
      it('next should be enabled', () => {
        expect(state.controller.isNextDisabled()).toBeFalsy();
      });
    });

    describe('with none selected', () => {
      beforeEach(() => {
        state.controller.calService = '';
        state.controller.emailOfMailbox = 'test@example.com';
      });
      it('next should be disabled', () => {
        expect(state.controller.isNextDisabled()).toBeTruthy();
      });
    });

  });

  describe('save', () => {
    beforeEach(() => {
      let id = 'asvawoei0a';
      spyOn(test.ServiceDescriptor, 'getServices').and.returnValue(test.$q.resolve([{
        id: FUSION_GCAL_ENTITLEMENT,
        enabled: true,
      }, {
        id: FUSION_CAL_ENTITLEMENT,
        enabled: true,
      }]));
      spyOn(test.CsdmDataModelService, 'getPlacesMap').and.returnValue(test.$q.resolve({ 'https://csdm/place.url': { cisUuid: id } }));
      state.wizardData = {
        state: () => {
          return {
            data: {
              account: { entitlements: ['webex-squared', 'spark'], cisUuid: id },
              atlasHerculesGoogleCalendarFeatureToggle: true,
            },
          };
        },
        next: () => {
        },
      };
      state.controller = test.$componentController('editCalendarService', {
        $stateParams: {
          wizard: state.wizardData,
        },
      });
      state.controller.$onInit();
      state.controller.dismiss = () => {
      };
    });

    describe('with exchange selected', () => {
      let email = 'test@example.com';
      beforeEach(() => {

      });
      it('should set externalIdentifier to exchange', () => {
        test.$rootScope.$digest();
        state.controller.calService = FUSION_CAL_ENTITLEMENT;
        state.controller.emailOfMailbox = email;
        spyOn(test.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(test.$q.resolve());
        spyOn(test.USSService, 'updateUserProps').and.returnValue(test.$q.resolve({}));
        state.controller.save();
        test.$rootScope.$digest();

        expect(test.CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalled();
        let wizardState = test.CsdmDataModelService.updateCloudberryPlace.calls.mostRecent().args;

        expect(wizardState[1]).toEqual(['webex-squared', 'spark', FUSION_CAL_ENTITLEMENT]);
        expect(wizardState[4][0].accountGUID).toEqual(email);
        expect(wizardState[4][0].providerID).toEqual(FUSION_CAL_ENTITLEMENT);
      });
    });

    describe('with google selected', () => {
      let email = 'test2@example.com';
      beforeEach(() => {

      });
      it('should set externalIdentifier to exchange', () => {
        test.$rootScope.$digest();
        state.controller.calService = FUSION_GCAL_ENTITLEMENT;
        state.controller.emailOfMailbox = email;
        spyOn(test.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(test.$q.resolve());
        spyOn(test.USSService, 'updateUserProps').and.returnValue(test.$q.resolve({}));
        state.controller.save();
        test.$rootScope.$digest();

        expect(test.CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalled();
        let wizardState = test.CsdmDataModelService.updateCloudberryPlace.calls.mostRecent().args;
        expect(wizardState[1]).toEqual(['webex-squared', 'spark', FUSION_GCAL_ENTITLEMENT]);
        expect(wizardState[4][0].accountGUID).toEqual(email);
        expect(wizardState[4][0].providerID).toEqual(FUSION_GCAL_ENTITLEMENT);
      });
      it('save should be enabled', () => {
        test.$rootScope.$digest();
        state.controller.calService = FUSION_GCAL_ENTITLEMENT;
        state.controller.emailOfMailbox = email;
        expect(state.controller.isSaveDisabled()).toBeFalsy();
      });
    });

    describe('with none selected', () => {
      beforeEach(() => {
        state.controller.calService = '';
        state.controller.emailOfMailbox = 'test@example.com';
      });
      it('save should be disabled', () => {
        expect(state.controller.isSaveDisabled()).toBeTruthy();
      });
    });

  });
});
