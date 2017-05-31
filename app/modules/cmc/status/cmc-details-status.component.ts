import { ICmcOrgStatusResponse } from './../cmc.interface';

class CmcDetailsStatusComponentCtrl implements ng.IComponentController {

  public orgId;
  public status: ICmcOrgStatusResponse;
  public error: any;

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
    this.CmcService.preCheckOrg(this.Authinfo.getOrgId())
      .then((res: ICmcOrgStatusResponse) => {
        this.$log.info('Result from preCheckOrg:', res);
        this.status = res;
      })
      .catch((error) => {
        this.$log.info('Error Result from preCheckOrg:', error);
        this.error = error.data;
      })
    ;
  }
}

export class CmcDetailsStatusComponent implements ng.IComponentOptions {
  public controller = CmcDetailsStatusComponentCtrl;
  public templateUrl = 'modules/cmc/status/status.component.html';
  public bindings = {
  };
}
