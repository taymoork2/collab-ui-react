import { IPrereqsSettings, IPrereqsSettingsResponse, IUcManagerProfile, PREREQS_CONFIG_TEMPLATE_TYPE, PROFILE_TEMPLATE } from './jabber-to-webex-teams.types';
import { JabberToWebexTeamsUtil } from './jabber-to-webex-teams.util';

export class JabberToWebexTeamsService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {}

  public getConfigTemplatesUrl() {
    return `${this.UrlConfig.getIdentityServiceUrl()}/organization/${this.Authinfo.getOrgId()}/v1/config/templates`;
  }

  public listUcManagerProfiles(): ng.IPromise<IUcManagerProfile[]> {
    return this.$http.get(this.getConfigTemplatesUrl())
      .then((response) => {
        return _.get(response.data, 'Resources') as IUcManagerProfile[];
      });
  }

  public deleteUcManagerProfile(templateId: string): ng.IPromise<ng.IHttpResponse<{}>> {
    const url = `${this.getConfigTemplatesUrl()}/${templateId}`;
    return this.$http.delete(url, {
      //algendel: content-type specification is required and when data attribute is missing
      //the content-type is getting stripped so the empty data object needs to be provided
      data: {},
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
    // TODO (changlol): rm unnecessary headers config argument from '$http.post()'
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
    return this.$http.post<IPrereqsSettingsResponse>(this.getConfigTemplatesUrl(), requestData)
      .then(response => {
        return this.toPrereqsSettings(response.data);
      });
  }

  public hasAllPrereqsSettingsDone(): ng.IPromise<boolean> {
    return this.$http.get(this.getConfigTemplatesUrl(), {
      params: {
        filter: `templateType eq "${PREREQS_CONFIG_TEMPLATE_TYPE}" and templateName eq "${PREREQS_CONFIG_TEMPLATE_TYPE}"`,
      },
    }).then((response: ng.IHttpResponse<{ totalResults: string }>) => {
      // notes:
      // - as of 2018-07-23, because CI endpoint stores config property values as strings only, we
      //   convert string to number
      const { totalResults } = response.data;
      return _.parseInt(totalResults) === 1;
    }).catch(() => {
      return false;
    });
  }

  // notes:
  // - this method made public for easier unit-testing
  public toPrereqsSettings(responseData: IPrereqsSettingsResponse): IPrereqsSettings {
    const { id, templateType, templateName, allPrereqsDone } = responseData;
    return {
      id,
      templateType,
      templateName,

      // notes:
      // - as of 2018-07-23, because CI endpoint stores config property values as strings only, we
      //   convert string to boolean
      allPrereqsDone: allPrereqsDone === 'true',
    };
  }
}
