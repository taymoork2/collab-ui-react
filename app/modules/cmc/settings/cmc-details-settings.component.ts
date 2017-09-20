
import { ICmcOrgStatusResponse } from './../cmc.interface';
import { Notification } from 'modules/core/notifications';

class CmcDetailsSettingsComponentCtrl implements ng.IComponentController {

  public orgId;
  public ucProvider = {};
  public mobileProvider = {};

  private timeoutStatus: number = -1;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private Authinfo,
    private CmcService,
    private Notification: Notification,
  ) {
    this.orgId = this.Authinfo.getOrgId();
  }

  public $onInit() {
    this.$log.debug('$onInit');
    this.$log.debug('Authinfo.orgid:', this.Authinfo.getOrgId());
    this.$log.debug('Authinfo.orgname:', this.Authinfo.getOrgName());
    this.$log.warn('prechecking...');

    this.CmcService.preCheckOrg(this.Authinfo.getOrgId())
      .then((res: ICmcOrgStatusResponse) => {
        this.$log.info('Result from preCheckOrg:', res);
        if (res.details && res.details.providers) {
          this.ucProvider = {
            name: res.details.providers.ucProvider.name,
            label: res.details.providers.ucProvider.name,
          };
          this.mobileProvider = {
            name: res.details.providers.mobileProvider.name,
            label: res.details.providers.mobileProvider.name,
          };
        }
      })
      .catch((error: any) => {
        this.$log.info('Error Result from preCheckOrg:', error);
        let msg: string = 'unknown';
        if (error && error.status && error.status === this.timeoutStatus) {
          msg = 'Request Timeout';
        } else if (error.data && error.data.message) {
          msg = error.data.message;
        }
        this.Notification.error('cmc.failures.preCheckFailure', { msg: msg });
      });
  }
}

export class CmcDetailsSettingsComponent implements ng.IComponentOptions {
  public controller = CmcDetailsSettingsComponentCtrl;
  public template = require('modules/cmc/settings/settings.component.html');
  public bindings = { };
}
