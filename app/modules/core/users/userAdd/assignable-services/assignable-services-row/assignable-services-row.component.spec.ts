import moduleName from './index';

describe('Component: assignableServicesRow:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      'LicenseUsageUtilService'
    );
    this.$scope.fakeSubscription = {
      subscriptionId: 'fake-subscriptionId-1',
    };
  });

  describe('primary behaviors (view):', () => {
    it('should render with a subscription id', function () {
      this.compileComponent('assignableServicesRow', {
        subscription: 'fakeSubscription',
      });
      expect(this.view.find('.subscription__header').length).toBe(1);
      expect(this.view.find('.subscription__header')).toContainText('fake-subscriptionId-1');
    });

    it('should have a viewable content area toggled by an icon', function () {
      this.compileComponent('assignableServicesRow', {
        subscription: 'fakeSubscription',
      });
      expect(this.view.find('.subscription__header .icon.toggle').length).toBe(1);
      expect(this.view.find('.subscription__header .icon.toggle')).toHaveClass('icon-chevron-up');
      expect(this.view.find('.subscription__content')).not.toHaveClass('ng-hide');
      this.view.find('.subscription__header .icon.toggle').click();
      expect(this.view.find('.subscription__header .icon.toggle')).toHaveClass('icon-chevron-down');
      expect(this.view.find('.subscription__content')).toHaveClass('ng-hide');
    });

    it('should have at least 3 columns (4 if "isCareEnabled" is true)', function () {
      this.compileComponent('assignableServicesRow', {
        subscription: 'fakeSubscription',
      });
      expect(this.view.find('.subscription__content .column-paid').length).toBe(3);

      this.$scope.isCareEnabled = true;
      this.compileComponent('assignableServicesRow', {
        subscription: 'fakeSubscription',
        isCareEnabled: 'isCareEnabled',
      });
      expect(this.view.find('.subscription__content .column-paid').length).toBe(4);
    });
  });

  describe('primary behaviors (controller):', () => {
    beforeEach(function () {
      this.$scope.fakeSubscriptionWithLicenses = {
        subscriptionId: 'fake-subscriptionId-2',
        licenses: [{
          licenseId: 'fake-licenseId-1',
          offerName: 'MS',
        }, {
          licenseId: 'fake-licenseId-2',
          offerName: 'CF',
        }, {
          licenseId: 'fake-licenseId-3',
          offerName: 'MC',
          siteUrl: 'fake-site-1',
        }, {
          licenseId: 'fake-licenseId-4',
          offerName: 'CMR',
          siteUrl: 'fake-site-1',
        }],
      };
    });

    it('should initialize properties as appropriate', function () {
      this.compileComponent('assignableServicesRow', {
        subscription: 'fakeSubscriptionWithLicenses',
      });
      expect(this.controller.licenses.length).toBe(4);
      expect(this.controller.basicMeetingLicenses.length).toBe(1);  // ['CF']
      expect(this.controller.advancedMeetingLicenses.length).toBe(2);  // ['MC', 'CMR']
      expect(this.controller.advancedMeetingSiteUrls.length).toBe(1);  // ['fake-site-1']
    });

    it('should pass through its calls to respective LicenseUsageUtilService methods', function () {
      spyOn(this.LicenseUsageUtilService, 'getBasicMeetingLicenses');
      spyOn(this.LicenseUsageUtilService, 'getAdvancedMeetingLicenses');
      spyOn(this.LicenseUsageUtilService, 'getAdvancedMeetingSiteUrls');
      spyOn(this.LicenseUsageUtilService, 'filterLicenses');
      spyOn(this.LicenseUsageUtilService, 'hasLicensesWith');
      spyOn(this.LicenseUsageUtilService, 'hasLicenseWithAnyOfferName');
      spyOn(this.LicenseUsageUtilService, 'getTotalLicenseUsage');
      spyOn(this.LicenseUsageUtilService, 'getTotalLicenseVolume');
      this.compileComponent('assignableServicesRow', {
        subscription: 'fakeSubscriptionWithLicenses',
      });

      this.controller.getBasicMeetingLicenses();
      expect(this.LicenseUsageUtilService.getBasicMeetingLicenses).toHaveBeenCalledWith(this.controller.licenses);

      this.controller.getAdvancedMeetingLicenses();
      expect(this.LicenseUsageUtilService.getAdvancedMeetingLicenses).toHaveBeenCalledWith(this.controller.licenses);

      this.controller.getAdvancedMeetingSiteUrls();
      expect(this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls).toHaveBeenCalledWith(this.controller.licenses);

      this.controller.getLicenses({ foo: 'bar' });
      expect(this.LicenseUsageUtilService.filterLicenses).toHaveBeenCalledWith({ foo: 'bar' }, this.controller.licenses);

      this.controller.hasLicensesWith({ foo: 'bar' });
      expect(this.LicenseUsageUtilService.hasLicensesWith).toHaveBeenCalledWith({ foo: 'bar' }, this.controller.licenses);

      this.controller.hasLicenseWithAnyOfferName('foo');
      expect(this.LicenseUsageUtilService.hasLicenseWithAnyOfferName).toHaveBeenCalledWith('foo', this.controller.licenses);

      this.controller.getTotalLicenseUsage('foo');
      expect(this.LicenseUsageUtilService.getTotalLicenseUsage).toHaveBeenCalledWith('foo', this.controller.licenses);

      this.controller.getTotalLicenseVolume('foo');
      expect(this.LicenseUsageUtilService.getTotalLicenseVolume).toHaveBeenCalledWith('foo', this.controller.licenses);
    });
  });
});
