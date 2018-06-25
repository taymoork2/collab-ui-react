import './webex-site.scss';

import { IWebExSite, IConferenceLicense, IWebexProvisioningParams, IWebexSiteDetail, IPendingLicense, ICenterDetails, IPendingOrderSubscription } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { Config } from 'modules/core/config/config';

export interface IAudioPackageInfo {
  audioPackage: string | null;
  audioPartnerName?: string;
  ccaspSubscriptionId?: string;
}

export enum Actions {
  ADD = 'ADD',
  DELETE = 'DELETE',
  UPDATE = 'REDISTRIBUTE',
}

export interface IWebExLicencesPayload {
  externalSubscriptionId?: string;
  webexProvisioningParams?: IWebexProvisioningParams;
}

export interface ICenterDetailsFromAPI {
  externalSubscriptionId: string;
  subscriptionId: string;
  purchasedServices: ICenterDetails[];
}

export class WebExSiteService {

  /* @ngInject */
  constructor(
    private $q,
    private Authinfo,
    private Config: Config,
    private SetupWizardService: SetupWizardService,
  ) { }
  // going subscription by subscription...
  // compare results from getCenterDetails and extractCenterDetails. If licenses are different return different licenses.

  private centerDetailsFromSubscriptions: ICenterDetailsFromAPI[] = [];

  public getAllCenterDetailsFromSubscriptions(): ng.IPromise<ICenterDetailsFromAPI[]> {
    if (!_.isEmpty(this.centerDetailsFromSubscriptions)) {
      return this.$q.resolve(this.centerDetailsFromSubscriptions);
    }
    return this.cacheAllCenterDetailsFromSubscriptions().then(() => this.centerDetailsFromSubscriptions);
  }

  private cacheAllCenterDetailsFromSubscriptions(): ng.IPromise<void> {
    return this.getCenterDetailsForAllSubscriptions().then(centerDetailsFromSubscriptions => {
      this.centerDetailsFromSubscriptions = centerDetailsFromSubscriptions;
    });
  }

  // Gets center details directly from api.
  // Used when modifying existing license distribution
  private getCenterDetailsForAllSubscriptions(): ng.IPromise<ICenterDetailsFromAPI[]> {
    const externalIds: string[] = _.chain(this.Authinfo.getSubscriptions())
      .filter((subscription) => subscription.status !== this.Config.subscriptionStatus.PENDING)
      .map((subscription) => subscription.externalSubscriptionId)
      .value();
    const centerDetailsPromises: ng.IPromise<any>[] = _.map(externalIds, subId => {
      return this.SetupWizardService.getExistingConferenceServiceDetails(subId);
    });
    return this.$q.all(centerDetailsPromises).then((centerDetailsForAllSubscriptions) => {
      _.forEach(centerDetailsForAllSubscriptions, subscription => {
        subscription.externalSubscriptionId = this.getExternalSubscriptionIdFromSubscriptionId(subscription.subscriptionId);
        subscription.purchasedServices = this.filterPurchasedServicesArray(subscription.purchasedServices);
      });
      return centerDetailsForAllSubscriptions;
    });
  }

  public findSubscriptionsWithUnsyncedLicenses(): ng.IPromise<(ICenterDetailsFromAPI | undefined)[]> {
    return this.getAllCenterDetailsFromSubscriptions().then(centerDetailsFromSubscriptions => {
      return _.compact(_.map(centerDetailsFromSubscriptions, subscriptionCenterDetails => {
        if (this.subscriptionHasUnsyncedLicenses(subscriptionCenterDetails.purchasedServices, this.getComparisonCenterDetailsFromSubscriptionId(subscriptionCenterDetails.subscriptionId))) {
          return subscriptionCenterDetails;
        }
      }));
    });
  }

  private subscriptionHasUnsyncedLicenses(centerDetails: ICenterDetails[], comparisonCenterDetails: ICenterDetails[]): boolean {
    let licensesAreUnsynced = false;
    _.forEach(centerDetails, centerDetail => {
      const matchingCenter = _.find(comparisonCenterDetails, { serviceName: centerDetail.serviceName });
      if (matchingCenter && matchingCenter.quantity !== centerDetail.quantity) {
        licensesAreUnsynced = true;
      }
    });
    return licensesAreUnsynced;
  }

  private getExternalSubscriptionIdFromSubscriptionId(subId): string {
    const subscriptionDetails: IPendingOrderSubscription = _.find(this.Authinfo.getSubscriptions(), { subscriptionId: subId });
    return subscriptionDetails && subscriptionDetails.externalSubscriptionId;
  }

  private getComparisonCenterDetailsFromSubscriptionId(subId): ICenterDetails[] {
    return this.extractCenterDetailsFromSingleSubscription(this.SetupWizardService.getConferenceLicensesBySubscriptionId(this.getExternalSubscriptionIdFromSubscriptionId(subId)));
  }

  // Gets center details by summing quantities from the license data.
  // Used by SetupWizard for new subscriptions or as fallback if api call fails or returns empty purchasedServices array.
  public extractCenterDetailsFromLicensesOnAllSubscriptions() {
    const externalIds: string[] = _.map(this.Authinfo.getSubscriptions(), 'externalSubscriptionId');
    const centerDetailsArray: ICenterDetails[][] = _.map(externalIds, (subId) => {
      return this.extractCenterDetailsFromSingleSubscription(this.SetupWizardService.getConferenceLicensesBySubscriptionId(subId));
    });
    return centerDetailsArray;
  }

  public getExistingSites(confServicesInActingSubscription): IWebExSite[] {
    return _.map(confServicesInActingSubscription, (license: IConferenceLicense) => {
      return {
        siteUrl: _.replace(_.get<string>(license, 'siteUrl'), this.Config.siteDomainUrl.webexUrl, ''),
        quantity: license.volume,
        centerType: license.offerName,
        isCIUnifiedSite: license.isCIUnifiedSite,
      };
    });
  }

  public extractCenterDetailsFromSingleSubscription(confServicesInActingSubscription): ICenterDetails[] {
    const meetingLicenses = this.getMeetingLicensesGroupedByOfferName(confServicesInActingSubscription);
    return _.map(meetingLicenses, (license: IPendingLicense) => {
      return {
        serviceName: license.offerName,
        quantity: license.volume,
      };
    });
  }

  private getMeetingLicensesGroupedByOfferName(confServicesInActingSubscription): { offerName, volume }[] {
    const meetingLicensesGrouped = _.groupBy(confServicesInActingSubscription, 'offerName');
    return _.map(meetingLicensesGrouped, (value, key) => {
      return {
        offerName: key,
        volume: _.reduce(value, function (total, o) {
          return total + _.get(o, 'volume', 0);
        }, 0),
      };
    });
  }

  private filterPurchasedServicesArray(purchasedServicesArray): ICenterDetails[] {
    return _.filter(purchasedServicesArray, service => {
      return _.includes(this.Config.webexTypeCodes, service.serviceName);
    });
  }

  public transformExistingSites(confServicesInActingSubscription): IWebExSite[] {
    return _.chain(this.getExistingSites(confServicesInActingSubscription))
      .uniqBy('siteUrl').map(site => {
        return {
          siteUrl: _.replace(site.siteUrl.toString(), this.Config.siteDomainUrl.webexUrl, ''),
          quantity: 0,
          centerType: '',
          isCIUnifiedSite: site.isCIUnifiedSite,
          keepExistingSite: true,
        };
      }).value();
  }

  public getAudioPackageInfo(subscripionId): IAudioPackageInfo {
    const result: IAudioPackageInfo = {
      audioPackage: null,
    };

    const audioLicenses = _.filter(this.Authinfo.getLicenses(), { licenseType: this.Config.licenseTypes.AUDIO });
    const license = <IConferenceLicense>_.find(audioLicenses, { billingServiceId: subscripionId });
    if (_.isEmpty(license)) {
      return result;
    }
    result.audioPackage = license.offerName;
    if (result.audioPackage === this.Config.offerCodes.CCASP) {
      result.audioPartnerName = _.get(license, 'ccaspPartnerName');
      result.ccaspSubscriptionId = _.get(license, 'ccaspSubscriptionId');
    } else if (result.audioPackage === this.Config.offerCodes.TSP) {
      result.audioPartnerName = _.get(license, 'tspPartnerName');
    }
    return result;
  }

  public constructWebexLicensesPayload(webexSiteDetailsList: IWebexSiteDetail[], currentSubscriptionId: string, action: Actions, audioPartnerName?: string, ccaspSubscriptionId?: string, transferCode?: string): IWebExLicencesPayload {
    const webexLicensesPayload: IWebExLicencesPayload = {
      externalSubscriptionId: currentSubscriptionId,
      webexProvisioningParams: {
        webexSiteDetailsList: webexSiteDetailsList,
        audioPartnerName: null,
      },
    };
    _.assign(webexLicensesPayload.webexProvisioningParams, {
      asIs: false,
      siteManagementAction: action,
    });
    if (audioPartnerName) {
      _.set(webexLicensesPayload.webexProvisioningParams, 'audioPartnerName', audioPartnerName);
    }
    if (transferCode) {
      _.set(webexLicensesPayload.webexProvisioningParams, 'transferCode', transferCode);
    }
    if (ccaspSubscriptionId) {
      _.set(webexLicensesPayload.webexProvisioningParams, 'ccaspSubscriptionId', ccaspSubscriptionId);
    }

    return webexLicensesPayload;
  }

  public deleteSite(subscriptionId, remainingSite) {
    const audioInfo = this.getAudioPackageInfo(subscriptionId);
    const payload = this.constructWebexLicensesPayload(remainingSite, subscriptionId, Actions.DELETE, audioInfo.audioPartnerName, audioInfo.ccaspSubscriptionId);
    return this.SetupWizardService.updateSitesInActiveSubscription(payload);
  }

}
