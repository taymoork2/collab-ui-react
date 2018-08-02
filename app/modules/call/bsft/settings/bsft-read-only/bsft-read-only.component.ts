import { RialtoService, FtswConfigService } from 'modules/call/bsft/shared';

class BsftReadOnlyCtrl implements ng.IComponentController {
  public loading: boolean = false;
  public rialtoId;
  public site;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private RialtoService: RialtoService,
    private FtswConfigService: FtswConfigService,
    ) {}

  public $onInit(): void {
    this.loading = true;
    this.$scope.$emit('wizardNextText', 'nextEnterpriseSettings');
    this.$q.resolve(this.initComponentData()).finally( () => this.loading = false);
  }

  public initComponentData() {
    return this.RialtoService.getSites(this.FtswConfigService.getCurrentCustomer().rialtoId)
      .then((response) => {
        this.site = _.find(_.get(response, 'siteList', []), { defaultSite: true });
      });
  }
}

export class BsftReadOnlyComponent implements ng.IComponentOptions {
  public controller = BsftReadOnlyCtrl;
  public template = require('modules/call/bsft/settings/bsft-read-only/bsft-read-only.component.html');
  public bindings = {
    rialtoId: '<',
  };
}
