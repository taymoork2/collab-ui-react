import { Notification } from 'modules/core/notifications';

export class WebexSiteManagementController {
  private _allowSiteManagementByCustomer: boolean = false;
  private orgId: string;
  /* @ngInject */
  constructor (private Orgservice, Authinfo, private Notification: Notification) {
    this.orgId = Authinfo.getOrgId();
    Orgservice.getAllowCustomerSiteManagementSetting(this.orgId).then((data) => {
      this._allowSiteManagementByCustomer = _.get(data, 'orgSettings.allowSiteManagementByCustomer', true);
    });
  }

  get allowSiteManagementByCustomer(): boolean {
    return this._allowSiteManagementByCustomer;
  }

  set allowSiteManagementByCustomer(value: boolean) {
    this._allowSiteManagementByCustomer = value;
    const setting = {
      allowSiteManagementByCustomer: value,
    };

    this.Orgservice.setAllowCustomerSiteManagementSetting(this.orgId, setting).then(() => {
      this.Notification.success('globalSettings.webexSiteManagement.siteManagementSettingUpdated');
    }).catch(response => {
      this.Notification.errorResponse(response);
    });
  }
}
