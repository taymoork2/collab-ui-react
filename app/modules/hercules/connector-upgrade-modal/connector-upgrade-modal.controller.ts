import * as URL from 'url';
import { ClusterService } from 'modules/hercules/services/cluster-service';
import { ConnectorType, ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { Notification } from 'modules/core/notifications';

interface IUpgrade {
  connectorType: ConnectorType;
  connectorName: string;
  availableVersion: string;
  releaseNotes: string;
  releaseNotesUrl: string | undefined;
}

export class ConnectorUpgradeController {
  public upgrading = false;
  public upgrades: IUpgrade[];

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $modalInstance,
    private $translate: ng.translate.ITranslateService,
    private cluster: ICluster,
    private connectorTypes: ConnectorType[],
    private ClusterService: ClusterService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    private Notification: Notification,
  ) {
    this.init();
  }

  public upgrade() {
    this.upgrading = true;
    this.$q.all(_.map(this.connectorTypes, (connectorType) => this.ClusterService.upgradeSoftware(this.cluster.id, connectorType)))
      .then(() => {
        this.$modalInstance.close();
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      })
      .finally(() => {
        this.upgrading = false;
      });
  }

  private init(): void {
    const promises = _.map(this.connectorTypes, (connectorType) => {
      return this.HybridServicesExtrasService.getReleaseNotes(this.cluster.releaseChannel, connectorType);
    });
    this.$q.all(promises)
      .then((releaseNotes) => {
        this.upgrades = _.map(this.connectorTypes, (connectorType, i) => {
          const availableVersion = _.find(this.cluster.provisioning, { connectorType: connectorType }).availableVersion;
          const urlParts = URL.parse(releaseNotes[i]);
          const releaseNotesUrl = urlParts.hostname !== null ? urlParts.href : '';
          return {
            connectorType: connectorType,
            connectorName: this.$translate.instant(`hercules.connectorNameFromConnectorType.${connectorType}`),
            availableVersion: availableVersion,
            releaseNotes: releaseNotes[i],
            releaseNotesUrl: releaseNotesUrl,
          };
        });
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }
}

export default angular
  .module('hercules.upgrade-modal', [
    require('angular-translate'),
    require('modules/core/notifications').default,
    require('modules/hercules/services/hybrid-services-extras.service').default,
    require('modules/hercules/services/uss-service'),
  ])
  .controller('ConnectorUpgradeController', ConnectorUpgradeController)
  .name;
