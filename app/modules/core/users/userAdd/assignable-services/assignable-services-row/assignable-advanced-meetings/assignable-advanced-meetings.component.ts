import { ILicenseUsage } from 'modules/core/users/userAdd/assignable-services/shared';

class AssignableAdvancedMeetingsController implements ng.IComponentController {
  private licenses: ILicenseUsage[];

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService,
  ) {}

  public findLicense(findOptions: Object): ILicenseUsage | undefined {
    return this.LicenseUsageUtilService.findLicense(findOptions, this.licenses);
  }

  public hasAdvancedMeetings(): boolean {
    return !!_.size(this.licenses);
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
  };
}
