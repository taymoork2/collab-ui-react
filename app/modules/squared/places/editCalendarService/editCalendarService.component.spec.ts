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
      '$q',
    );
    test = this;

  });

  let state: any = defaultState();
  afterEach(function () {
    state = {};
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
                return { data: { account: { entitlements: ['webex-squared'] } } };
              },
            },
          },
        });
        state.controller.$onInit();
      });
      it('should only show exchange and be selected', () => {
        test.$rootScope.$digest();
        expect(state.controller.getShowGCalService()).toBe(false);
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
                return { data: { account: { entitlements: ['webex-squared'] } } };
              },
            },
          },
        });
        state.controller.$onInit();
      });
      it('should show both gcal and cal radio button, and select none', () => {
        test.$rootScope.$digest();

        expect(state.controller.getShowGCalService()).toBe(true);
        expect(state.controller.getShowGCalService()).toBe(true);
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
                return { data: { account: { entitlements: ['webex-squared'] } } };
              },
            },
          },
        });
        state.controller.$onInit();
      });
      it('should show gcal and radio button, and select gcal', () => {
        test.$rootScope.$digest();

        expect(state.controller.getShowGCalService()).toBe(true);
        expect(state.controller.getShowCalService()).toBe(false);
        expect(state.controller.calService).toBe(FUSION_GCAL_ENTITLEMENT);
      });
    });
    describe('on return from back, should select the correct cal service from previous step', () => {
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
          return { data: { account: { entitlements: ['webex-squared'] } } };
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

        expect(wizardState.account.entitlements).toEqual(['webex-squared', FUSION_CAL_ENTITLEMENT]);
        expect(wizardState.account.externalCalendarIdentifier.email).toEqual(email);
        expect(wizardState.account.externalCalendarIdentifier.type).toEqual(FUSION_CAL_ENTITLEMENT);
      });
    });

    describe('with google selected', () => {
      let email = 'test@example.com';
      beforeEach(() => {
        state.controller.calService = FUSION_GCAL_ENTITLEMENT;
        state.controller.emailOfMailbox = email;
      });
      it('should set externalIdentifier to exchange', () => {
        spyOn(state.wizardData, 'next');
        state.controller.next();

        expect(state.wizardData.next).toHaveBeenCalled();
        let wizardState = state.wizardData.next.calls.mostRecent().args[0];

        expect(wizardState.account.entitlements).toEqual(['webex-squared', FUSION_GCAL_ENTITLEMENT]);
        expect(wizardState.account.externalCalendarIdentifier.email).toEqual(email);
        expect(wizardState.account.externalCalendarIdentifier.type).toEqual(FUSION_GCAL_ENTITLEMENT);
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
});
