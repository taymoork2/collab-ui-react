import { IToolkitModalService } from 'modules/core/modal';
import { IExtendedStatusSummary } from 'modules/hercules/services/uss.service';

class UserStatusReportComponentCtrl implements ng.IComponentController {

  private userStatuses: IExtendedStatusSummary[];

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) { }

  public openUserStatusReportModal = () => {
    this.$modal.open({
      controller: 'ExportUserStatusesController',
      controllerAs: 'exportUserStatusesCtrl',
      template: require('./export-user-statuses.html'),
      type: 'small',
      resolve: {
        userStatusSummary: () => this.userStatuses,
      },
    });
  }

}

export class UserStatusReportComponent implements ng.IComponentOptions {
  public controller = UserStatusReportComponentCtrl;
  public template = require('./user-status-report-button.html');
  public bindings = {
    userStatuses: '<',
  };
}
