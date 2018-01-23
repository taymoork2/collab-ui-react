import './webex-site.scss';

import { IWebExSite, IConferenceLicense, IWebexProvisioningParams, IWebexSiteDetail } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
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

export class WebExSiteService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private Config: Config,
    private SetupWizardService: SetupWizardService,
  ) { }

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
