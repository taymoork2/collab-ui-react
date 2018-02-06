import { Notification } from 'modules/core/notifications';

export class WebexSiteManagementController {
  private _allowSiteManagementByCustomer: boolean = true;
  private orgId: string;
  /* @ngInject */
  constructor (private Orgservice, Authinfo, private Notification: Notification) {
    this.orgId = Authinfo.getOrgId();
    const params = {
      basicInfo: true,
    };
    Orgservice.getOrg((data) => {
      this._allowSiteManagementByCustomer = _.get(data, 'orgSettings.allowSiteManagementByCustomer', true);
    }, this.orgId, params);
  }

  get allowSiteManagementByCustomer(): boolean {
    return this._allowSiteManagementByCustomer;
  }

  set allowSiteManagementByCustomer(value: boolean) {
    this._allowSiteManagementByCustomer = value;
    const settings = {
      allowSiteManagementByCustomer: value,
    };
    this.Orgservice.setOrgSettings(this.orgId, settings).then(() => {
      this.Notification.success('globalSettings.webexSiteManagement.siteManagementSettingUpdated');
    }).catch(response => {
      this.Notification.errorResponse(response);
    });
  }
}
