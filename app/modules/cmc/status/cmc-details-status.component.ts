
class CmcDetailsStatusComponentCtrl implements ng.IComponentController {

  public orgId;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private Authinfo,
  ) {
    this.orgId = this.Authinfo.getOrgId();
  }

  public $onInit() {
    this.$log.debug('$onInit');
    this.$log.debug('Authinfo.orgid:', this.Authinfo.getOrgId());
    this.$log.debug('Authinfo.orgname:', this.Authinfo.getOrgName());
  }
}

export class CmcDetailsStatusComponent implements ng.IComponentOptions {
  public controller = CmcDetailsStatusComponentCtrl;
  public templateUrl = 'modules/cmc/status/status.tpl.html';
  public bindings = {
  };
}
