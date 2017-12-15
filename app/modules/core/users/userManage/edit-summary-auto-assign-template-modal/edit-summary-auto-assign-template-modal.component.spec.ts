import moduleName from './index';

describe('Component: editSummaryAutoAssignTemplateModal:', () => {
  beforeEach(function() {
    this.licenseSummary = this.spyOnComponent('licenseSummary');
    this.initModules(
      moduleName,
      this.licenseSummary,
    );
    this.injectDependencies(
      '$scope',
      '$state',
      'Analytics',
      'AutoAssignTemplateService',
      'Notification',
    );
    this.$scope.dismiss = _.noop;
  });

  describe('primary behaviors (view):', () => {
    it('should track the event when the modal is dismissed', function () {
      spyOn(this.Analytics, 'trackAddUsers');
      this.compileComponent('editSummaryAutoAssignTemplateModal', {
        dismiss: 'dismiss',
      });
      this.view.find('button.close[aria-label="common.close"]').click();
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
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
      this.compileComponent('editSummaryAutoAssignTemplateModal', {
        dismiss: 'dismiss',
      });
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
