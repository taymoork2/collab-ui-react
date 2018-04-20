import * as URL from 'url';
import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { Notification } from 'modules/core/notifications';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IConnectorUpgrade } from 'modules/hercules/hybrid-services-nodes-page/connector-upgrade-banner/connector-upgrade-banner.component';

interface IUpgrade {
  availableVersion: string;
  connectorName: string;
  connectorUpgrade: IConnectorUpgrade;
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
    private connectorUpgrade: IConnectorUpgrade,
    private Analytics,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    private Notification: Notification,
  ) {
    this.init();
  }

  public upgrade() {
    this.Analytics.trackHybridServiceEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.START_CONNECTOR_UPGRADE, {
      'Cluster Id': this.cluster.id,
      'Connector Type': this.connectorUpgrade.connectorType,
    });
    this.upgrading = true;
    this.HybridServicesClusterService.upgradeSoftware(this.cluster.id, this.connectorUpgrade.connectorType)
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
    this.HybridServicesExtrasService.getReleaseNotes(this.cluster.releaseChannel, this.connectorUpgrade.connectorType)
      .then((releaseNotes) => {
        const availableVersion = _.find(this.cluster.provisioning, { connectorType: this.connectorUpgrade.connectorType }).availableVersion;
        const urlParts = URL.parse(releaseNotes);
        const releaseNotesUrl = urlParts.hostname !== null ? urlParts.href : '';
        this.upgradeInfo = {
          availableVersion: availableVersion,
          connectorName: this.$translate.instant(`hercules.shortConnectorNameFromConnectorType.${this.connectorUpgrade.connectorType}`),
          connectorUpgrade: this.connectorUpgrade,
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
    require('modules/core/analytics'),
    require('modules/core/notifications').default,
    require('modules/hercules/services/hybrid-services-cluster.service').default,
    require('modules/hercules/services/hybrid-services-extras.service').default,
    require('modules/hercules/services/uss.service').default,
  ])
  .controller('ConnectorUpgradeController', ConnectorUpgradeController)
  .name;
