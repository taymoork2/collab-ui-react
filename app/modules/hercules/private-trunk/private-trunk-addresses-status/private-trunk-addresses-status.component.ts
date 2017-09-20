import { IDestination } from 'modules/hercules/services/enterprise-private-trunk-service';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { HighLevelStatusForService } from 'modules/hercules/services/hybrid-services-cluster.service';

interface IExtendedDestination extends IDestination {
  cssClass: string;
}

class PrivateTrunkAddressesStatusComponentCtrl implements ng.IComponentController {
  public destinationList: IDestination[];

  /* @ngInject */
  constructor(
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { destinationList } = changes;
    if (destinationList && destinationList.currentValue) {
      this.destinationList = _.map(destinationList.currentValue, (destination: IExtendedDestination) => {
        destination.cssClass = this.HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(destination.state as HighLevelStatusForService);
        return destination;
      });
    }
  }

}

export class PrivateTrunkAddressesStatusComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkAddressesStatusComponentCtrl;
  public template = require('modules/hercules/private-trunk/private-trunk-addresses-status/private-trunk-addresses-status.component.html');
  public bindings = {
    destinationList: '<',
  };
}
