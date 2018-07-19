import { PROFILE_TEMPLATE, IUcManagerProfile } from './jabber-to-webex-teams.types';
import { JabberToWebexTeamsUtil } from './jabber-to-webex-teams.util';
import { SessionStorageService } from 'modules/core/storage/sessionStorage.service';

export class JabberProfileService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private SessionStorage: SessionStorageService,
  ) {}

  public getConfigTemplatesUrl() {
    return `https://identity.webex.com/organization/${this.Authinfo.getOrgId()}/v1/config/templates`;
  }

  public getAuthorization() {
    return `Bearer ${this.SessionStorage.get('accessToken')}`;
  }

  public create(options: {
    profileName: string;
    voiceServerDomainName: string;
    udsServerAddress: string;
    udsBackupServerAddress: string;
  }): ng.IPromise<IUcManagerProfile> {
    // TODO : the allowUserEdit need to be added after CI enable this property.
    const { profileName, voiceServerDomainName, udsServerAddress, udsBackupServerAddress } = options;
    const requestData = {};
    _.assignIn(requestData, PROFILE_TEMPLATE);
    _.assignIn(requestData, { templateName: profileName, VoiceMailServer: voiceServerDomainName, CUCMServer: udsServerAddress, BackupCUCMServer: udsBackupServerAddress });
    return this.$http.post(this.getConfigTemplatesUrl(), requestData, {
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
