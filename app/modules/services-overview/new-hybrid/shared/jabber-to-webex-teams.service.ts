import { IPrereqsSettings, IPrereqsSettingsResponse, IUcManagerProfile, PROFILE_TEMPLATE } from './jabber-to-webex-teams.types';
import { JabberToWebexTeamsUtil } from './jabber-to-webex-teams.util';

export class JabberToWebexTeamsService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
  ) {}

  public getConfigTemplatesUrl() {
    return `https://identity.webex.com/organization/${this.Authinfo.getOrgId()}/v1/config/templates`;
  }

  public create(options: {
    profileName: string;
    voiceServerDomainName: string;
    udsServerAddress: string;
    udsBackupServerAddress: string;
  }): ng.IPromise<IUcManagerProfile> {
    // TODO : the allowUserEdit need to be added after CI enable this property.
    const { profileName, voiceServerDomainName, udsServerAddress, udsBackupServerAddress } = options;
    let requestData = {};
    _.assignIn(requestData, PROFILE_TEMPLATE);
    _.assignIn(requestData, { templateName: profileName, VoiceMailServer: voiceServerDomainName, CUCMServer: udsServerAddress, BackupCUCMServer: udsBackupServerAddress });
    requestData = _.omitBy(requestData, _.isEmpty);
    return this.$http.post(this.getConfigTemplatesUrl(), requestData, {
      headers: {
        Accept: 'application/json',
      },
    }).then((response) => {
      const profile: IUcManagerProfile = JabberToWebexTeamsUtil.mkUcManagerProfile();
      return _.assignIn(profile, <IUcManagerProfile>response.data);
    });
  }

  public savePrereqsSettings(options: {
    allPrereqsDone: boolean;
  }): ng.IPromise<IPrereqsSettings> {
    const requestData = JabberToWebexTeamsUtil.mkPrereqsSettingsRequest(options);
    return this.$http.post(this.getConfigTemplatesUrl(), requestData, {
      headers: {
        Accept: 'application/json; charset=utf-8',
      },
    }).then((response: ng.IHttpResponse<{ data: IPrereqsSettingsResponse; }>) => {
      const filteredData = _.assignIn({}, _.pick(response.data, ['id', 'templateType', 'templateName']), {
        // notes (as of 2018-07-23):
        // - because CI endpoint stores config property values as strings only, we convert string back
        //   to boolean
        allPrereqsDone: _.get(response.data, 'allPrereqsDone') === 'true',
      });
      return <IPrereqsSettings>filteredData;
    });
  }
}
