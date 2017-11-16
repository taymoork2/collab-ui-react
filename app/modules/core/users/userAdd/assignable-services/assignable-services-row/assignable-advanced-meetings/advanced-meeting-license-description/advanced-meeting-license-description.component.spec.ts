import moduleName from './index';

describe('Component: advancedMeetingLicenseDescription:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      '$translate',
    );
  });

  describe('primary behaviors (view):', () => {
    it('should render a description and a tooltip', function () {
      this.compileComponent('advancedMeetingLicenseDescription');
      expect(this.view.find('.license__description').length).toBe(1);
      expect(this.view.find('.license__description-tooltip').length).toBe(1);
      expect(this.view.find('.license__description-tooltip .icon.icon-info').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should set "l10nLicenseDescription" and "l10nLicenseDescriptionTooltip" properties according to "isCloudSharedMeeting" binding', function () {
      spyOn(this.$translate, 'instant').and.callThrough();
      this.$scope.isCloudSharedMeeting = true;
      this.compileComponent('advancedMeetingLicenseDescription', {
        isCloudSharedMeeting: 'isCloudSharedMeeting',
      });
      expect(this.controller.l10nLicenseDescription).toBe('firstTimeWizard.sharedLicense');
      expect(this.$translate.instant).toHaveBeenCalledWith('firstTimeWizard.sharedLicense');
      expect(this.controller.l10nLicenseDescriptionTooltip).toBe('firstTimeWizard.sharedLicenseTooltip');
      expect(this.$translate.instant).toHaveBeenCalledWith('firstTimeWizard.sharedLicenseTooltip');

      this.$scope.isCloudSharedMeeting = false;
      this.compileComponent('advancedMeetingLicenseDescription', {
        isCloudSharedMeeting: 'isCloudSharedMeeting',
      });
      expect(this.controller.l10nLicenseDescription).toBe('firstTimeWizard.namedLicense');
      expect(this.$translate.instant).toHaveBeenCalledWith('firstTimeWizard.namedLicense');
      expect(this.controller.l10nLicenseDescriptionTooltip).toBe('firstTimeWizard.namedLicenseTooltip');
      expect(this.$translate.instant).toHaveBeenCalledWith('firstTimeWizard.namedLicenseTooltip');
    });
  });
});
