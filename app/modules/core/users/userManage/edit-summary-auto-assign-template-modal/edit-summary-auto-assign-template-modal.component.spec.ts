import moduleName from './index';

describe('Component: editSummaryAutoAssignTemplateModal:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      '$state',
      'Notification',
      'AutoAssignTemplateService',
    );
  });

  describe('primary behaviors (view):', () => {
    it('...', function () {
      // TODO: implement
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should initialize its "stateData" property', function () {
      _.set(this.$state, 'params.stateData', {
        items: {
          'fake-license-id-1': {},
          'fake-license-id-2': {},
          'fake-license-id-3': {},
        },
      });
      this.compileComponent('editSummaryAutoAssignTemplateModal');
      expect(this.controller.stateData).toEqual({
        items: {
          'fake-license-id-1': {},
          'fake-license-id-2': {},
          'fake-license-id-3': {},
        },
      });
    });

    describe('mkPayload():', function () {
      it('should return a payload composed of a license payload, and a user-entitlements payload', function () {
        this.compileComponent('editSummaryAutoAssignTemplateModal');
        spyOn(this.controller, 'mkLicensesPayload').and.returnValue(['fake-licenses-payload']);
        spyOn(this.controller, 'mkUserEntitlementsPayload').and.returnValue(['fake-user-entitlements-payload']);
        const payload = this.controller.mkPayload();
        expect(this.controller.mkLicensesPayload).toHaveBeenCalled();
        expect(this.controller.mkUserEntitlementsPayload).toHaveBeenCalled();
        expect(payload).toEqual({
          name: 'Default',
          licenses: ['fake-licenses-payload'],
          userEntitlements: ['fake-user-entitlements-payload'],
        });
      });
    });
  });
});
