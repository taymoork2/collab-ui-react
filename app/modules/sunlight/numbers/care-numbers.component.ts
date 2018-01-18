import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

class CareNumbersCtrl implements ng.IComponentController {

  public trunks: boolean = false;
  public eptStatus: boolean = false;
  public hasCall: boolean = false;
  public loading: boolean = false;

  /* @ngInject */
  constructor(
    private Authinfo,
    private $q: ng.IQService,
    private PrivateTrunkService: PrivateTrunkService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}

  public $onInit() {
    this.hasCall = this.Authinfo.hasCallLicense();

    this.loading = true;

    this.$q.all({
      pt: this.PrivateTrunkService.getPrivateTrunk(),
      ept: this.ServiceDescriptorService.getServiceStatus('ept'),
    }).then((response) => {
      this.trunks = response.pt.resources.length !== 0;
      this.eptStatus = response.ept.state !== 'unknown';
    }).finally(() => this.loading = false);
  }
}

export class CareNumbersComponent implements ng.IComponentOptions {
  public controller = CareNumbersCtrl;
  public template = require('modules/sunlight/numbers/care-numbers.component.html');
  public bindings = {};
}
