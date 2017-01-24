interface IResult {
  errors?: any;
  message: string;
  trackingId: string;
}

interface IVoicemailOrgEnableInfo {
  voicemailOrgEnableInfo: {
    orgId: string,                       // OrgID (UUID)
    orgHybridVoicemailEnabled: boolean,  // Voicemail Enable Setting for Hybrid Users (true, false)
    orgSparkVoicemailEnabled: boolean,   // Voicemail Enable Setting for Spark-Call Users (true, false)
    orgVoicemailStatus: string,          // Optional Message Back to Admin (max size 80 char)
  };
}

interface IVmInfo {
  vmInfo: {
    userId: string,                 // UserID (UUID)
    mwiStatus: boolean,             // Whether message waiting indicator should be on/off
    voicemailPilot: number,         // Dial-able primary extension voicemail pilot number
    countUnread: number,            // Number of unread messages in mailbox (excluded for unknown count)
    countRead: number,              // Number of read messages in mailbox   (excluded for unknown count)
  };
}

export class UCCService {

  private uccUrl: string;
  private hybridVoicemailUrl: string;

  private hybridVoicemailHasBeenEnabled = true; // Hard coded for now, remove once API is online.

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private UrlConfig,
  ) {
    this.uccUrl = this.UrlConfig.getUccUrl();
    this.hybridVoicemailUrl = this.UrlConfig.getHybridVoicemailUrl();
  }

  private extractData(res: any): any {
    return res.data;
  }

  public getUserDiscovery(userId: string, orgId?: string): ng.IPromise<IResult> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http
      .get<IResult>(`${this.uccUrl}/userDiscovery/${orgId}/${userId}`)
      .then(this.extractData);
  }

  public getOrgVoicemailConfiguration(orgId?: string): ng.IPromise<IVoicemailOrgEnableInfo> {
    // See https://wiki.cisco.com/display/WX2/Voicemail+Org+Enable+APIs
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$q.resolve({ // replace with GET to this.hybridVoicemailUrl + /vmOrgStatus/{orgId}
      voicemailOrgEnableInfo: {
        orgId: orgId,
        orgHybridVoicemailEnabled: this.hybridVoicemailHasBeenEnabled,
        orgSparkVoicemailEnabled: false,
        orgVoicemailStatus: 'ENABLED',
      },
    });
  }

  public enableHybridVoicemail(orgId?: string): ng.IPromise<any> {
    return this.setOrgVoicemailConfiguration(true, orgId);
  }

  public disableHybridVoicemail(orgId?: string): ng.IPromise<any> {
    return this.setOrgVoicemailConfiguration(false, orgId);
  }

  private setOrgVoicemailConfiguration(enable: boolean, orgId?: string): ng.IPromise<IVoicemailOrgEnableInfo> {
    // See https://wiki.cisco.com/display/WX2/Voicemail+Org+Enable+APIs
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    this.hybridVoicemailHasBeenEnabled = enable;
    return this.$q.resolve({ // replace with POST to this.hybridVoicemailUrl + /vmOrgStatus/{orgId}
      voicemailOrgEnableInfo: {
        orgId: orgId,
        orgHybridVoicemailEnabled: true,
        orgSparkVoicemailEnabled: false,
        orgVoicemailStatus: 'ENABLED',
      },
    });
  }

  public getUserVoicemailInfo(userId: string, orgId?: string): ng.IPromise<IVmInfo> {
    // See https://wiki.cisco.com/display/WX2/Voicemail+User+Info+APIs
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$q.resolve({ // replace with GET to this.hybridVoicemailUrl + /vmInfo/{orgId}/{userId}/
      vmInfo: {
        userId: userId,
        mwiStatus: true,
        voicemailPilot: 123456,
        countUnread: 1,
        countRead: 0,
      },
    });
  }

}

export default angular
  .module('Hercules')
  .service('UCCService', UCCService)
  .name;
