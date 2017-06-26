import { ExpresswayContainerController } from '../common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';

export class CallServiceContainerController extends ExpresswayContainerController {

  public tabs: any = [{
    title: 'common.resources',
    state: 'call-service.list',
  }, {
    title: 'common.settings',
    state: 'call-service.settings',
  }];

  public addResourceModal: any = {
    resolve: {
      connectorType: () => 'c_ucmc',
      serviceId: () => 'squared-fusion-uc',
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
    ClusterService,
    hasPartnerRegistrationFeatureToggle,
    hasNodesViewFeatureToggle,
    Notification: Notification,
    ServiceDescriptor,
    ServiceStateChecker,
    USSService,
  ) {
    super($modal, $scope, $state, Authinfo, ClusterService, hasPartnerRegistrationFeatureToggle, hasNodesViewFeatureToggle, Notification, ServiceDescriptor, ServiceStateChecker, USSService, ['squared-fusion-uc'], 'c_ucmc');
    this.addConnectIfEnabled();
    this.clusterId = this.$stateParams['clusterId'];
    if (this.$stateParams['backState']) {
      this.backState = this.$stateParams['backState'];
    }
  }

  private addConnectIfEnabled() {
    this.ServiceDescriptor.isServiceEnabled('squared-fusion-ec')
      .then((enabled) => {
        if (enabled) {
          this.servicesId.push('squared-fusion-ec');
          this.subscribeStatusesSummary.cancel();
          this.extractSummary();
          this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
        }
      })
      .catch((response) => {
        this.Notification.errorWithTrackingId(response, 'hercules.genericFailure');
      });
  }
}

angular
  .module('Hercules')
  .controller('CallServiceContainerController', CallServiceContainerController);
