
class CmcDetailsSettingsComponentCtrl implements ng.IComponentController {

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

export class CmcDetailsSettingsComponent implements ng.IComponentOptions {
  public controller = CmcDetailsSettingsComponentCtrl;
  public templateUrl = 'modules/cmc/settings/settings.component.html';
  public bindings = { };
}
