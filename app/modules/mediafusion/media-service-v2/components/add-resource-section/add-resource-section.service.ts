import { FeatureToggleService } from 'modules/core/featureToggle';
import { IExtendedClusterFusion, HybridServiceId, ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { Notification } from 'modules/core/notifications/notification.service';

export class AddResourceSectionService {

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService: FeatureToggleService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    private MediaClusterServiceV2,
    private MediaServiceActivationV2,
    private Notification: Notification,
    private Orgservice,
  ) { }

  private clusterDetail: ICluster;
  public clusterList: string[] = [];
  private clusters: IExtendedClusterFusion[];
  public currentServiceId: HybridServiceId = 'squared-fusion-media';
  public enableRedirectToTarget: boolean = false;
  public firstTimeSetup: boolean;
  public fromClusters: boolean;
  public hostName: string;
  public offlineNodeList: string[] = [];
  public onlineNodeList: string[] = [];
  public ovaType: string = '1';
  public noProceed: boolean = false;
  public proPackEnabled: boolean;
  public qosPropertySetId = null;
  public selectedCluster: string = '';
  private selectedClusterId: string;
  public showDownloadableOption: boolean;
  public radio: string = '1';
  public releaseChannel: string = 'stable';
  public videoPropertySetId = null;
  public yesProceed: boolean;
  public hasMfQosFeatureToggle: boolean = false;
  public qosOrgState: boolean = false;

  public getClusterList() {
    return this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        return this.clusters = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
      })
      .catch(() => []);
  }

  public updateClusterLists() {
    const clusterList: any = [];
    return this.getClusterList()
      .then((clusters) => {
        _.forEach(clusters, (cluster) => {
          clusterList.push(cluster.name);
          _.forEach(cluster.connectors, (connector) => {
            if ('running' === connector.state) {
              this.onlineNodeList.push(connector.hostname);
            } else {
              this.offlineNodeList.push(connector.hostname);
            }
          });
        });
        this.clusterList = clusterList;
        this.clusterList = _.sortBy(this.clusterList, (cluster) => {
          return cluster.toLowerCase();
        });
        return this.clusterList;
      });
  }

  public onlineNodes() {
    return this.onlineNodeList;
  }

  public offlineNodes() {
    return this.offlineNodeList;
  }
  public addRedirectTargetClicked(hostName: string, enteredCluster) {
    //Checking if value in selected cluster is in cluster list
    this.clusterDetail = _.find(this.clusters, { name: enteredCluster });
    if (_.isUndefined(this.clusterDetail)) {
      return this.HybridServicesClusterService.preregisterCluster(enteredCluster, 'stable', 'mf_mgmt')
        .then((resp) => {
          this.clusterDetail = resp;
          this.selectedClusterId = resp.id;
          // Add the created cluster to property set
          this.MediaClusterServiceV2.getPropertySets()
            .then((propertySets) => {
              if (propertySets.length > 0) {
                const videoPropertySet = _.filter(propertySets, {
                  name: 'videoQualityPropertySet',
                });
                if (videoPropertySet.length > 0) {
                  const clusterPayload = {
                    assignedClusters: this.selectedClusterId,
                  };
                  // Assign it the property set with cluster list
                  this.MediaClusterServiceV2.updatePropertySetById(videoPropertySet[0]['id'], clusterPayload);
                } else if (videoPropertySet.length === 0) {
                  this.videoPropertySetsForOrg();
                }
                this.qosFeatureToggle().then(() => {
                  if (this.hasMfQosFeatureToggle) {
                    const qosPropertySet = _.filter(propertySets, {
                      name: 'qosPropertySet',
                    });
                    if (qosPropertySet.length > 0) {
                      const clusterQosPayload = {
                        assignedClusters: this.selectedClusterId,
                      };
                      // Assign it the property set with cluster list
                      this.MediaClusterServiceV2.updatePropertySetById(qosPropertySet[0]['id'], clusterQosPayload);
                    } else if (qosPropertySet.length === 0) {
                      this.qosPropertySetsForOrg();
                    }
                  }
                });
              } else if (propertySets.length === 0) {
                this.propertySetsForOrg();
              }
            });
          return this.whiteListHost(hostName, this.selectedClusterId);
        })
        .catch((error) => {
          const errorMessage = this.$translate.instant('mediaFusion.clusters.clusterCreationFailed', {
            enteredCluster: enteredCluster,
          });
          this.Notification.errorWithTrackingId(error, errorMessage);
        });
    } else {
      this.releaseChannel = this.clusterDetail.releaseChannel;
      this.selectedClusterId = this.clusterDetail.id;
      return this.whiteListHost(hostName, this.selectedClusterId);
    }
  }

  public selectedClusterDetails() {
    return this.clusterDetail;
  }

  public selectClusterId() {
    return this.selectedClusterId;
  }

  private whiteListHost(hostName, clusterId) {
    return this.HybridServicesExtrasService.addPreregisteredClusterToAllowList(hostName, clusterId);
  }

  public redirectPopUpAndClose(hostName, enteredCluster, releaseChannel) {
    if (!_.isUndefined(releaseChannel)) { this.releaseChannel = releaseChannel; }
    this.$window.open('https://' + encodeURIComponent(hostName) + '/?clusterName=' + encodeURIComponent(enteredCluster) + '&clusterId=' + encodeURIComponent(this.selectedClusterId) + '&channel=' + encodeURIComponent(this.releaseChannel));
  }

  public enableMediaServiceEntitlements() {
    return this.MediaServiceActivationV2.enableMediaServiceEntitlementsWizard();
  }

  public enableMediaService() {
    return this.MediaServiceActivationV2.enableMediaService(this.currentServiceId);
  }

  private propertySetsForOrg() {
    this.videoPropertySetsForOrg();
    this.qosPropertySetsForOrg();
  }

  private videoPropertySetsForOrg() {
    const payLoad = {
      type: 'mf.group',
      name: 'videoQualityPropertySet',
      properties: {
        'mf.videoQuality': 'false',
      },
    };
    return this.MediaClusterServiceV2.createPropertySet(payLoad)
      .then((response) => {
        this.videoPropertySetId = response.data.id;
        const clusterPayload = {
          assignedClusters: _.map(this.clusters, 'id'),
        };
        this.MediaClusterServiceV2.updatePropertySetById(this.videoPropertySetId, clusterPayload)
          .catch((error) => {
            this.Notification.errorWithTrackingId(error, 'mediaFusion.videoQuality.error');
          });
      });
  }
  private qosPropertySetsForOrg() {
    if (this.hasMfQosFeatureToggle) {
      this.qosOrgValue().then((response) => {
        this.qosOrgState = response;
        const qospayLoad = {
          type: 'mf.group',
          name: 'qosPropertySet',
          properties: {
            'mf.qos': this.qosOrgState,
          },
        };
        return this.MediaClusterServiceV2.createPropertySet(qospayLoad)
          .then((response) => {
            this.qosPropertySetId = response.data.id;
            const qosclusterPayload = {
              assignedClusters: _.map(this.clusters, 'id'),
            };
            this.MediaClusterServiceV2.updatePropertySetById(this.qosPropertySetId, qosclusterPayload)
              .catch((error) => {
                this.Notification.errorWithTrackingId(error, 'mediaFusion.qos.error');
              });
          });
      });
    }
  }
  private qosFeatureToggle = () => {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceQos).then( (supported) => {
      this.hasMfQosFeatureToggle = supported;
    });
  }

  public qosOrgValue() {
    const params = {
      disableCache: true,
    };
    return this.Orgservice.getOrg(_.noop, null, params)
      .then(response => {
        return _.get(response.data, 'orgSettings.isMediaFusionQosEnabled', false);
      });
  }
}
