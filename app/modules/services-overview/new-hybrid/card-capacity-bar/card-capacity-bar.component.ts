import { IExtendedConnector, ConnectorType, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { IExtendedStatusByClusters } from 'modules/hercules/services/uss.service';

import './card-capacity-bar.scss';

class CardCapacityBarController implements ng.IComponentController {
  private relevantClusterIds: string[] = [];
  public connectorType: ConnectorType;
  public capacity = 0;
  public maxUsers = 0;
  public tooltip: string = '';
  public tooltipAriaLabel: string = '';
  public progressBarType: 'success' | 'warning' | 'danger' = 'success';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (changes.clusters && changes.clusters.currentValue) {
      const clusters: IExtendedClusterFusion[] = changes.clusters.currentValue;

      // We only display the capacity bar for clusters not in resource groups
      const unassignedClusters = _.filter(clusters, cluster => !cluster.resourceGroupId);

      // we can read the user capacity directly from each connectors
      this.maxUsers = _.chain(unassignedClusters)
        .map(cluster => cluster.connectors)
        .flatten<IExtendedConnector>()
        .filter(connector => connector.connectorType === this.connectorType)
        .map(connector => connector.userCapacity)
        .sum()
        .value();

      // Keeping the relevant cluster ids around is useful to read users stt=atuses
      this.relevantClusterIds = _.map(unassignedClusters, 'id');
    }

    if (changes.summary && changes.summary.currentValue) {
      const summary: IExtendedStatusByClusters[] = changes.summary.currentValue;

      let users = 0;
      if (summary.length > 0) {
        users = _.sum(_.map(summary, summary => {
          if (_.includes(this.relevantClusterIds, summary.id)) {
            return summary.users;
          }
          return 0;
        }));
      }
      this.capacity = Math.ceil(users / this.maxUsers * 100);
      if (this.capacity > 90) {
        this.progressBarType = 'danger';
      } else if (this.capacity > 60) {
        this.progressBarType = 'warning';
      }
      this.tooltip = this.$translate.instant('hercules.capacity.toolTip', {
        capacity: this.capacity,
        total: users,
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
