import callConnectOptions from './index';
import IExternalLinkedAccount = csdm.IExternalLinkedAccount;
// import { describe, it, beforeEach, afterEach } from 'selenium-webdriver/testing';

describe('CallConnectOptions component:', () => {
  const FUSION_HYBRID_UC = 'squared-fusion-uc';
  const FUSION_HYBRID_EC = 'squared-fusion-ec';
  const FUSION_CALENDAR = 'squared-fusion-cal';
  const FUSION_GCALENDAR = 'squared-fusion-gcal';
  let test;
  beforeEach(function () {
    this.initModules(callConnectOptions, 'Core');
    this.injectDependencies(
      '$componentController',
      '$rootScope',
      'CsdmDataModelService',
      'ResourceGroupService',
      'USSService',
      'Notification',
      '$q',
    );
    test = this;
    spyOn(this.ResourceGroupService, 'getAllAsOptions').and.returnValue(this.$q.resolve({}));
  });

  const defaultState = () => {
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

  const initCallConnect = (wFunction: string,
                           enableCalService: boolean, cisUuid: string,
                           entitlements: string[] = ['webex-squared', FUSION_HYBRID_EC, FUSION_HYBRID_UC],
                           extLinkAccts: IExternalLinkedAccount[] = []) => {
    state.stateParams = {
      wizard: {
        state: () => {
          return {
            data: {
              account: {
                cisUuid: cisUuid,
                enableCalService: enableCalService,
                entitlements: entitlements,
                externalLinkedAccounts: extLinkAccts,
              },
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
          const nextParam = state.stateParams.wizard.next.calls.mostRecent().args;
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
          const nextParam = state.stateParams.wizard.next.calls.mostRecent().args;
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
          const nextParam = state.stateParams.wizard.next.calls.mostRecent().args;
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
    const uid = '8AB6D09F5AD6D216015AEACB5D3C0005';
    describe('when no existing calendar entitlements', () => {
      beforeEach(() => {
        initCallConnect('with editServices', false, uid,
          ['webex-squared', FUSION_HYBRID_EC, FUSION_HYBRID_UC],
          [
            { providerID: FUSION_CALENDAR, accountGUID: 'calendar@example.com' },
            { providerID: FUSION_GCALENDAR, accountGUID: 'calendar@example.com' },
          ]);
      });
      it('should call CsdmDataModelService with correct entitlement and extLinkAccts with cleaned out call and calendar', () => {
        spyOn(test.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(test.$q.resolve({}));
        spyOn(test.Notification, 'success');
        const place = { cisUuid: uid };
        spyOn(test.CsdmDataModelService, 'reloadPlace').and.returnValue(test.$q.resolve(place));
        spyOn(test.USSService, 'updateBulkUserProps').and.returnValue(test.$q.resolve({}));
        spyOn(test.USSService, 'refreshEntitlementsForUser').and.returnValue(test.$q.resolve({}));

        const mailId = 'mail@example.com';
        state.controller.mailID = mailId;

        state.controller.dismiss = () => {
        };
        state.controller.save();
        test.$rootScope.$digest();
        expect(test.USSService.updateBulkUserProps).toHaveBeenCalled();
        expect(test.USSService.refreshEntitlementsForUser).toHaveBeenCalled();
        expect(test.CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
          entitlements: ['webex-squared', FUSION_HYBRID_EC, FUSION_HYBRID_UC],
          externalLinkedAccounts: [
            { providerID: FUSION_CALENDAR, accountGUID: 'calendar@example.com', operation: 'delete' },
            { providerID: FUSION_GCALENDAR, accountGUID: 'calendar@example.com', operation: 'delete' },
            { providerID: FUSION_HYBRID_UC, accountGUID: mailId, status: 'unconfirmed-email' },
          ],
        });
        expect(test.Notification.success).toHaveBeenCalled();
      });
    });
    describe('when there are existing calendar entitlements', () => {
      beforeEach(() => {
        initCallConnect('with editServices', false, uid,
          ['webex-squared', FUSION_CALENDAR, FUSION_HYBRID_EC, FUSION_HYBRID_UC],
          [
            { providerID: FUSION_CALENDAR, accountGUID: 'calendar@example.com' },
            { providerID: FUSION_GCALENDAR, accountGUID: 'calendar@example.com' },
            { providerID: 'special provider', accountGUID: '234052519823' },
          ],
        );
      });
      it('should only clean the calendar of entitlements not present', () => {
        spyOn(test.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(test.$q.resolve({}));
        const place = { cisUuid: uid };
        spyOn(test.CsdmDataModelService, 'reloadPlace').and.returnValue(test.$q.resolve(place));
        spyOn(test.USSService, 'updateBulkUserProps').and.returnValue(test.$q.resolve({}));
        spyOn(test.USSService, 'refreshEntitlementsForUser').and.returnValue(test.$q.resolve({}));

        const mailId = 'mail@example.com';
        state.controller.mailID = mailId;

        state.controller.dismiss = () => {
        };
        state.controller.save();
        test.$rootScope.$digest();
        expect(test.USSService.updateBulkUserProps).toHaveBeenCalled();
        expect(test.USSService.refreshEntitlementsForUser).toHaveBeenCalled();
        expect(test.CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
          entitlements: ['webex-squared', FUSION_CALENDAR, FUSION_HYBRID_EC, FUSION_HYBRID_UC],
          externalLinkedAccounts: [
            { providerID: FUSION_GCALENDAR, accountGUID: 'calendar@example.com', operation: 'delete' },
            // { providerID: FUSION_CALENDAR, accountGUID: mailId, status: 'unconfirmed-email' },  //this should not be re-saved
            { providerID: FUSION_HYBRID_UC, accountGUID: mailId, status: 'unconfirmed-email' },
            // { providerID: 'special provider', accountGUID: '234052519823' },  //this should be left intact.
          ],
        });
      });
    });
    describe('when there are existing calendar entitlements but unselected calendar', () => {
      beforeEach(() => {
        initCallConnect('with editServices', false, uid,
          ['webex-squared', FUSION_GCALENDAR, FUSION_HYBRID_EC, FUSION_HYBRID_UC],
          [
            { providerID: FUSION_CALENDAR, accountGUID: 'calendar@example.com' },
            { providerID: FUSION_GCALENDAR, accountGUID: 'calendar@example.com' },
          ],
        );
      });
      it('should only clean the calendar of entitlments not present', () => {
        spyOn(test.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(test.$q.resolve({}));
        const place = { cisUuid: uid };
        spyOn(test.CsdmDataModelService, 'reloadPlace').and.returnValue(test.$q.resolve(place));
        spyOn(test.USSService, 'updateBulkUserProps').and.returnValue(test.$q.resolve({}));
        spyOn(test.USSService, 'refreshEntitlementsForUser').and.returnValue(test.$q.resolve({}));

        const mailId = 'mail@example.com';
        state.controller.mailID = mailId;

        state.controller.dismiss = () => {
        };
        state.controller.save();
        test.$rootScope.$digest();
        expect(test.USSService.updateBulkUserProps).toHaveBeenCalled();
        expect(test.USSService.refreshEntitlementsForUser).toHaveBeenCalled();
        expect(test.CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
          entitlements: ['webex-squared', FUSION_GCALENDAR, FUSION_HYBRID_EC, FUSION_HYBRID_UC],
          externalLinkedAccounts: [
            { providerID: FUSION_CALENDAR, accountGUID: 'calendar@example.com', operation: 'delete' },
            { providerID: FUSION_HYBRID_UC, accountGUID: mailId, status: 'unconfirmed-email' },
          ],
        });
      });
    });
    beforeEach(() => {
      initCallConnect('with editServices', true, uid);
    });
    it('should call CsdmDataModelService with correct entitlement and extLinkAccts', () => {
      spyOn(test.CsdmDataModelService, 'updateCloudberryPlace').and.returnValue(test.$q.resolve({}));
      const place = { cisUuid: uid };
      spyOn(test.CsdmDataModelService, 'reloadPlace').and.returnValue(test.$q.resolve(place));
      spyOn(test.USSService, 'updateBulkUserProps').and.returnValue(test.$q.resolve({}));
      spyOn(test.USSService, 'refreshEntitlementsForUser').and.returnValue(test.$q.resolve({}));

      const mailId = 'mail@example.com';
      state.controller.mailID = mailId;

      state.controller.dismiss = () => {
      };
      state.controller.save();
      test.$rootScope.$digest();
      expect(test.USSService.updateBulkUserProps).toHaveBeenCalled();
      expect(test.USSService.refreshEntitlementsForUser).toHaveBeenCalled();
      expect(test.CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
        entitlements: ['webex-squared', FUSION_HYBRID_EC, FUSION_HYBRID_UC],
        externalLinkedAccounts: [{ providerID: FUSION_HYBRID_UC, accountGUID: mailId, status: 'unconfirmed-email' }],
      });
    });
  });
  describe('next ()', () => {
    const uid = '8AB6D09F5AD6D216015AEACB8E4D0006';
    beforeEach(() => {
      initCallConnect('with newPlace', true, uid);
    });
    it('should include the correct entitlement and extLink for call in the wizard state', () => {
      const mailId = 'mail@example.com';
      spyOn(state.stateParams.wizard, 'next').and.returnValue({});

      state.controller.mailID = mailId;
      state.controller.next();

      const nextParam = state.stateParams.wizard.next.calls.mostRecent().args;
      expect(nextParam[0]).toBeTruthy();
      expect(nextParam[0].account).toBeTruthy();
      expect(nextParam[0].account.externalHybridCallIdentifier).toBeTruthy();
      expect(nextParam[0].account.externalHybridCallIdentifier.length).toBe(1);
      expect(nextParam[0].account.externalHybridCallIdentifier[0].providerID).toBe(FUSION_HYBRID_UC);
      expect(nextParam[0].account.externalHybridCallIdentifier[0].accountGUID).toBe(mailId);

      expect(nextParam[0].account.ussProps).toEqual({ userId: uid, resourceGroups: { 'squared-fusion-uc': '' } });
    });
  });
});
