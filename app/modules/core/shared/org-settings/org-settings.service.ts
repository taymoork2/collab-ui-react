interface IOrgSettingsResponse {
  orgSettings: string[];
}

interface IAnyObject {
  [key: string]: any;
}

export class FileShareControl {
  public desktopFileShareControl: FileShareControlType;
  public mobileFileShareControl: FileShareControlType;
  public webFileShareControl: FileShareControlType;
  public botFileShareControl: FileShareControlType;

  constructor(settings: IAnyObject = {}) {
    this.desktopFileShareControl = _.get(settings, 'desktopFileShareControl', FileShareControlType.NONE);
    this.mobileFileShareControl = _.get(settings, 'mobileFileShareControl', FileShareControlType.NONE);
    this.webFileShareControl = _.get(settings, 'webFileShareControl', FileShareControlType.NONE);
    this.botFileShareControl = _.get(settings, 'botFileShareControl', FileShareControlType.NONE);
  }
}

export enum FileShareControlType {
  BLOCK_BOTH = 'BLOCK_BOTH',
  BLOCK_UPLOAD = 'BLOCK_UPLOAD',
  NONE = 'NONE',
}

enum OrgSetting {
  BLOCK_EXTERNAL_COMMUNICATIONS = 'blockExternalCommunications',
  CLIENT_SECURITY_POLICY = 'clientSecurityPolicy',
  WHITEBOARD_FILE_SHARE_CONTROL = 'whiteboardFileShareControl',
}

export class OrgSettingsService {
  private adminServiceUrl = this.UrlConfig.getAdminServiceUrl();

  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
  ) {}

  private getSettingsUrl(orgId: string): string {
    return `${this.adminServiceUrl}organizations/${orgId}/settings`;
  }

  public getSettings(orgId: string): ng.IPromise<IAnyObject> {
    const url = this.getSettingsUrl(orgId);
    return this.$http.get<IOrgSettingsResponse>(url).then(response => {
      return JSON.parse(response.data.orgSettings[0]);
    });
  }

  public updateLatestSettings(orgId: string, settings: IAnyObject): ng.IHttpPromise<void> {
    return this.getSettings(orgId).then(response => {
      const payload = _.assignIn({}, response, settings);
      const url = this.getSettingsUrl(orgId);
      return this.$http.patch<void>(url, payload);
    });
  }

  public getClientSecurityPolicy(orgId: string): ng.IPromise<boolean> {
    return this.getSpecificSetting(orgId, OrgSetting.CLIENT_SECURITY_POLICY).then(response => {
      if (_.isUndefined(response)) {
        return false;
      }
      return response;
    });
  }

  public setClientSecurityPolicy(orgId: string, clientSecurityPolicy: boolean): ng.IHttpPromise<void> {
    const payload = {
      [OrgSetting.CLIENT_SECURITY_POLICY]: clientSecurityPolicy,
    };
    return this.setSpecificSetting(orgId, OrgSetting.CLIENT_SECURITY_POLICY, payload);
  }

  public getBlockExternalCommunications(orgId: string): ng.IPromise<boolean> {
    return this.getSpecificSetting(orgId, OrgSetting.BLOCK_EXTERNAL_COMMUNICATIONS).then(response => {
      if (_.isUndefined(response)) {
        return false;
      }
      return response;
    });
  }

  public setBlockExternalCommunications(orgId: string, blockExternalCommunications: boolean): ng.IHttpPromise<void> {
    const payload = {
      [OrgSetting.BLOCK_EXTERNAL_COMMUNICATIONS]: blockExternalCommunications,
    };
    return this.setSpecificSetting(orgId, OrgSetting.BLOCK_EXTERNAL_COMMUNICATIONS, payload);
  }

  public getFileShareControl(orgId: string): ng.IPromise<FileShareControl> {
    return this.getSettings(orgId).then(response => new FileShareControl(response));
  }

  public setFileShareControl(orgId: string, fileShareControl: FileShareControl): ng.IHttpPromise<void> {
    return this.updateLatestSettings(orgId, fileShareControl);
  }

  private getSpecificSetting(orgId: string, orgSetting: OrgSetting): ng.IPromise<any> {
    const url = `${this.getSettingsUrl(orgId)}/${orgSetting}`;
    return this.$http.get(url).then(response => {
      return response.data[orgSetting];
    });
  }

  private setSpecificSetting(orgId: string, orgSetting: OrgSetting, payload: any) {
    const url = `${this.getSettingsUrl(orgId)}/${orgSetting}`;
    return this.$http.put<void>(url, payload);
  }
}
