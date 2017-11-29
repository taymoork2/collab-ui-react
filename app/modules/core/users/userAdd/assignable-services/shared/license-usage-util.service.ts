import { ILicenseUsage } from './license-usage-util.interfaces';
import { Config } from 'modules/core/config/config';

export class LicenseUsageUtilService {

  public static readonly ADVANCED_MEETING_OFFER_NAMES = ['CMR', 'EC', 'EE', 'MC', 'TC'];

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

  public findLicenseIdForOfferName(offerName: string, licenses: ILicenseUsage[]): string | undefined {
    const result: ILicenseUsage = _.find(licenses, { offerName });
    return _.get(result, 'licenseId');
  }

  public hasLicensesWith(searchOptions: Object, licenses: ILicenseUsage[]): boolean {
    return _.some(licenses, searchOptions);
  }

  public getBasicMeetingLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.filter(licenses, { offerName: 'CF' });
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

  public hasLicenseWithAnyOfferName(offerNameOrOfferNames: string|string[], licenses: ILicenseUsage[]): boolean {
    if (!_.isArray(offerNameOrOfferNames)) {
      return !_.isEmpty(_.filter(licenses, { offerName: offerNameOrOfferNames }));
    }
    const results = _.filter(licenses, (license) => {
      return _.includes(offerNameOrOfferNames, _.get(license, 'offerName'));
    });
    return !_.isEmpty(results);
  }

  public getTotalLicenseUsage(offerName: string, licenses: ILicenseUsage[]): number {
    const filteredLicenses = _.filter(licenses, { offerName: offerName });
    const sum = _.sumBy(filteredLicenses, 'usage');
    return (sum < 0) ? 0 : sum;
  }

  public getTotalLicenseVolume(offerName: string, licenses: ILicenseUsage[]): number {
    const filteredLicenses = _.filter(licenses, { offerName: offerName });
    return _.sumBy(filteredLicenses, 'volume');
  }

  public isSharedMeetingsLicense(license: ILicenseUsage): boolean {
    return _.get(license, 'licenseModel') === this.Config.licenseModel.cloudSharedMeeting;
  }

  public sanitizeIdForJs(licenseId: string): string | undefined {
    if (!licenseId) {
      return;
    }
    return licenseId.replace(/[.-]/g, '_');
  }
}