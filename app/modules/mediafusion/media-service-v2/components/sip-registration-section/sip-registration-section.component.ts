import { ICluster, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';

class SipRegistrationSectionCtrl implements ng.IComponentController {

  public hasMfPhaseTwoToggle: boolean;
  public hasMfTrustedSipToggle: boolean;
  public clusterId: string;
  public cluster: ICluster;
  public sipConfigUrl: string | undefined;

  public sipRegistration = {
    title: 'mediaFusion.sipconfiguration.title',
  };

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { cluster } = changes;
    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
      this.clusterId = this.cluster.id;
      this.getProperties(this.clusterId);
    }
  }

  private getProperties(clusterId): void {
    this.HybridServicesClusterService.getProperties(clusterId)
      .then((properties: IClusterPropertySet) => {
        const sipTrunkUrl = properties['mf.ucSipTrunk'];
        this.sipConfigUrl = sipTrunkUrl ? sipTrunkUrl : this.sipConfigUrl;
      });
  }

  public saveSipTrunk(): void {
    const payload: IClusterPropertySet = {
      'mf.ucSipTrunk': this.sipConfigUrl,
    };
    this.HybridServicesClusterService.setProperties(this.clusterId, payload)
      .then(() => {
        this.Notification.success('mediaFusion.sipconfiguration.success');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

}

export class SipRegistrationSectionComponent implements ng.IComponentOptions {
  public controller = SipRegistrationSectionCtrl;
  public template = require('./sip-registration-section.tpl.html');
  public bindings = {
    cluster: '<',
  };
}

