import { PROFILE_TEMPLATE, IUcManagerProfile } from './jabber-to-webex-teams.types';
import { JabberToWebexTeamsUtil } from './jabber-to-webex-teams.util';
import { SessionStorageService } from 'modules/core/storage/sessionStorage.service';

export class JabberProfileService {
  private baseURl = 'https://identity.webex.com/organization';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private SessionStorage: SessionStorageService,
  ) {}

  public getUrl() {
    return `${this.baseURl}/${this.Authinfo.getOrgId()}/v1/config/templates`;
  }

  public getAuthorization() {
    return `Bearer ${this.SessionStorage.get('accessToken')}`;
  }

  public create(profileName: string, voiceServerDomainName: string, udsServerAddress: string, udsBackupServerAddress: string ): ng.IPromise<IUcManagerProfile> {
    const requestData = {};
    _.assignIn(requestData, PROFILE_TEMPLATE);
    _.assignIn(requestData, { templateName: profileName, VoiceMailServer: voiceServerDomainName, CUCMServer: udsServerAddress, BackupCUCMServer: udsBackupServerAddress });
    return this.$http.post(this.getUrl(), requestData, {
      headers: {
        Accept: 'application/json',
        Authorization: this.getAuthorization(),
      },
    }).then((response) => {
      const profile: IUcManagerProfile = JabberToWebexTeamsUtil.mkUcManagerProfile();
      return _.assignIn(profile, <IUcManagerProfile>response.data);
    });
  }
}

export default JabberProfileService;
