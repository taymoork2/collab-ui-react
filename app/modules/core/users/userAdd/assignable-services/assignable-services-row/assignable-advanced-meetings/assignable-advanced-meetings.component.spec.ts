import moduleName from './index';

import { OfferName } from 'modules/core/shared';
import { AssignableServicesItemCategory } from 'modules/core/users/userAdd/assignable-services/shared';

describe('Component: assignableAdvancedMeetings:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      'LicenseUsageUtilService',
    );
  });

  describe('primary behaviors (view):', () => {
    it('should render nothing if there is not at least 1 license with the right "offerName"', function () {
      this.compileComponent('assignableAdvancedMeetings');
      expect(this.view.find('.advanced-meetings').length).toBe(0);
    });

    it('should render "assignable-license-checkbox" instances for valid advanced meetings', function () {
      this.$scope.licenses = [{
        licenseId: 'fake-license-id-1',
        siteUrl: 'fake-site-url-1',
        offerName: OfferName.EC,
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
      expect(this.view.find('assignable-license-checkbox[l10n-label="subscriptions.licenseTypes.EC"]').length).toBe(1);
      expect(this.view.find('assignable-license-checkbox advanced-meeting-license-description').length).toBe(1);
      expect(this.view.find('assignable-license-checkbox usage-line').length).toBe(1);
      expect(this.view.find('assignable-license-checkbox[auto-assign-template-data]').length).toBe(1);
      expect(this.view.find('assignable-license-checkbox[on-update]').length).toBe(1);

      this.$scope.licenses = [{
        licenseId: 'fake-license-id-1',
        siteUrl: 'fake-site-url-1',
        offerName: OfferName.EC,
      }, {
        licenseId: 'fake-license-id-2',
        siteUrl: 'fake-site-url-1',
        offerName: OfferName.EE,
      }, {
        licenseId: 'fake-license-id-3',
        siteUrl: 'fake-site-url-1',
        offerName: OfferName.MC,
      }, {
        licenseId: 'fake-license-id-4',
        siteUrl: 'fake-site-url-1',
        offerName: OfferName.TC,
      }];
      this.$scope.siteUrls = [
        'fake-site-url-1',
      ];
      this.compileComponent('assignableAdvancedMeetings', {
        licenses: 'licenses',
        siteUrls: 'siteUrls',
      });
      expect(this.view.find('assignable-license-checkbox[l10n-label="subscriptions.licenseTypes.EC"]').length).toBe(1);
      expect(this.view.find('assignable-license-checkbox[l10n-label="subscriptions.licenseTypes.EE"]').length).toBe(1);
      expect(this.view.find('assignable-license-checkbox[l10n-label="subscriptions.licenseTypes.MC"]').length).toBe(1);
      expect(this.view.find('assignable-license-checkbox[l10n-label="subscriptions.licenseTypes.TC"]').length).toBe(1);
      expect(this.view.find('assignable-license-checkbox advanced-meeting-license-description').length).toBe(4);
      expect(this.view.find('assignable-license-checkbox usage-line').length).toBe(4);
    });

    it('should render an "assignable-license-checkbox" of "CMR"-type as nested', function () {
      this.$scope.licenses = [{
        licenseId: 'fake-license-id-2',
        siteUrl: 'fake-site-url-1',
        offerName: OfferName.EE,
      }, {
        licenseId: 'fake-license-id-5',
        siteUrl: 'fake-site-url-1',
        offerName: OfferName.CMR,
      }];
      this.$scope.siteUrls = [
        'fake-site-url-1',
      ];
      this.compileComponent('assignableAdvancedMeetings', {
        licenses: 'licenses',
        siteUrls: 'siteUrls',
      });
      expect(this.view.find('assignable-license-checkbox[l10n-label$=".CMR"]')).toHaveClass('cs-input--nested-1');
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should sort its licenses from bindings at initialization', function () {
      this.$scope.licenses = [{
        licenseId: 'fake-license-id-1',
        offerName: OfferName.MC,
        siteUrl: 'fake-site-url-1',
      }, {
        licenseId: 'fake-license-id-2',
        offerName: OfferName.TC,
        siteUrl: 'fake-site-url-1',
      }, {
        licenseId: 'fake-license-id-3',
        offerName: OfferName.EC,
        siteUrl: 'fake-site-url-1',
      }, {
        licenseId: 'fake-license-id-4',
        offerName: OfferName.EE,
        siteUrl: 'fake-site-url-1',
      }, {
        licenseId: 'fake-license-id-5',
        offerName: OfferName.CMR,
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
      expect(_.get(this.controller.licenses, '[0].offerName')).toBe(OfferName.EC);
      expect(_.get(this.controller.licenses, '[1].offerName')).toBe(OfferName.EE);
      expect(_.get(this.controller.licenses, '[2].offerName')).toBe(OfferName.CMR);
      expect(_.get(this.controller.licenses, '[3].offerName')).toBe(OfferName.MC);
      expect(_.get(this.controller.licenses, '[4].offerName')).toBe(OfferName.TC);
    });

    describe('sortLicenses():', () => {
      it('should sort licenses according to their ordinal position as defined by "ORDERED_OFFER_NAMES"', function () {
        let licenses = [{
          licenseId: 'fake-license-id-1',
          offerName: OfferName.MC,
        }, {
          licenseId: 'fake-license-id-2',
          offerName: OfferName.TC,
        }, {
          licenseId: 'fake-license-id-3',
          offerName: OfferName.EC,
        }, {
          licenseId: 'fake-license-id-4',
          offerName: OfferName.EE,
        }, {
          licenseId: 'fake-license-id-5',
          offerName: OfferName.CMR,
        }];
        this.compileComponent('assignableAdvancedMeetings');
        licenses = this.controller.sortLicenses(licenses);
        expect(_.get(licenses, '[0].offerName')).toBe(OfferName.CMR);
        expect(_.get(licenses, '[1].offerName')).toBe(OfferName.EC);
        expect(_.get(licenses, '[2].offerName')).toBe(OfferName.EE);
        expect(_.get(licenses, '[3].offerName')).toBe(OfferName.MC);
        expect(_.get(licenses, '[4].offerName')).toBe(OfferName.TC);
      });
    });

    describe('removeCmrLicenses():', () => {
      it('should remove licenses with "CMR"', function () {
        const licenses = [{
          licenseId: 'fake-license-id-1',
          offerName: OfferName.MC,
        }, {
          licenseId: 'fake-license-id-2',
          offerName: OfferName.CMR,
        }, {
          licenseId: 'fake-license-id-3',
          offerName: OfferName.CMR,
        }];
        this.compileComponent('assignableAdvancedMeetings');
        const removedLicenses = this.controller.removeCmrLicenses(licenses);
        expect(licenses.length).toBe(1);
        expect(_.get(licenses, '[0].offerName')).toBe(OfferName.MC);
        expect(removedLicenses.length).toBe(2);
        expect(_.get(removedLicenses, '[0].offerName')).toBe(OfferName.CMR);
        expect(_.get(removedLicenses, '[1].offerName')).toBe(OfferName.CMR);
      });
    });

    describe('reinsertCmrLicenses():', () => {
      beforeEach(function () {
        this.compileComponent('assignableAdvancedMeetings');
        this.fakeCmrLicenses = [{
          licenseId: 'fake-license-id-2',
          offerName: OfferName.CMR,
          siteUrl: 'fake-site-url-1',
        }];
      });

      it('should insert license with "CMR" after license with "MC"', function () {
        const licenses = [{
          licenseId: 'fake-license-id-1',
          offerName: OfferName.MC,
          siteUrl: 'fake-site-url-1',
        }];
        this.controller.reinsertCmrLicenses(this.fakeCmrLicenses, licenses);
        expect(licenses.length).toBe(2);
        expect(_.get(licenses, '[0].offerName')).toBe(OfferName.MC);
        expect(_.get(licenses, '[1].offerName')).toBe(OfferName.CMR);
      });

      it('should insert license with "CMR" after license with "EE"', function () {
        const licenses = [{
          licenseId: 'fake-license-id-3',
          offerName: OfferName.EE,
          siteUrl: 'fake-site-url-1',
        }];
        this.controller.reinsertCmrLicenses(this.fakeCmrLicenses, licenses);
        expect(licenses.length).toBe(2);
        expect(_.get(licenses, '[0].offerName')).toBe(OfferName.EE);
        expect(_.get(licenses, '[1].offerName')).toBe(OfferName.CMR);
      });

      it('should not insert license with "CMR" if neither "MC" or "EE" are present', function () {
        // OfferName.CMR will NOT insert if neither are present
        const licenses = [{
          licenseId: 'fake-license-id-4',
          offerName: OfferName.TC,
          siteUrl: 'fake-site-url-1',
        }];
        this.controller.reinsertCmrLicenses(this.fakeCmrLicenses, licenses);
        expect(licenses.length).toBe(1);
        expect(_.get(licenses, '[0].offerName')).toBe(OfferName.TC);
      });
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
          offerName: OfferName.EC,
        }];
        this.compileComponent('assignableAdvancedMeetings', {
          licenses: 'licenses',
        });
        expect(this.controller.hasAdvancedMeetings()).toBe(true);
      });
    });

    describe('getTotalLicenseUsage():', () => {
      it('should return the value of the "usage" property, or 0 if falsey', function () {
        this.compileComponent('assignableAdvancedMeetings');
        expect(this.controller.getTotalLicenseUsage({ usage: 3 })).toBe(3);
        expect(this.controller.getTotalLicenseUsage({ usage: undefined })).toBe(0);
        expect(this.controller.getTotalLicenseUsage({})).toBe(0);
      });
    });

    describe('getTotalLicenseVolume():', () => {
      it('should return the value of the "volume" property, or 0 if falsey', function () {
        this.compileComponent('assignableAdvancedMeetings');
        expect(this.controller.getTotalLicenseVolume({ volume: 3 })).toBe(3);
        expect(this.controller.getTotalLicenseVolume({ volume: undefined })).toBe(0);
        expect(this.controller.getTotalLicenseVolume({})).toBe(0);
      });
    });

    describe('isSharedMeetingsLicense():', () => {
      it('should pass through its call to respective LicenseUsageUtilService methods', function () {
        spyOn(this.LicenseUsageUtilService, 'isSharedMeetingsLicense');
        this.compileComponent('assignableAdvancedMeetings');
        this.controller.isSharedMeetingsLicense({ foo: 'bar' });
        expect(this.LicenseUsageUtilService.isSharedMeetingsLicense).toHaveBeenCalledWith({ foo: 'bar' });
      });
    });

    describe('getBuddyLicenseFor():', () => {
      it('should return a buddy license, given a license with "EE", "MC", or "CMR"', function () {
        this.$scope.licenses = [{
          licenseId: 'fake-license-id-1',
          siteUrl: 'fake-site-url-1',
          offerName: OfferName.EE,
        }, {
          licenseId: 'fake-license-id-2',
          siteUrl: 'fake-site-url-1',
          offerName: OfferName.CMR,
        }];
        this.$scope.siteUrls = [
          'fake-site-url-1',
        ];
        this.compileComponent('assignableAdvancedMeetings', {
          licenses: 'licenses',
          siteUrls: 'siteUrls',
        });

        const fakeLicense = {
          offerName: 'foo',
          siteUrl: 'fake-site-url-1',
        };

        // 'EE' has a buddy 'CMR' license
        fakeLicense.offerName = OfferName.EE;
        let result = this.controller.getBuddyLicenseFor(fakeLicense);
        expect(result).toBe(this.$scope.licenses[1]);

        // 'MC' has a buddy 'CMR' license
        fakeLicense.offerName = OfferName.MC;
        this.$scope.licenses[0].offerName = OfferName.MC;
        result = this.controller.getBuddyLicenseFor(fakeLicense);
        expect(result).toBe(this.$scope.licenses[1]);

        // 'CMR' has a buddy 'MC' license
        fakeLicense.offerName = OfferName.CMR;
        result = this.controller.getBuddyLicenseFor(fakeLicense);
        expect(result).toBe(this.$scope.licenses[0]);

        // 'CMR' has a buddy 'EE' license
        this.$scope.licenses[0].offerName = OfferName.EE;
        result = this.controller.getBuddyLicenseFor(fakeLicense);
        expect(result).toBe(this.$scope.licenses[0]);
      });

      it('should return undefined buddy not found, or given license is not "EE", "MC", or "CMR"', function () {
        this.$scope.licenses = [{
          licenseId: 'fake-license-id-1',
          siteUrl: 'fake-site-url-1',
          offerName: OfferName.EE,
        }, {
          licenseId: 'fake-license-id-2',
          siteUrl: 'fake-site-url-1',
          offerName: OfferName.CMR,
        }];
        this.$scope.siteUrls = [
          'fake-site-url-1',
        ];
        this.compileComponent('assignableAdvancedMeetings', {
          licenses: 'licenses',
          siteUrls: 'siteUrls',
        });

        const fakeLicense = {
          offerName: 'foo',
          siteUrl: 'fake-site-url-1',
        };

        // 'offerName' invalid
        expect(this.controller.getBuddyLicenseFor(fakeLicense)).toBe(undefined);

        // 'siteUrl' invalid
        fakeLicense.offerName = OfferName.EE;
        fakeLicense.siteUrl = 'foo';
        expect(this.controller.getBuddyLicenseFor(fakeLicense)).toBe(undefined);

        // no buddy license found
        this.$scope.licenses.pop();
        fakeLicense.offerName = OfferName.EE;
        this.$scope.licenses[0].offerName = OfferName.EE;
        expect(this.controller.getBuddyLicenseFor(fakeLicense)).toBe(undefined);

        fakeLicense.offerName = OfferName.MC;
        this.$scope.licenses[0].offerName = OfferName.MC;
        expect(this.controller.getBuddyLicenseFor(fakeLicense)).toBe(undefined);

        fakeLicense.offerName = OfferName.CMR;
        this.$scope.licenses[0].offerName = OfferName.CMR;
        expect(this.controller.getBuddyLicenseFor(fakeLicense)).toBe(undefined);
      });
    });

    describe('isBuddyLicense():', () => {
      it('should return true if given licenses meet the criteria as buddies, false otherwise', function () {
        this.compileComponent('assignableAdvancedMeetings');
        const fakeLicense1 = {
          offerName: 'foo',
          siteUrl: 'fake-siteUrl-1',
        };
        const fakeLicense2 = {
          offerName: OfferName.CMR,
          siteUrl: 'fake-siteUrl-1',
        };

        // licenses with either 'EE' or 'MC' are buddies with 'CMR'
        fakeLicense1.offerName = OfferName.EE;
        expect(this.controller.isBuddyLicense(fakeLicense1, fakeLicense2)).toBe(true);
        expect(this.controller.isBuddyLicense(fakeLicense2, fakeLicense1)).toBe(true);
        fakeLicense1.offerName = OfferName.MC;
        expect(this.controller.isBuddyLicense(fakeLicense1, fakeLicense2)).toBe(true);
        expect(this.controller.isBuddyLicense(fakeLicense2, fakeLicense1)).toBe(true);

        // licenses with anything else are not buddies with 'CMR'
        fakeLicense1.offerName = 'foo';
        expect(this.controller.isBuddyLicense(fakeLicense1, fakeLicense2)).toBe(false);
        expect(this.controller.isBuddyLicense(fakeLicense2, fakeLicense1)).toBe(false);

        // licenses are not buddies if they do not share the same 'siteUrl'
        fakeLicense1.offerName = OfferName.EE;
        fakeLicense1.siteUrl = 'foo';
        expect(this.controller.isBuddyLicense(fakeLicense1, fakeLicense2)).toBe(false);
        expect(this.controller.isBuddyLicense(fakeLicense2, fakeLicense1)).toBe(false);
      });
    });

    describe('recvUpdate():', () => {
      beforeEach(function () {
        this.compileComponent('assignableAdvancedMeetings');
        this.fakeChangeEvent = {
          itemId: 'fake-license-id-1',
          itemCategory: AssignableServicesItemCategory.LICENSE,
          item: {
            isSelected: true,
            isDisabled: false,
            license: {
              licenseId: 'fake-license-id-1',
              offerName: OfferName.EE,
            },
          },
        };
        spyOn(this.controller, 'onUpdate');
        spyOn(this.controller, 'getBuddyLicenseFor').and.returnValue(undefined);
        spyOn(this.controller, 'changeBuddy');
      });

      it('should always call "onUpdate()"', function () {
        this.controller.recvUpdate(this.fakeChangeEvent);
        expect(this.controller.onUpdate).toHaveBeenCalledWith({
          $event: this.fakeChangeEvent,
        });
      });

      it('should call "getBuddyLicenseFor()" with license from change event', function () {
        this.controller.recvUpdate(this.fakeChangeEvent);
        expect(this.controller.getBuddyLicenseFor).toHaveBeenCalledWith(this.fakeChangeEvent.item.license);
      });

      it('should not call "changeBuddy()" if "getBuddyLicenseFor()" returns "undefined"', function () {
        this.controller.recvUpdate(this.fakeChangeEvent);
        expect(this.controller.changeBuddy).not.toHaveBeenCalled();
      });

      it('should call "changeBuddy()" if the change event license was either "EE" or "MC"', function () {
        this.controller.getBuddyLicenseFor.and.returnValue({ foo: 1 });
        this.controller.recvUpdate(this.fakeChangeEvent);
        expect(this.controller.changeBuddy).toHaveBeenCalledWith({ foo: 1 }, this.fakeChangeEvent);

        this.fakeChangeEvent.item.license.offerName = OfferName.MC;
        this.controller.recvUpdate(this.fakeChangeEvent);
        expect(this.controller.changeBuddy).toHaveBeenCalledWith({ foo: 1 }, this.fakeChangeEvent);
      });

      it('should call "changeBuddy()" if the change event license was "CMR" and "isSelected" property is true', function () {
        this.fakeChangeEvent.item.license.offerName = OfferName.CMR;
        this.controller.getBuddyLicenseFor.and.returnValue({ foo: 1 });
        this.controller.recvUpdate(this.fakeChangeEvent);
        expect(this.controller.changeBuddy).toHaveBeenCalledWith({ foo: 1 }, this.fakeChangeEvent);
      });

      it('should not call "changeBuddy()" if the change event license was "CMR" and "isSelected" property is false', function () {
        this.fakeChangeEvent.item.license.offerName = OfferName.CMR;
        this.fakeChangeEvent.item.isSelected = false;
        this.controller.getBuddyLicenseFor.and.returnValue({ foo: 1 });
        this.controller.recvUpdate(this.fakeChangeEvent);
        expect(this.controller.changeBuddy).not.toHaveBeenCalled();
      });
    });

    describe('changeBuddy():', () => {
      it('should call "mkBuddyChangeEvent()" to make a change event, then call "onUpdate()" with it', function () {
        this.compileComponent('assignableAdvancedMeetings');
        const fakeLicense = { foo: 1 };
        const fakeChangeEvent = { bar: 2 };
        const fakeBuddyChangeEvent = { baz: 3 };
        spyOn(this.controller, 'mkBuddyChangeEvent').and.returnValue(fakeBuddyChangeEvent);
        spyOn(this.controller, 'onUpdate');

        this.controller.changeBuddy(fakeLicense, fakeChangeEvent);

        expect(this.controller.mkBuddyChangeEvent).toHaveBeenCalledWith(fakeLicense, fakeChangeEvent);
        expect(this.controller.onUpdate).toHaveBeenCalledWith({ $event: fakeBuddyChangeEvent });
      });
    });

    describe('mkBuddyChangeEvent():', () => {
      it('should create a copy of a change event, applicable for a given license', function () {
        const fakeLicense = {
          licenseId: 'fake-license-id-2',
        };
        const fakeChangeEvent = {
          itemId: 'fake-license-id-1',
          item: {
            isSelected: true,
            isDisabled: false,
            license: {
              licenseId: 'fake-license-id-1',
            },
          },
        };

        this.compileComponent('assignableAdvancedMeetings');
        const result = this.controller.mkBuddyChangeEvent(fakeLicense, fakeChangeEvent);

        expect(result).toEqual({
          itemId: 'fake-license-id-2',
          item: {
            isSelected: true,
            isDisabled: false,
            license: {
              licenseId: 'fake-license-id-2',
            },
          },
        });
      });
    });
  });
});
