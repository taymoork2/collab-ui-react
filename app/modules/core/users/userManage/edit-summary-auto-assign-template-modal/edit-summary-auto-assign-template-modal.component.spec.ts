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
});
