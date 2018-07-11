const serviceSchemas: string[] = ['urn:cisco:codev:identity:template:core:1.0'];
const profileTemplate: object = { schemas: serviceSchemas, templateType: 'jabber' };

export interface IJabberProfile {
  schemas: string[];
  id: string;
  meta: object;
  templateType: string;
  templateName: string;
  VoiceMailServer: string;
  CUCMServer: string;
  BackupVoiceMailServer: string;
  VoiceServicesDomain: string;
  BackupCUCMServer: string;
  cisEntryCreator: string;
  cisEntryModifier: string;
}
/* Instance of a User */
export class JabberProfile implements IJabberProfile {
  public schemas: string[];
  public id: string;
  public meta: object;
  public templateType: string;
  public templateName: string;
  public VoiceMailServer: string;
  public CUCMServer: string;
  public BackupVoiceMailServer: string;
  public VoiceServicesDomain: string;
  public BackupCUCMServer: string;
  public cisEntryCreator: string;
  public cisEntryModifier: string;

  constructor(obj: IJabberProfile = {
    schemas: serviceSchemas,
    id: '',
    meta: {},
    templateType: '',
    templateName: '',
    VoiceMailServer: '',
    CUCMServer: '',
    BackupVoiceMailServer: '',
    VoiceServicesDomain: '',
    BackupCUCMServer: '',
    cisEntryCreator: '',
    cisEntryModifier: '',
  }) {
    _.extend(this, obj);
  }
}

export class JabberProfileService {
  private baseURl = 'https://identity.webex.com/organization';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
  ) {}

  public getUrl() {
    return `${this.baseURl}/${this.Authinfo.getOrgId()}/v1/config/templates`;
  }

  public getAuthorization() {
    return 'Bearer ' + self.sessionStorage.accessToken;
  }

  public create(profileName: string, voiceServerDomainName: string, udsServerAddress: string, udsBackupServerAddress: string ): ng.IPromise<IJabberProfile> {
    const requestData = {};
    _.merge(requestData, profileTemplate);
    _.merge(requestData, { templateName: profileName, VoiceMailServer: voiceServerDomainName, CUCMServer: udsServerAddress, BackupCUCMServer: udsBackupServerAddress });
    return this.$http.post(this.getUrl(), requestData, {
      headers: {
        Accept: 'application/json',
        Authorization: this.getAuthorization(),
      },
    }).then((response) => {
      const profile: IJabberProfile = new JabberProfile();
      _.extend(profile, <IJabberProfile>response.data);
      return profile;
    });
  }
}

export default JabberProfileService;
