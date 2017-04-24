import { IDestination } from 'modules/hercules/services/enterprise-private-trunk-service';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

class PrivateTrunkAddressesStatusComponentCtrl implements ng.IComponentController {

  public destinationList: IDestination[];
  public getStatusIndicatorCSSClass = this.HybridServicesClusterStatesService.getStatusIndicatorCSSClass;


  /* @ngInject */
  constructor(
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
  ) {}

  public $onInit() {
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }) {
    const { destinationList } = changes;
    if (destinationList && destinationList.currentValue) {
      this.destinationList = destinationList.currentValue;
    }
  }

}

export class PrivateTrunkAddressesStatusComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkAddressesStatusComponentCtrl;
  public templateUrl = 'modules/hercules/private-trunk/private-trunk-addresses-status/private-trunk-addresses-status.component.html';
  public bindings = {
    destinationList: '<',
  };
}
