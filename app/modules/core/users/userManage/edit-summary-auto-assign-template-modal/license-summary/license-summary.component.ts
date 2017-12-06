import { ILicenseUsage } from 'modules/core/users/userAdd/assignable-services/shared';
import { OfferName } from 'modules/core/shared';

class LicenseSummaryController implements ng.IComponentController {
  private advancedMeetingLicenses: ILicenseUsage[];
  private advancedMeetingSiteUrls: string[];
  private stateData: any; //TODO add a better type
  public OFFER_NAME = OfferName;

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    this.advancedMeetingLicenses = this.getAdvancedMeetingLicenses();
    this.advancedMeetingSiteUrls = this.getAdvancedMeetingSiteUrls();
  }
  private getSelectedLicenses(): ILicenseUsage[] {
    const isSelectedLicense = _.filter(this.stateData.LICENSE, { isSelected: true });
    return _.map(isSelectedLicense, 'license');
  }

  private getAdvancedMeetingLicenses(): ILicenseUsage[] {
    return this.LicenseUsageUtilService.getAdvancedMeetingLicenses(this.getSelectedLicenses());
  }

  private getAdvancedMeetingSiteUrls(): string[] {
    return this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(this.getSelectedLicenses());
  }

  public findLicenseForOfferName(offerName: string): ILicenseUsage | undefined {
    return this.LicenseUsageUtilService.findLicense({ offerName }, this.getSelectedLicenses());
  }

  public getTotalLicenseUsage(offerName: string): number {
    return this.LicenseUsageUtilService.getTotalLicenseUsage(offerName, this.getSelectedLicenses());
  }

  public getTotalLicenseVolume(offerName: string): number {
    return this.LicenseUsageUtilService.getTotalLicenseVolume(offerName, this.getSelectedLicenses());
  }
}

export class LicenseSummaryComponent implements ng.IComponentOptions {
  public controller = LicenseSummaryController;
  public template = require('./license-summary.html');
  public bindings = {
    stateData: '<',
  };
}
