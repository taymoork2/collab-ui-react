import { HybridVoicemailStatus } from 'modules/hercules/hybrid-services.types';

export interface IUserDiscoveryInfo {
  directoryURI: string;
}

interface IResult {
  errors?: any;
  message: string;
  trackingId: string;
}

export interface IVoicemailOrgEnableInfo {
  voicemailOrgEnableInfo: {
    orgId: string,                       // OrgID (UUID)
    orgHybridVoicemailEnabled: boolean,  // Voicemail Enable Setting for Hybrid Users (true, false)
    orgSparkVoicemailEnabled: boolean,   // Voicemail Enable Setting for Spark-Call Users (true, false)
    orgVoicemailStatus?: HybridVoicemailStatus,          // Optional Message Back to Admin (max size 80 char)
  };
}

export interface IVmInfo {
  vmInfo: {
    userId: string,                 // UserID (UUID)
    mwiStatus: boolean,             // Whether message waiting indicator should be on/off
    voicemailPilot: string,         // Dial-able primary extension voicemail pilot number presented as as string in the API
    countUnread: number,            // Number of unread messages in mailbox (excluded for unknown count)
    countRead: number,              // Number of read messages in mailbox   (excluded for unknown count)
  };
}

export class UCCService {

  private uccUrl: string;
  private hybridVoicemailUrl: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {
    this.uccUrl = this.UrlConfig.getUccUrl();
    this.hybridVoicemailUrl = this.UrlConfig.getHybridVoicemailUrl();
  }

  private extractData(res: any): any {
    return res.data;
  }

  public getUserDiscovery(userId: string, orgId?: string): ng.IPromise<IUserDiscoveryInfo> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http
      .get<IResult>(`${this.uccUrl}/userDiscovery/${orgId}/${userId}`)
      .then(this.extractData);
  }

  public getOrgVoicemailConfiguration(orgId?: string): ng.IPromise<IVoicemailOrgEnableInfo> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.get(`${this.hybridVoicemailUrl}/vmOrgStatus/orgs/${orgId}/`)
      .then(this.extractData);
  }

  public enableHybridVoicemail(orgId?: string): ng.IPromise<IVoicemailOrgEnableInfo> {
    return this.setOrgVoicemailConfiguration(true, orgId);
  }

  public disableHybridVoicemail(orgId?: string): ng.IPromise<IVoicemailOrgEnableInfo> {
    return this.setOrgVoicemailConfiguration(false, orgId);
  }

  private setOrgVoicemailConfiguration(enable: boolean, orgId?: string): ng.IPromise<IVoicemailOrgEnableInfo> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.post(`${this.hybridVoicemailUrl}/vmOrgStatus/orgs/${orgId}/`, {
      voicemailOrgEnableInfo: {
        orgHybridVoicemailEnabled: enable,
      },
    })
      .then(this.extractData);

  }

  public getUserVoicemailInfo(userId: string, orgId?: string): ng.IPromise<IVmInfo> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.get(`${this.hybridVoicemailUrl}/vmInfo/orgs/${orgId}/users/${userId}/`)
      .then(this.extractData);
  }

  public mapStatusToCss(status: HybridVoicemailStatus): string {
    switch (status) {
      case 'NOT_CONFIGURED':
        return 'disabled';
      case 'REQUESTED':
        return 'disabled';
      case 'HYBRID_SUCCESS':
        return 'success';
      case 'HYBRID_FAILED':
        return 'danger';
      case 'HYBRID_PARTIAL':
        return 'warning';
      case undefined:
      default:
        return 'default';
    }

  }

}

export default angular
  .module('Hercules')
  .service('UCCService', UCCService)
  .name;
