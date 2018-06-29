import {
  HybridServicesClusterService,
  IUserAssignmentWithConnector,
} from 'modules/hercules/services/hybrid-services-cluster.service';
import { IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

class HybridServicesUserAssignmentsComponentCtrl implements ng.IComponentController {

  public loading: boolean;
  public hostname: string;
  public clustername: string;
  public assignments: IUserAssignmentWithConnector[];
  public serviceId: HybridServiceId;

  /* @ngInject */
  constructor(private $translate: ng.translate.ITranslateService,
              private HybridServicesClusterService: HybridServicesClusterService) {
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    if (changes.userStatus && changes.userStatus.currentValue) {
      this.getUserData(changes.userStatus.currentValue);
    }
  }

  private getUserData(userStatus: IUserStatusWithExtendedMessages) {
    this.loading = true;
    this.serviceId = userStatus.serviceId;
    this.HybridServicesClusterService.getAssignedClusterAndConnectors(userStatus.assignments!)
      .then((data) => {
        this.assignments = data.assignments;
        this.clustername = data.clustername || this.$translate.instant('common.notFound');
      })
      .catch(() => {
        this.assignments = [];
        this.clustername = this.$translate.instant('common.notFound');
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

export class HybridServicesUserAssignmentsComponent implements ng.IComponentOptions {
  public controller = HybridServicesUserAssignmentsComponentCtrl;
  public template = require('./hybrid-services-user-assignments.component.html');
  public bindings = {
    userStatus: '<',
  };
}
