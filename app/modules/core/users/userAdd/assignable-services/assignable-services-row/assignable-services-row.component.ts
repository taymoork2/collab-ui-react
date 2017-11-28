import { ILicenseUsage } from 'modules/core/users/userAdd/assignable-services/shared';

class AssignableServicesRowController implements ng.IComponentController {

  public showContent = true;
  private subscription: any;  // TODO: better type
  private licenses: ILicenseUsage[];
  private basicMeetingLicenses: ILicenseUsage[];
  private advancedMeetingLicenses: ILicenseUsage[];
  private advancedMeetingSiteUrls: string[];

  /* @ngInject */
  constructor (
    private LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    this.licenses = this.subscription.licenses;
    this.basicMeetingLicenses = this.getBasicMeetingLicenses();
    this.advancedMeetingLicenses = this.getAdvancedMeetingLicenses();
    this.advancedMeetingSiteUrls = this.getAdvancedMeetingSiteUrls();
  }

  private getBasicMeetingLicenses(): ILicenseUsage[] {
    return this.LicenseUsageUtilService.getBasicMeetingLicenses(this.licenses);
  }

  private getAdvancedMeetingLicenses(): ILicenseUsage[] {
    return this.LicenseUsageUtilService.getAdvancedMeetingLicenses(this.licenses);
  }

  private getAdvancedMeetingSiteUrls(): string[] {
    return this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(this.licenses);
  }

  public getLicenses(filterOptions: Object): ILicenseUsage[] {
    return this.LicenseUsageUtilService.filterLicenses(filterOptions, this.licenses);
  }

  public findLicenseForOfferName(offerName: string): ILicenseUsage | undefined {
    return this.LicenseUsageUtilService.findLicense({ offerName }, this.licenses);
  }

  public hasLicensesWith(filterOptions: Object): boolean {
    return this.LicenseUsageUtilService.hasLicensesWith(filterOptions, this.licenses);
  }

  public getTotalLicenseUsage(offerName: string): number {
    return this.LicenseUsageUtilService.getTotalLicenseUsage(offerName, this.licenses);
  }

  public getTotalLicenseVolume(offerName: string): number {
    return this.LicenseUsageUtilService.getTotalLicenseVolume(offerName, this.licenses);
  }
}

export class AssignableServicesRowComponent implements ng.IComponentOptions {
  public controller = AssignableServicesRowController;
  public template = require('./assignable-services-row.html');
  public bindings = {
    isCareEnabled: '<',
    subscription: '<',
    onUpdate: '&',
    stateData: '<',
  };
}
