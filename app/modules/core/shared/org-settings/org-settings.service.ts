import { IFileShareControl, IOrgSettingsResponse, OrgSetting, WhiteboardFileShareControlType } from './org-settings.types';
import { OrgSettingsUtil } from './org-settings.util';

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

  public getSettings(orgId: string): ng.IPromise<object> {
    const url = this.getSettingsUrl(orgId);
    return this.$http.get<IOrgSettingsResponse>(url).then(response => {
      return JSON.parse(response.data.orgSettings[0]);
    });
  }

  public updateLatestSettings(orgId: string, settings: object): ng.IHttpPromise<void> {
    return this.getSettings(orgId).then(response => {
      const payload = _.assignIn({}, response, settings);
      const url = this.getSettingsUrl(orgId);
      return this.$http.patch<void>(url, payload);
    });
  }

  public getSipCloudDomain(orgId: string): ng.IPromise<string | undefined> {
    return this.getSettings(orgId)
      .then(settings => settings['sipCloudDomain']);
  }

  public getClientSecurityPolicy(orgId: string): ng.IPromise<boolean> {
    return this.getSpecificSetting<boolean>(orgId, OrgSetting.CLIENT_SECURITY_POLICY).then(response => {
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
    return this.getSpecificSetting<boolean>(orgId, OrgSetting.BLOCK_EXTERNAL_COMMUNICATIONS).then(response => {
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

  public getWhiteboardFileShareControl(orgId: string): ng.IPromise<WhiteboardFileShareControlType> {
    return this.getSpecificSetting<WhiteboardFileShareControlType>(orgId, OrgSetting.WHITEBOARD_FILE_SHARE_CONTROL).then(response => {
      if (_.isUndefined(response)) {
        return WhiteboardFileShareControlType.BLOCK;
      }
      return response;
    });
  }

  public setWhiteboardFileShareControl(orgId: string, whiteboardFileShareControl: WhiteboardFileShareControlType): ng.IHttpPromise<void> {
    const payload = {
      [OrgSetting.WHITEBOARD_FILE_SHARE_CONTROL]: whiteboardFileShareControl,
    };
    return this.setSpecificSetting(orgId, OrgSetting.WHITEBOARD_FILE_SHARE_CONTROL, payload);
  }

  public getFileShareControl(orgId: string): ng.IPromise<IFileShareControl> {
    return this.getSettings(orgId).then(response => OrgSettingsUtil.mkFileShareControl(response));
  }

  public setFileShareControl(orgId: string, fileShareControl: IFileShareControl): ng.IHttpPromise<void> {
    return this.updateLatestSettings(orgId, fileShareControl);
  }

  private getSpecificSetting<T>(orgId: string, orgSetting: OrgSetting): ng.IPromise<T> {
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
