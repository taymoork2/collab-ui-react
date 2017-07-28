import { ExpresswayContainerController } from '../common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class CalendarServiceContainerController extends ExpresswayContainerController {

  public tabs: any = [{
    title: 'common.resources',
    state: 'calendar-service.list',
  }, {
    title: 'common.settings',
    state: 'calendar-service.settings',
  }];

  public addResourceModal: any = {
    resolve: {
      connectorType: () => 'c_cal',
      serviceId: () => 'squared-fusion-cal',
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
    ClusterService,
    hasNodesViewFeatureToggle,
    Notification: Notification,
    ServiceDescriptorService: ServiceDescriptorService,
    ServiceStateChecker,
    USSService,
  ) {
    super($modal, $scope, $state, ClusterService, hasNodesViewFeatureToggle, Notification, ServiceDescriptorService, ServiceStateChecker, USSService, ['squared-fusion-cal'], 'c_cal');
    this.clusterId = this.$stateParams['clusterId'];
    if (this.$stateParams['backState']) {
      this.backState = this.$stateParams['backState'];
    }
  }

}

angular
  .module('Hercules')
  .controller('CalendarServiceContainerController', CalendarServiceContainerController);
