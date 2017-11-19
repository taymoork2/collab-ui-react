import { ILicenseUsage } from 'modules/core/users/userAdd/assignable-services/shared';

class AssignableAdvancedMeetingsController implements ng.IComponentController {
  private readonly ORDERED_OFFER_NAMES = ['CMR', 'EC', 'EE', 'MC', 'TC'];
  private licenses: ILicenseUsage[];

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    if (_.isEmpty(this.licenses)) {
      return;
    }

    this.licenses = this.sortLicenses(this.licenses);

    // notes:
    // - licenses with 'CMR' are a bit of a special case
    // - they are normally associated with licenses with 'EE' or 'MC' (with matching site url)
    // - so we strip them from the original list of licenses
    // - then reinsert them back AFTER their corresponding 'EE' or 'MC' license (whichever exists)
    const cmrLicenses = this.removeCmrLicenses(this.licenses);
    this.reinsertCmrLicenses(cmrLicenses, this.licenses);
  }

  private sortLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.sortBy(licenses, [
      // - sorted first by 'siteUrl'
      'siteUrl',

      // - then by 'offerName', as determined by ORDERED_OFFER_NAMES
      (license) => {
        return _.indexOf(this.ORDERED_OFFER_NAMES, license.offerName);
      }]);
  }

  private removeCmrLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.remove(licenses, { offerName: 'CMR' });
  }

  private reinsertCmrLicenses(cmrLicenses: ILicenseUsage[], licenses: ILicenseUsage[]): void {
    if (_.isEmpty(licenses)) {
      return;
    }

    _.forEach(cmrLicenses, (cmrLicense) => {
      let foundIndex = -1;

      // notes:
      // - if license with matching site url and either 'EE' or 'MC' is present, splice in license
      //   with 'CMR' right after it (ie. foundIndex + 1)
      // - do this only once for each license with 'CMR'
      foundIndex = _.findIndex(licenses, { siteUrl: cmrLicense.siteUrl, offerName: 'EE' });
      if (foundIndex > -1) {
        licenses.splice(foundIndex + 1, 0, cmrLicense);
        return;
      }

      foundIndex = _.findIndex(licenses, { siteUrl: cmrLicense.siteUrl, offerName: 'MC' });
      if (foundIndex > -1) {
        licenses.splice(foundIndex + 1, 0, cmrLicense);
        return;
      }
    });
  }

  public hasAdvancedMeetings(): boolean {
    return !_.isEmpty(this.licenses);
  }

  public getTotalLicenseUsage(offerName: string): number {
    return this.LicenseUsageUtilService.getTotalLicenseUsage(offerName, this.licenses);
  }

  public getTotalLicenseVolume(offerName: string): number {
    return this.LicenseUsageUtilService.getTotalLicenseVolume(offerName, this.licenses);
  }

  public isSharedMeetingsLicense(license: ILicenseUsage): boolean {
    return this.LicenseUsageUtilService.isSharedMeetingsLicense(license);
  }
}

export class AssignableAdvancedMeetingsComponent implements ng.IComponentOptions {
  public controller = AssignableAdvancedMeetingsController;
  public template = require('./assignable-advanced-meetings.html');
  public bindings = {
    licenses: '<',
    siteUrls: '<',
    onUpdate: '&',
    stateData: '<',
  };
}
