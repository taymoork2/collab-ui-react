import moduleName from './index';

describe('Component: licenseSummary:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      'LicenseUsageUtilService',
    );
  });

  describe('primary behaviors (view):', () => {
    it('should render an empty table if there is not at least 1 license with the right "offerName"', function () {
      this.$scope.fakeStateData = {};
      this.compileComponent('licenseSummary', {
        stateData: 'fakeStateData',
      });
      expect(this.view.find('.license-summary').length).toBe(1);
    });

    it('should render a license-summary-item in the message row if a license has a MS offer name', function () {
      this.$scope.fakeStateData = {
        LICENSE: {
          MS_4f4253ad: {
            isSelected: true,
            license: {
              offerName: 'MS',
            },
          },
        },
      };

      this.compileComponent('licenseSummary', {
        stateData: 'fakeStateData',
      });

      expect(this.view.find('.license-summary').length).toBe(1);
      expect(this.view.find('license-summary-item[l10n-title="onboardModal.paidCiscoSparkMessaging"]').length).toBe(1);
    });

    it('should render a license-summary-item in the meeting row if a license has a CF offer name', function () {
      this.$scope.fakeStateData = {
        LICENSE: {
          CF_4f4253ad: {
            isSelected: true,
            license: {
              offerName: 'CF',
            },
          },
        },
      };

      this.compileComponent('licenseSummary', {
        stateData: 'fakeStateData',
      });

      expect(this.view.find('.license-summary').length).toBe(1);
      expect(this.view.find('license-summary-item[l10n-title="firstTimeWizard.meetingsInSpark"]').length).toBe(1);
    });

    it('should render a license-summary-item in the meeting row if a license has a CO offer name', function () {
      this.$scope.fakeStateData = {
        LICENSE: {
          CF_4f4253ad: {
            isSelected: true,
            license: {
              offerName: 'CO',
            },
          },
        },
      };

      this.compileComponent('licenseSummary', {
        stateData: 'fakeStateData',
      });

      expect(this.view.find('.license-summary').length).toBe(1);
      expect(this.view.find('license-summary-item[l10n-title="onboardModal.paidSparkCall"]').length).toBe(1);
    });

    it('should render a license-summary-item in the meeting row if a license has a CDC offer name', function () {
      this.$scope.fakeStateData = {
        LICENSE: {
          CF_4f4253ad: {
            isSelected: true,
            license: {
              offerName: 'CDC',
            },
          },
        },
      };

      this.compileComponent('licenseSummary', {
        stateData: 'fakeStateData',
      });

      expect(this.view.find('.license-summary').length).toBe(1);
      expect(this.view.find('license-summary-item[l10n-title="onboardModal.paidCDC"]').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should pass through its calls to respective LicenseUsageUtilService methods', function () {
      this.$scope.fakeStateData = {
        LICENSE: {
          CF_4f4253ad: {
            isSelected: true,
            license: {
              offerName: 'CF',
              usage: 3,
              volume: 500,
            },
          },
        },
      };
      spyOn(this.LicenseUsageUtilService, 'getTotalLicenseUsage');
      spyOn(this.LicenseUsageUtilService, 'getTotalLicenseVolume');
      this.compileComponent('licenseSummary', {
        stateData: 'fakeStateData',
      });

      this.controller.getTotalLicenseUsage('CF');
      expect(this.LicenseUsageUtilService.getTotalLicenseUsage).toHaveBeenCalled();

      this.controller.getTotalLicenseVolume('CF');
      expect(this.LicenseUsageUtilService.getTotalLicenseVolume).toHaveBeenCalled();
    });

    it('should find the appropriate hybrid service user entitlements', function () {
      this.$scope.fakeStateData = [{
        USER_ENTITLEMENTS_PAYLOAD: {
          entitlementName: 'squaredFusionCal',
        },
      }];
      this.compileComponent('licenseSummary', {
        stateData: 'fakeStateData',
      });
      spyOn(this.controller, 'getHybridUserEntitlements').and.returnValue(this.$scope.fakeStateData.USER_ENTITLEMENTS_PAYLOAD);

      expect(this.controller.findHybridUserEntitlement('squaredFusionCal')).toEqual(this.$scope.fakeStateData.USER_ENTITLEMENTS_PAYLOAD);
    });
  });
});
