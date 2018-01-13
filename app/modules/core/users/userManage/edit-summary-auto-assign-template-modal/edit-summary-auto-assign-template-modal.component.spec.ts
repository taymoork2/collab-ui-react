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

  describe('clicking save:', () => {
    beforeEach(function() {
      this.stateData = {
        items: {
          'fake-license-id-1': {},
          'fake-license-id-2': {},
          'fake-license-id-3': {},
        },
      };
      spyOn(this.AutoAssignTemplateService, 'createTemplate').and.returnValue(this.$q.resolve({}));
      spyOn(this.AutoAssignTemplateService, 'updateTemplate').and.returnValue(this.$q.resolve({}));
    });

    it('should call saveTemplate if isEditTemplateMode is false', function () {
      this.compileComponent('editSummaryAutoAssignTemplateModal', {
        dismiss: 'dismiss',
        stateData: this.stateData,
        isEditTemplateMode: false,
      });
      this.view.find('button.btn.save').click();
      expect(this.AutoAssignTemplateService.createTemplate).toHaveBeenCalled();
    });

    it('should call updateTemplate if isEditTemplateMode is true', function () {
      this.compileComponent('editSummaryAutoAssignTemplateModal', {
        dismiss: 'dismiss',
        stateData: this.stateData,
        isEditTemplateMode: true,
      });
      this.view.find('button.btn.save').click();
      expect(this.AutoAssignTemplateService.updateTemplate).toHaveBeenCalled();
    });
  });
});
