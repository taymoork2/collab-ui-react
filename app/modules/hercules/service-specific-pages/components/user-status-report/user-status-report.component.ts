class UserStatusReportComponentCtrl implements ng.IComponentController {

  private userStatuses: any;

  /* @ngInject */
  constructor(private $modal ) {
  }

  public openUserStatusReportModal = () => {
    this.$modal.open({
      controller: 'ExportUserStatusesController',
      controllerAs: 'exportUserStatusesCtrl',
      template: require('modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html'),
      type: 'small',
      resolve: {
        userStatusSummary: () => this.userStatuses,
      },
    });
  }

}

class UserStatusReportComponent implements ng.IComponentOptions {
  public controller = UserStatusReportComponentCtrl;
  public template = require('modules/hercules/service-specific-pages/components/user-status-report/user-status-report-button.html');
  public bindings = {
    userStatuses: '<',
  };
}

export default angular
  .module('Hercules')
  .component('userStatusReportButton', new UserStatusReportComponent())
  .name;
