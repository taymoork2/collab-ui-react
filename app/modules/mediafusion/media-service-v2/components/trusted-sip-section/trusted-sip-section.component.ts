import { ICluster, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
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

  private getProperties(clusterId) {
    this.HybridServicesClusterService.getProperties(clusterId)
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

  public saveTrustedSip(): void {
    const payload: IClusterPropertySet = {
      'mf.trustedSipSources': _.map(this.trustedsipconfiguration, 'text').join(', '),
    };
    this.HybridServicesClusterService.setProperties(this.clusterId, payload)
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
  public template = require('./trusted-sip-section.tpl.html');
  public bindings = {
    cluster: '<',
  };
}

