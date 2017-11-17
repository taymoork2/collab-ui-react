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

    it('should render an "assignable-service-item-checkbox" of "CMR"-type as nested', function () {
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
      expect(this.view.find('assignable-service-item-checkbox[l10n-label$=".CMR"]')).toHaveClass('cs-input--nested-1');
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should sort its licenses from bindings at initialization', function () {
      this.$scope.licenses = [{
        licenseId: 'fake-license-id-1',
        offerName: 'MC',
        siteUrl: 'fake-site-url-1',
      }, {
        licenseId: 'fake-license-id-2',
        offerName: 'TC',
        siteUrl: 'fake-site-url-1',
      }, {
        licenseId: 'fake-license-id-3',
        offerName: 'EC',
        siteUrl: 'fake-site-url-1',
      }, {
        licenseId: 'fake-license-id-4',
        offerName: 'EE',
        siteUrl: 'fake-site-url-1',
      }, {
        licenseId: 'fake-license-id-5',
        offerName: 'CMR',
        siteUrl: 'fake-site-url-1',
      }];
      this.$scope.siteUrls = [
        'fake-site-url-1',
      ];
      this.compileComponent('assignableAdvancedMeetings', {
        licenses: 'licenses',
        siteUrls: 'siteUrls',
      });
      expect(this.controller.licenses.length).toBe(5);
      expect(_.get(this.controller.licenses, '[0].offerName')).toBe('EC');
      expect(_.get(this.controller.licenses, '[1].offerName')).toBe('EE');
      expect(_.get(this.controller.licenses, '[2].offerName')).toBe('CMR');
      expect(_.get(this.controller.licenses, '[3].offerName')).toBe('MC');
      expect(_.get(this.controller.licenses, '[4].offerName')).toBe('TC');
    });

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

    describe('sortLicenses():', () => {
      it('should sort licenses according to their ordinal position as defined by "ORDERED_OFFER_NAMES"', function () {
        let licenses = [{
          licenseId: 'fake-license-id-1',
          offerName: 'MC',
        }, {
          licenseId: 'fake-license-id-2',
          offerName: 'TC',
        }, {
          licenseId: 'fake-license-id-3',
          offerName: 'EC',
        }, {
          licenseId: 'fake-license-id-4',
          offerName: 'EE',
        }, {
          licenseId: 'fake-license-id-5',
          offerName: 'CMR',
        }];
        this.compileComponent('assignableAdvancedMeetings');
        licenses = this.controller.sortLicenses(licenses);
        expect(_.get(licenses, '[0].offerName')).toBe('CMR');
        expect(_.get(licenses, '[1].offerName')).toBe('EC');
        expect(_.get(licenses, '[2].offerName')).toBe('EE');
        expect(_.get(licenses, '[3].offerName')).toBe('MC');
        expect(_.get(licenses, '[4].offerName')).toBe('TC');
      });
    });

    describe('removeCmrLicenses():', () => {
      it('...', function () {
        const licenses = [{
          licenseId: 'fake-license-id-1',
          offerName: 'MC',
        }, {
          licenseId: 'fake-license-id-2',
          offerName: 'CMR',
        }, {
          licenseId: 'fake-license-id-3',
          offerName: 'CMR',
        }];
        this.compileComponent('assignableAdvancedMeetings');
        const removedLicenses = this.controller.removeCmrLicenses(licenses);
        expect(licenses.length).toBe(1);
        expect(_.get(licenses, '[0].offerName')).toBe('MC');
        expect(removedLicenses.length).toBe(2);
        expect(_.get(removedLicenses, '[0].offerName')).toBe('CMR');
        expect(_.get(removedLicenses, '[1].offerName')).toBe('CMR');
      });
    });

    describe('reinsertCmrLicenses():', () => {
      beforeEach(function () {
        this.compileComponent('assignableAdvancedMeetings');
        this.fakeCmrLicenses = [{
          licenseId: 'fake-license-id-2',
          offerName: 'CMR',
          siteUrl: 'fake-site-url-1',
        }];
      });

      it('should insert license with "CMR" after license with "MC"', function () {
        const licenses = [{
          licenseId: 'fake-license-id-1',
          offerName: 'MC',
          siteUrl: 'fake-site-url-1'
        }];
        this.controller.reinsertCmrLicenses(this.fakeCmrLicenses, licenses);
        expect(licenses.length).toBe(2);
        expect(_.get(licenses, '[0].offerName')).toBe('MC');
        expect(_.get(licenses, '[1].offerName')).toBe('CMR');
      });

      it('should insert license with "CMR" after license with "EE"', function () {
        const licenses = [{
          licenseId: 'fake-license-id-3',
          offerName: 'EE',
          siteUrl: 'fake-site-url-1'
        }]
        this.controller.reinsertCmrLicenses(this.fakeCmrLicenses, licenses);
        expect(licenses.length).toBe(2);
        expect(_.get(licenses, '[0].offerName')).toBe('EE');
        expect(_.get(licenses, '[1].offerName')).toBe('CMR');
      });

      it('should not insert license with "CMR" if neither "MC" or "EE" are present', function () {
        // 'CMR' will NOT insert if neither are present
        const licenses = [{
          licenseId: 'fake-license-id-4',
          offerName: 'TC',
          siteUrl: 'fake-site-url-1'
        }]
        this.controller.reinsertCmrLicenses(this.fakeCmrLicenses, licenses);
        expect(licenses.length).toBe(1);
        expect(_.get(licenses, '[0].offerName')).toBe('TC');
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
