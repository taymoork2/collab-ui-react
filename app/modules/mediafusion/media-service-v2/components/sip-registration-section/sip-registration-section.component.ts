import { ICluster, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { ClusterService } from 'modules/hercules/services/cluster-service';
import { Notification } from 'modules/core/notifications';

class SipRegistrationSectionCtrl implements ng.IComponentController {

  public hasMfPhaseTwoToggle: boolean;
  public hasMfTrustedSipToggle: boolean;
  public clusterId: string;
  public cluster: ICluster;
  public sipurlconfiguration: string | undefined;

  public sipRegistration = {
    title: 'mediaFusion.sipconfiguration.title',
  };

  /* @ngInject */
  constructor(
    private ClusterService: ClusterService,
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

  private getProperties(clusterId) {
    this.ClusterService.getProperties(clusterId)
      .then((properties: IClusterPropertySet) => {
        if (!_.isUndefined(properties['mf.ucSipTrunk'])) {
          this.sipurlconfiguration = properties['mf.ucSipTrunk'];
        }
      });
  }

  public saveSipTrunk() {
    const payload: IClusterPropertySet = {
      'mf.ucSipTrunk': this.sipurlconfiguration,
    };
    this.ClusterService.setProperties(this.clusterId, payload)
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
  public template = require('modules/mediafusion/media-service-v2/components/sip-registration-section/sip-registration-section.tpl.html');
  public bindings = {
    cluster: '<',
  };
}

export default angular
  .module('Mediafusion')
  .component('sipRegistrationSection', new SipRegistrationSectionComponent())
  .name;
