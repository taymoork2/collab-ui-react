import { ExpresswayContainerController } from '../common-expressway-based/expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';

interface IClusterIdStateParam extends ng.ui.IStateParamsService {
  clusterId: any;
}

export class CalendarServiceContainerController extends ExpresswayContainerController {

  public tabs: any = [{
    title: this.$translate.instant('common.resources'),
    state: 'calendar-service.list',
  }, {
    title: this.$translate.instant('common.settings'),
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
  constructor($modal,
              $state: ng.ui.IStateService,
              private $stateParams: IClusterIdStateParam,
              ClusterService,
              Notification: Notification,
              private $translate: ng.translate.ITranslateService,
              ServiceDescriptor,
              ServiceStateChecker,
              USSService ) {
    super($modal, $state, ClusterService, Notification, ServiceDescriptor, ServiceStateChecker, USSService, ['squared-fusion-cal'], 'c_cal');
    this.clusterId = this.$stateParams.clusterId;
  }

}

angular
  .module('Hercules')
  .controller('CalendarServiceContainerController', CalendarServiceContainerController);
