/*import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications';

class ClusterCreationSectionCtrl implements ng.IComponentController {

  private modalWindowOptions: any;
  private isPartnerAdmin = false;
  private allowPartnerRegistration: boolean;
  public title: string;

  /* @ngInject */
  /*constructor(
    private $q: ng.IQService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
    private $modal,
    private $state,
    private Authinfo,
    private $translate: ng.translate.ITranslateService,
  ) {  }
  public clusters: string [];
  public clusterList: string [];
  public onlineNodeList: string [];
  public offlineNodeList: string [];
  public clusterNames: string[];
  public clusterIds: string[];
  public serviceId: HybridServiceId = 'squared-fusion-media';
  public clusterCreationSection = {
    title: 'common.deactivate',
  };

  private updateClusterList() {
    return this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        this.clusterList = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
      });
  }

}

// Forming clusterList which contains all cluster name of type mf_mgmt and sorting it.
private updateClusterLists() {
  vm.clusters = null;
  vm.clusterList = [];
  vm.onlineNodeList = [];
  vm.offlineNodeList = [];
  var deferred = $q.defer();
  HybridServicesClusterService.getAll()
    .then(function (clusters) {
      vm.clusters = _.filter(clusters, {
        targetType: 'mf_mgmt',
      });
      _.each(clusters, function (cluster) {
        if (cluster.targetType === 'mf_mgmt') {
          vm.clusterList.push(cluster.name);
          _.each(cluster.connectors, function (connector) {
            if ('running' == connector.state) {
              vm.onlineNodeList.push(connector.hostname);
            } else {
              vm.offlineNodeList.push(connector.hostname);
            }
          });
        }
      });
      vm.clusterList.sort();
      deferred.resolve(vm.clusterList);
    })
    .catch(function (error) {
      Notification.errorWithTrackingId(error, 'mediaFusion.genericError');
    });
  return deferred.promise;
}

class ClusterCreationSectionComponent implements ng.IComponentOptions {
  public controller = ClusterCreationSectionCtrl;
  public template = require('modules/mediafusion/media-service-v2/component/add-resources-section/cluster-creation-dialog.html');
  public bindings = {
  };
}

export default angular
  .module('Mediafusion')
  .component('clusterCreationSection', new ClusterCreationSectionComponent())
  .name;*/
