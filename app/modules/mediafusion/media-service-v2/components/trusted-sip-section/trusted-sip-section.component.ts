import { ICluster, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { ClusterService } from 'modules/hercules/services/cluster-service';
import { Notification } from 'modules/core/notifications';

interface ITag {
  text: string;
}

class TrustedSipSectionCtrl implements ng.IComponentController {

  public hasMfTrustedSipToggle: boolean;
  public clusterId: string;
  public cluster: ICluster;

  public trustedsipconfiguration: ITag[] = [];

  public trustedSip = {
    title: 'mediaFusion.trustedSip.title',
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
        let rawTrustedSipConfigurationData;
        if (!_.isUndefined(properties['mf.trustedSipSources'])) {
          rawTrustedSipConfigurationData = properties['mf.trustedSipSources'];
        }
        let sipArray: ITag[] = [];
        if (!_.isUndefined(rawTrustedSipConfigurationData)) {
          sipArray = _.map(rawTrustedSipConfigurationData.split(','), (value: string) => {
            return {
              text: value.trim(),
            };
          }) as ITag[];
        }
        if (rawTrustedSipConfigurationData !== '') {
          this.trustedsipconfiguration = sipArray;
        } else {
          this.trustedsipconfiguration = [];
        }
      });
  }

  public saveTrustedSip() {
    const payload: IClusterPropertySet = {
      'mf.trustedSipSources': _.map(this.trustedsipconfiguration, 'text').join(', '),
    };
    this.ClusterService.setProperties(this.clusterId, payload)
      .then(() => {
        this.Notification.success('mediaFusion.trustedSip.success');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

}

export class TrustedSipSectionComponent implements ng.IComponentOptions {
  public controller = TrustedSipSectionCtrl;
  public template = require('modules/mediafusion/media-service-v2/components/trusted-sip-section/trusted-sip-section.tpl.html');
  public bindings = {
    cluster: '<',
  };
}

export default angular
  .module('Mediafusion')
  .component('trustedSipSection', new TrustedSipSectionComponent())
  .name;
