import moduleName from './index';

describe('Component: assignableAdvancedMeetings:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      'LicenseUsageUtilService',
    );
  });

  // TODO: use as-appropriate
  beforeEach(function () {
    // this.compileTemplate('<assignable-advanced-meetings><assignable-advanced-meetings>');
    // this.compileComponent('assignableAdvancedMeetings', { ... });
  });

  describe('primary behaviors (view):', () => {
    it('should render nothing if there is not at least 1 license with the right "offerName"', function () {
      this.compileComponent('assignableAdvancedMeetings');
      expect(this.view.find('.advanced-meetings').length).toBe(0);
    });

    it('should render "assignable-service-item-checkbox" instances for valid advanced meetings', function () {
      this.$scope.licenses = [{
        licenseId: 'fake-license-id-1',
        siteUrl: 'fake-site-url-1',
        offerName: 'EC',
      }];
      this.$scope.siteUrls = [
        'fake-site-url-1',
      ];
      this.compileComponent('assignableAdvancedMeetings', {
        licenses: 'licenses',
        siteUrls: 'siteUrls',
      });
      expect(this.view.find('.advanced-meetings').length).toBe(1);
      expect(this.view.find('.license__category[translate="firstTimeWizard.advancedMeetings"]').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox[l10n-label="subscriptions.licenseTypes.EC"]').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox advanced-meeting-license-description').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox usage-line').length).toBe(1);

      this.$scope.licenses = [{
        licenseId: 'fake-license-id-1',
        siteUrl: 'fake-site-url-1',
        offerName: 'EC',
      }, {
        licenseId: 'fake-license-id-2',
        siteUrl: 'fake-site-url-1',
        offerName: 'EE',
      }, {
        licenseId: 'fake-license-id-3',
        siteUrl: 'fake-site-url-1',
        offerName: 'MC',
      }, {
        licenseId: 'fake-license-id-4',
        siteUrl: 'fake-site-url-1',
        offerName: 'TC',
      }];
      this.$scope.siteUrls = [
        'fake-site-url-1',
      ];
      this.compileComponent('assignableAdvancedMeetings', {
        licenses: 'licenses',
        siteUrls: 'siteUrls',
      });
      expect(this.view.find('assignable-service-item-checkbox[l10n-label="subscriptions.licenseTypes.EC"]').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox[l10n-label="subscriptions.licenseTypes.EE"]').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox[l10n-label="subscriptions.licenseTypes.MC"]').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox[l10n-label="subscriptions.licenseTypes.TC"]').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox advanced-meeting-license-description').length).toBe(4);
      expect(this.view.find('assignable-service-item-checkbox usage-line').length).toBe(4);
    });

    it('should render an "assignable-service-item-checkbox" of "CMR"-type as a nested sibling if either a "EE"-type or "MC"-type is present', function () {
      this.$scope.licenses = [{
        licenseId: 'fake-license-id-2',
        siteUrl: 'fake-site-url-1',
        offerName: 'EE',
      }, {
        licenseId: 'fake-license-id-5',
        siteUrl: 'fake-site-url-1',
        offerName: 'CMR',
      }];
      this.$scope.siteUrls = [
        'fake-site-url-1',
      ];
      this.compileComponent('assignableAdvancedMeetings', {
        licenses: 'licenses',
        siteUrls: 'siteUrls',
      });
      expect(this.view.find('assignable-service-item-checkbox[l10n-label$=".EE"]').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox[l10n-label$=".EE"] + div[ng-if] assignable-service-item-checkbox[l10n-label$=".CMR"]').length).toBe(1);

      this.$scope.licenses = [{
        licenseId: 'fake-license-id-3',
        siteUrl: 'fake-site-url-1',
        offerName: 'MC',
      }, {
        licenseId: 'fake-license-id-5',
        siteUrl: 'fake-site-url-1',
        offerName: 'CMR',
      }];
      this.compileComponent('assignableAdvancedMeetings', {
        licenses: 'licenses',
        siteUrls: 'siteUrls',
      });
      expect(this.view.find('assignable-service-item-checkbox[l10n-label$=".MC"]').length).toBe(1);
      expect(this.view.find('assignable-service-item-checkbox[l10n-label$=".MC"] + div[ng-if] assignable-service-item-checkbox[l10n-label$=".CMR"]').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {

    describe('hasAdvancedMeetings():', () => {
      it('should return true if at least 1 license is present in binding', function () {
        this.$scope.licenses = [];
        this.compileComponent('assignableAdvancedMeetings', {
          licenses: 'licenses',
        });
        expect(this.controller.hasAdvancedMeetings()).toBe(false);

        this.$scope.licenses = [{
          licenseId: 'fake-license-id-1',
          siteUrl: 'fake-site-url-1',
          offerName: 'EC',
        }];
        this.compileComponent('assignableAdvancedMeetings', {
          licenses: 'licenses',
        });
        expect(this.controller.hasAdvancedMeetings()).toBe(true);
      });
    });

    it('should pass through its calls to respective LicenseUsageUtilService methods', function () {
      spyOn(this.LicenseUsageUtilService, 'findLicense');
      spyOn(this.LicenseUsageUtilService, 'getTotalLicenseUsage');
      spyOn(this.LicenseUsageUtilService, 'getTotalLicenseVolume');
      spyOn(this.LicenseUsageUtilService, 'isSharedMeetingsLicense');
      this.$scope.licenses = [{
        licenseId: 'fake-license-id-1',
        siteUrl: 'fake-site-url-1',
        offerName: 'EC',
      }];
      this.$scope.siteUrls = [
        'fake-site-url-1',
      ];
      this.compileComponent('assignableAdvancedMeetings', {
        licenses: 'licenses',
        siteUrls: 'siteUrls',
      });

      this.controller.findLicense({ foo: 'bar' });
      expect(this.LicenseUsageUtilService.findLicense).toHaveBeenCalledWith({ foo: 'bar' }, this.controller.licenses);

      this.controller.getTotalLicenseUsage('foo');
      expect(this.LicenseUsageUtilService.getTotalLicenseUsage).toHaveBeenCalledWith('foo', this.controller.licenses);

      this.controller.getTotalLicenseVolume('foo');
      expect(this.LicenseUsageUtilService.getTotalLicenseVolume).toHaveBeenCalledWith('foo', this.controller.licenses);

      this.controller.isSharedMeetingsLicense({ foo: 'bar' });
      expect(this.LicenseUsageUtilService.isSharedMeetingsLicense).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });
});
