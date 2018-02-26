import { IExtendedClusterFusion, HybridServiceId, ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { Notification } from 'modules/core/notifications/notification.service';

export class AddResourceSectionService {

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    //private MediaServiceActivationV2,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private $q: ng.IQService,
    private $window: ng.IWindowService,
    private $translate: ng.translate.ITranslateService,
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
  public selectedCluster: string = '';
  private selectedClusterId: string;
  public showDownloadableOption: boolean;
  public radio: string = '1';
  public yesProceed: boolean;

  private getClusterList() {
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
        _.each(clusters, (cluster) => {
          if (cluster.targetType === 'mf_mgmt') {
            clusterList.push(cluster.name);
            _.each(cluster.connectors, (connector) => {
              if ('running' === connector.state) {
                this.onlineNodeList.push(connector.hostname);
              } else {
                this.offlineNodeList.push(connector.hostname);
              }
            });
          }
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
    _.each(this.clusters, (cluster) => {
      if (cluster.name === enteredCluster) {
        this.clusterDetail = cluster;
      }
    });
    if (_.isUndefined(this.clusterDetail)) {
      const deferred = this.$q.defer();
      this.HybridServicesClusterService.preregisterCluster(enteredCluster, 'stable', 'mf_mgmt')
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
                }
              }
            });
          deferred.resolve(this.whiteListHost(hostName, this.selectedClusterId));
        })
        .catch((error) => {
          const errorMessage = this.$translate.instant('mediaFusion.clusters.clusterCreationFailed', {
            enteredCluster: enteredCluster,
          });
          this.Notification.errorWithTrackingId(error, errorMessage);
        });
      return deferred.promise;
    } else {
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

  public redirectPopUpAndClose(hostName, enteredCluster) {
    this.$window.open('https://' + encodeURIComponent(hostName) + '/?clusterName=' + encodeURIComponent(enteredCluster) + '&clusterId=' + encodeURIComponent(this.selectedClusterId));
  }

  /*public enableMediaServiceEntitlements() {
    return this.MediaServiceActivationV2.enableMediaServiceEntitlements();
  }

  public enableMediaService() {
    return this.MediaServiceActivationV2.enableMediaService(this.currentServiceId);
  }

  public createFirstTimeSetupCluster(hostName, enteredCluster) {
    const deferred = this.$q.defer();
    this.HybridServicesClusterService.preregisterCluster(enteredCluster, 'stable', 'mf_mgmt').then((result) => {
      deferred.resolve();
      this.selectedClusterId = result.id;
      // Cluster created, now creating a property set for video quality
      const payLoad = {
        type: 'mf.group',
        name: 'videoQualityPropertySet',
        properties: {
          'mf.videoQuality': 'false',
        },
      };
      this.MediaClusterServiceV2.createPropertySet(payLoad)
        .then((response) => {
          const videoPropertySetId = response.data.id;
          const clusterPayload = {
            assignedClusters: this.selectedClusterId,
          };
          // Assign it the property set with cluster id
          this.MediaClusterServiceV2.updatePropertySetById(videoPropertySetId, clusterPayload)
            .then('', (err) => {
              this.Notification.errorWithTrackingId(err, 'mediaFusion.videoQuality.error');
            });
        });
      this.whiteListHost(hostName, this.selectedClusterId);
    }, (error) => {
      deferred.reject();
      const errorMessage = this.$translate.instant('mediaFusion.clusters.clusterCreationFailed', {
        enteredCluster: enteredCluster,
      });
      this.Notification.errorWithTrackingId(error, errorMessage);
    });
    return deferred.promise;
  }*/

  /*public redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
    //this.$state.modal.close();
    if (this.firstTimeSetup) {
      this.$q.all(this.enableMediaServiceEntitlements()).then((result) => {
        const resultRhesos = result[0];
        const resultSparkCall = result[1];
        if (!_.isUndefined(resultRhesos) && !_.isUndefined(resultSparkCall)) {
          //create cluster
          //on success call media service activation service enableMediaService
          this.createFirstTimeSetupCluster(hostName, enteredCluster).then(() => {
            //call the rest of the services which needs to be enabled
            this.enableMediaService();
            //this.redirectPopUpAndClose(hostName, enteredCluster);
          }).then(() => {
            this.$state.go('media-service-v2.list');
          });
        } else {
          this.$state.go('services-overview', {}, { reload: true });
        }
      });
    } else {
      this.addRedirectTargetClicked(hostName, enteredCluster).then(() => {
        //this.redirectPopUpAndClose(hostName, enteredCluster);
      });
    }
  }*/
}

