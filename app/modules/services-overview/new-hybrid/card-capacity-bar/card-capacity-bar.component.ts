import { IExtendedConnector, ConnectorType, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { IExtendedStatusSummary } from 'modules/hercules/services/uss.service';

import './card-capacity-bar.scss';

class CardCapacityBarController implements ng.IComponentController {
  public connectorType: ConnectorType;
  public capacity = 0;
  public maxUsers = 0;
  public tooltip: string = '';
  public progressBarType: 'success' | 'warning' | 'danger' = 'success';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (changes.clusters && changes.clusters.currentValue) {
      const clusters: IExtendedClusterFusion[] = changes.clusters.currentValue;
      this.maxUsers = _.chain(clusters)
        .filter(cluster => !cluster.resourceGroupId)
        .map(cluster => cluster.connectors)
        .flatten<IExtendedConnector>()
        .filter(connector => connector.connectorType === this.connectorType)
        .map(connector => connector.userCapacity)
        .sum()
        .value();
    }
    if (changes.summary && changes.summary.currentValue) {
      const summary: IExtendedStatusSummary[] = changes.summary.currentValue;
      if (summary.length > 0) {
        // TODO: handle summary with mutiple entries
        this.capacity = Math.ceil(summary[0].total / this.maxUsers * 100);
        if (this.capacity > 90) {
          this.progressBarType = 'danger';
        } else if (this.capacity > 60) {
          this.progressBarType = 'warning';
        }
        this.tooltip = this.$translate.instant('hercules.capacity.toolTip', {
          capacity: this.capacity,
          total: summary[0].total,
          max: this.maxUsers,
        });
      }
    }
  }
}

export class CardCapacityBarComponent implements ng.IComponentOptions {
  public controller = CardCapacityBarController;
  // TODO: proper translation
  public template = `
    <div tooltip-html-unsafe="{{$ctrl.tooltip}}" class="capacity-container">
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
