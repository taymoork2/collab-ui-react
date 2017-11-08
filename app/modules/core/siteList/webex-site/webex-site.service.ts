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

  public transformExistingSites(confServicesInActingSubscription): IWebExSite[] {
    return _.chain(confServicesInActingSubscription).map('siteUrl').uniq().map(siteUrl => {
      return {
        siteUrl: _.replace(siteUrl.toString(), this.Config.siteDomainUrl.webexUrl, ''),
        quantity: 0,
        centerType: '',
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
    const AudioInfo = this.getAudioPackageInfo(subscriptionId);
    const payload = this.constructWebexLicensesPayload(remainingSite, subscriptionId, Actions.DELETE, AudioInfo.audioPartnerName, AudioInfo.ccaspSubscriptionId);
    return this.SetupWizardService.updateSitesInActiveSubscription(payload);
  }

}
