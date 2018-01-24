import * as URL from 'url';
import { ConnectorType, ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { Notification } from 'modules/core/notifications';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

interface IUpgrade {
  connectorType: ConnectorType;
  connectorName: string;
  availableVersion: string;
  releaseNotes: string;
  releaseNotesUrl: string | undefined;
}

export class ConnectorUpgradeController {
  public upgrading = false;
  public upgradeInfo: IUpgrade;

  /* @ngInject */
  constructor(
    private $modalInstance,
    private $translate: ng.translate.ITranslateService,
    private cluster: ICluster,
    private connectorType: ConnectorType,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    private Notification: Notification,
  ) {
    this.init();
  }

  public upgrade() {
    this.upgrading = true;
    this.HybridServicesClusterService.upgradeSoftware(this.cluster.id, this.connectorType)
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
    this.HybridServicesExtrasService.getReleaseNotes(this.cluster.releaseChannel, this.connectorType)
      .then((releaseNotes) => {
        const availableVersion = _.find(this.cluster.provisioning, { connectorType: this.connectorType }).availableVersion;
        const urlParts = URL.parse(releaseNotes);
        const releaseNotesUrl = urlParts.hostname !== null ? urlParts.href : '';
        this.upgradeInfo = {
          connectorType: this.connectorType,
          connectorName: this.$translate.instant(`hercules.shortConnectorNameFromConnectorType.${this.connectorType}`),
          availableVersion: availableVersion,
          releaseNotes: releaseNotes,
          releaseNotesUrl: releaseNotesUrl,
        };
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
    require('modules/hercules/services/hybrid-services-cluster.service').default,
    require('modules/hercules/services/hybrid-services-extras.service').default,
    require('modules/hercules/services/uss.service').default,
  ])
  .controller('ConnectorUpgradeController', ConnectorUpgradeController)
  .name;
