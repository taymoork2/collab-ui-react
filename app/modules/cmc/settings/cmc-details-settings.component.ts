
import { ICmcOrgStatusResponse } from './../cmc.interface';

class CmcDetailsSettingsComponentCtrl implements ng.IComponentController {

  public orgId;
  public ucProvider = {};
  public mobileProvider = {};

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private Authinfo,
    private CmcService,
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
      });
  }
}

export class CmcDetailsSettingsComponent implements ng.IComponentOptions {
  public controller = CmcDetailsSettingsComponentCtrl;
  public templateUrl = 'modules/cmc/settings/settings.component.html';
  public bindings = { };
}
