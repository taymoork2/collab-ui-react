import callConnectOptions from './index';
// import { describe, it, beforeEach, afterEach } from 'selenium-webdriver/testing';

describe('CallConnectOptions component:', () => {
  const FUSION_HYBRID_UC = 'squared-fusion-uc';
  const FUSION_HYBRID_EC = 'squared-fusion-ec';
  let test;
  beforeEach(function () {
    this.initModules(callConnectOptions, 'Core');
    this.injectDependencies(
      '$componentController',
      '$rootScope',
      'CsdmDataModelService',
      'USSService',
      '$q',
    );
    test = this;

  });

  let defaultState = () => {
    return {};
  };

  let state: any = defaultState();

  afterEach(function () {
    state = {};
    test.controller = null;
    jasmine.getJSONFixtures().clearCache();
    test.$rootScope.$digest();
    test.$rootScope = undefined;
  });

  let initCallConnect = (wFunction: string, enableCalService: boolean, cisUuid: string) => {
    state.stateParams = {
      wizard: {
        state: () => {
          return {
            data: {
              account: {
                cisUuid: cisUuid,
                enableCalService: enableCalService,
                entitlements: ['webex-squared', FUSION_HYBRID_EC, FUSION_HYBRID_UC],
              },
              atlasHerculesGoogleCalendarFeatureToggle: true,
              function: wFunction,
            },
          };
        },
        next: () => {
        },
      },
    };
    state.controller = test.$componentController('callConnectOptions', {
      $stateParams: state.stateParams,
    });
    state.controller.$onInit();
    test.$rootScope.$digest();
  };

  describe('init ()', () => {
    describe('with add new place function', () => {
      describe('where calendar is next service', () => {
        beforeEach(() => {
          initCallConnect('newPlace', true, 'asv029vajw0');
        });
        it('calling next should give calendar as next step', () => {
          spyOn(state.stateParams.wizard, 'next').and.returnValue({});
          state.controller.next();
          let nextParam = state.stateParams.wizard.next.calls.mostRecent().args;
          expect(nextParam[1]).toBe('calendar');
        });
        it('should have next enabled', () => {
          expect(state.controller.hasNextStep()).toBeTruthy();
        });
      });
      describe('where show activation is next', () => {
        beforeEach(() => {
          initCallConnect('newPlace', false, 'asv0a9s0v9');
        });
        it('should have next enabled', () => {
          expect(state.controller.hasNextStep()).toBeTruthy();
        });
        it('calling next should give "next" as next step', () => {
          spyOn(state.stateParams.wizard, 'next').and.returnValue({});
          state.controller.next();
          let nextParam = state.stateParams.wizard.next.calls.mostRecent().args;
          expect(nextParam[1]).toBe('next');
        });
      });
    });

    describe('with edit services as wizard function', () => {
      describe('where calendar is next service', () => {
        beforeEach(() => {
          initCallConnect('editServices', true, 'asv0h2qiowehv');
        });
        it('should have next enabled', () => {
          expect(state.controller.hasNextStep()).toBeTruthy();
        });
        it('calling next should give calendar as next step', () => {
          spyOn(state.stateParams.wizard, 'next').and.returnValue({});
          state.controller.next();
          let nextParam = state.stateParams.wizard.next.calls.mostRecent().args;
          expect(nextParam[1]).toBe('calendar');
        });
      });
      describe('when this is only service to edit', () => {
        beforeEach(() => {
          initCallConnect('editServices', false, 'av0s9uv02wesd');
        });
        it('should have next disabled', () => {
          expect(state.controller.hasNextStep()).toBeFalsy();
        });
      });
    });
  });
  describe('save ()', () => {
    let uid = '8AB6D09F5AD6D216015AEACB5D3C0005';
    beforeEach(() => {
      initCallConnect('with editServices', true, uid);
    });
    it('should call CsdmDataModelService with correct entitlement and extLinkAccts', () => {
      spyOn(test.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(test.$q.resolve({}));
      const place = { cisUuid: uid };
      spyOn(test.CsdmDataModelService, 'getPlacesMap').and.returnValue(test.$q.resolve({ 'https://url': place }));
      spyOn(test.USSService, 'updateUserProps').and.returnValue(test.$q.resolve({}));

      let mailId = 'mail@example.com';
      state.controller.mailID = mailId;

      state.controller.dismiss = () => {
      };
      state.controller.save();
      test.$rootScope.$digest();
      let saveParams = test.CsdmDataModelService.updateCloudberryPlace.calls.mostRecent().args;
      expect(saveParams[0]).toBe(place);

      expect(saveParams[1]).toContain(FUSION_HYBRID_EC);
      expect(saveParams[1]).toContain(FUSION_HYBRID_UC);
      expect(saveParams[1]).not.toContain('ciscouc');

      expect(saveParams[2]).toBe(null);
      expect(saveParams[3]).toBe(null);

      expect(saveParams[4]).toBeTruthy();
      expect(saveParams[4].length).toBe(1);
      expect(saveParams[4][0].providerID).toBe(FUSION_HYBRID_UC);
      expect(saveParams[4][0].accountGUID).toBe(mailId);

      expect(saveParams[5]).toBe(null);
    });
  });
  describe('next ()', () => {
    let uid = '8AB6D09F5AD6D216015AEACB8E4D0006';
    beforeEach(() => {
      initCallConnect('with newPlace', true, uid);
    });
    it('should include the correct entitlement and extLink for call in the wizard state', () => {
      let mailId = 'mail@example.com';
      spyOn(state.stateParams.wizard, 'next').and.returnValue({});

      state.controller.mailID = mailId;
      state.controller.next();

      let nextParam = state.stateParams.wizard.next.calls.mostRecent().args;
      expect(nextParam[0]).toBeTruthy();
      expect(nextParam[0].account).toBeTruthy();
      expect(nextParam[0].account.externalHybridCallIdentifier).toBeTruthy();
      expect(nextParam[0].account.externalHybridCallIdentifier.providerID).toBe(FUSION_HYBRID_UC);
      expect(nextParam[0].account.externalHybridCallIdentifier.accountGUID).toBe(mailId);

      expect(nextParam[0].account.ussProps).toEqual({ userId: uid, resourceGroups: { 'squared-fusion-uc': '' } });
    });
  });
});
