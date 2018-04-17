import { ConnectorType, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { IExtendedStatusByClusters } from 'modules/hercules/services/uss.service';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';

import './card-capacity-bar.scss';

class CardCapacityBarController implements ng.IComponentController {
  public connectorType: ConnectorType;
  public capacity = 0;
  public maxUsers = 0;
  public tooltip: string = '';
  public tooltipAriaLabel: string = '';
  public progressBarType: 'success' | 'warning' | 'danger' = 'success';

  private unassignedClusters: IExtendedClusterFusion[];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (changes.clusters && changes.clusters.currentValue) {
      const clusters: IExtendedClusterFusion[] = changes.clusters.currentValue;

      // We only display the capacity bar for clusters not in resource groups
      this.unassignedClusters = _.filter(clusters, cluster => !cluster.resourceGroupId);
    }

    if (changes.summary && changes.summary.currentValue) {
      const summaries: IExtendedStatusByClusters[] = changes.summary.currentValue;

      const capacityInfo = this.HybridServicesExtrasService.getCapacityInformation(this.unassignedClusters, this.connectorType, summaries);

      this.capacity = capacityInfo.capacity;
      this.maxUsers = capacityInfo.maxUsers;
      this.progressBarType = capacityInfo.progressBarType;
      this.tooltip = this.$translate.instant('hercules.capacity.tooltip', {
        capacity: this.capacity,
        total: capacityInfo.users,
        max: this.maxUsers,
      });
    }
  }
}

export class CardCapacityBarComponent implements ng.IComponentOptions {
  public controller = CardCapacityBarController;
  public template = `
    <div ng-if="$ctrl.maxUsers > 0" tabindex="0" tooltip-html-unsafe="{{$ctrl.tooltip}}" tooltip-trigger="mouseenter focus" class="capacity-container" aria-label="{{$ctrl.tooltipAriaLabel}}">
      <div class="capacity-label" translate="hercules.capacity.label" translate-value-capacity="{{$ctrl.capacity}}"></div>
      <div class="progressbar-container"><progressbar max="100" value="$ctrl.capacity" type="{{$ctrl.progressBarType}}"></progressbar></div>
    </div>
  `;
  public bindings = {
    connectorType: '<',
    clusters: '<',
    summary: '<',
  };
}
