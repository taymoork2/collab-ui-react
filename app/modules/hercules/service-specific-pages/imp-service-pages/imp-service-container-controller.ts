import { ExpresswayContainerController } from 'modules/hercules/service-specific-pages/common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';
import { ClusterService } from 'modules/hercules/services/cluster-service';

export class ImpServiceContainerController extends ExpresswayContainerController {

  public tabs: any = [{
    title: this.$translate.instant('common.resources'),
    state: 'imp-service.list',
  }, {
    title: this.$translate.instant('common.settings'),
    state: 'imp-service.settings',
  }];

  public addResourceModal: any = {
    resolve: {
      connectorType: () => 'c_imp',
      serviceId: () => 'spark-hybrid-impinterop',
      firstTimeSetup: false,
    },
    controller: 'AddResourceController',
    controllerAs: 'vm',
    templateUrl: 'modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html',
    type: 'small',
  };

  public clusterId: string;

  /* @ngInject */
  constructor(
    $modal,
    $scope: ng.IScope,
    $state: ng.ui.IStateService,
    private $stateParams: ng.ui.IStateParamsService,
    Authinfo,
    ClusterService: ClusterService,
    hasPartnerRegistrationFeatureToggle,
    hasNodesViewFeatureToggle,
    Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    ServiceDescriptor,
    ServiceStateChecker,
    USSService,
  ) {
    super($modal, $scope, $state, Authinfo, ClusterService, hasPartnerRegistrationFeatureToggle, hasNodesViewFeatureToggle, Notification, ServiceDescriptor, ServiceStateChecker, USSService, ['spark-hybrid-impinterop'], 'c_imp');
    this.clusterId = this.$stateParams['clusterId'];
  }
}

angular
  .module('Hercules')
  .controller('ImpServiceContainerController', ImpServiceContainerController);
