import { ExpresswayContainerController } from '../common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';

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
    Authinfo,
    private $stateParams: ng.ui.IStateParamsService,
    ClusterService,
    hasPartnerRegistrationFeatureToggle,
    hasNodesViewFeatureToggle,
    Notification: Notification,
    ServiceDescriptor,
    ServiceStateChecker,
    USSService,
  ) {
    super($modal, $scope, $state, Authinfo, ClusterService, hasPartnerRegistrationFeatureToggle, hasNodesViewFeatureToggle, Notification, ServiceDescriptor, ServiceStateChecker, USSService, ['squared-fusion-cal'], 'c_cal');
    this.clusterId = this.$stateParams['clusterId'];
    if (this.$stateParams['backTo']) {
      this.backState = this.$stateParams['backTo'];
    }
  }

}

angular
  .module('Hercules')
  .controller('CalendarServiceContainerController', CalendarServiceContainerController);
