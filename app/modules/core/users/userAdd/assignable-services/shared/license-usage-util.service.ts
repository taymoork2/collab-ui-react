import { ILicenseUsage } from './license-usage-util.interfaces';
import { Config } from 'modules/core/config/config';
import { OfferName } from 'modules/core/shared';

export class LicenseUsageUtilService {

  public static readonly ADVANCED_MEETING_OFFER_NAMES = [OfferName.CMR, OfferName.EC, OfferName.EE, OfferName.MC, OfferName.TC];

  /* @ngInject */
  constructor(
    private Config: Config,
  ) {}

  public filterLicenses(filterOptions: Object, licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.filter(licenses, filterOptions);
  }

  public findLicense(findOptions: Object, licenses: ILicenseUsage[]): ILicenseUsage | undefined {
    return _.find(licenses, findOptions);
  }

  public hasLicensesWith(searchOptions: Object, licenses: ILicenseUsage[]): boolean {
    return _.some(licenses, searchOptions);
  }

  public getMessageLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.filter(licenses, (license) => {
      return _.includes([OfferName.MS, OfferName.MSGR], license.offerName);
    });
  }

  public getCallLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.filter(licenses, { offerName: OfferName.CO });
  }

  public getCareLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.filter(licenses, (license) => {
      return _.includes([OfferName.CDC, OfferName.CVC], license.offerName);
    });
  }

  public getBasicMeetingLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.filter(licenses, { offerName: OfferName.CF });
  }

  public getAdvancedMeetingLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.filter(licenses, (license) => {
      return _.includes(LicenseUsageUtilService.ADVANCED_MEETING_OFFER_NAMES, _.get(license, 'offerName'));
    });
  }

  public getAdvancedMeetingSiteUrls(licenses: ILicenseUsage[]): string[] {
    const advancedMeetingLicenses = this.getAdvancedMeetingLicenses(licenses);
    return _.sortBy(_.uniq(_.map(advancedMeetingLicenses, 'siteUrl')));
  }

  public getTotalLicenseUsage(offerName: string, licenses: ILicenseUsage[]): number {
    const filteredLicenses = _.filter(licenses, { offerName });
    const sum = _.sumBy(filteredLicenses, 'usage');
    return (sum < 0) ? 0 : sum;
  }

  public getTotalLicenseVolume(offerName: string, licenses: ILicenseUsage[]): number {
    const filteredLicenses = _.filter(licenses, { offerName });
    return _.sumBy(filteredLicenses, 'volume');
  }

  public isSharedMeetingsLicense(license: ILicenseUsage): boolean {
    return _.get(license, 'licenseModel') === this.Config.licenseModel.cloudSharedMeeting;
  }
}
