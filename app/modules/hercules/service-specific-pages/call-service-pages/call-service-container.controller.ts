import { ExpresswayContainerController } from '../common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class CallServiceContainerController extends ExpresswayContainerController {
  public tabs = [{
    title: this.$translate.instant('common.resources'),
    state: 'call-service.list',
  }, {
    title: this.$translate.instant('common.settings'),
    state: 'call-service.settings',
  }];

  public addResourceModal: any = {
    resolve: {
      connectorType: () => 'c_ucmc',
      serviceId: () => 'squared-fusion-uc',
      options: {
        firstTimeSetup: false,
        hasCapacityFeatureToggle: this.hasCapacityFeatureToggle,
      },
    },
    controller: 'AddResourceController',
    controllerAs: 'vm',
    template: require('modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html'),
    type: 'small',
  };

  public clusterId: string;

  /* @ngInject */
  constructor(
    $modal,
    $state: ng.ui.IStateService,
    $timeout: ng.ITimeoutService,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    Notification: Notification,
    ServiceDescriptorService: ServiceDescriptorService,
    ServiceStateChecker,
    USSService,
    private hasCapacityFeatureToggle,
  ) {
    super($modal, $state, $timeout, Notification, ServiceDescriptorService, ServiceStateChecker, USSService, ['squared-fusion-uc'], 'c_ucmc');
    this.addConnectIfEnabled();
    this.clusterId = this.$stateParams['clusterId'];
    if (this.$stateParams['backState']) {
      this.backState = this.$stateParams['backState'];
    }
    if (this.hasCapacityFeatureToggle) {
      this.tabs.push({
        title: this.$translate.instant('common.users'),
        state: 'call-service.users',
      });
    }
  }

  private addConnectIfEnabled() {
    this.ServiceDescriptorService.isServiceEnabled('squared-fusion-ec')
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
