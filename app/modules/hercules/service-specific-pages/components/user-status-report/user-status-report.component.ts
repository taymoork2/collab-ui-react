class userStatusReportComponentCtrl implements ng.IComponentController {

  private userStatuses: any;

  /* @ngInject */
  constructor(
    private $modal: any,
  ) {  }

  public openUserStatusReportModal = () => {
      this.$modal.open({
          controller: 'ExportUserStatusesController',
          controllerAs: 'exportUserStatusesCtrl',
          templateUrl: 'modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html',
          type: 'small',
          resolve: {
            userStatusSummary: () => this.userStatuses,
          }
      });
  }

}

class userStatusReportComponent implements ng.IComponentOptions {
  public controller = userStatusReportComponentCtrl;
  public templateUrl = 'modules/hercules/service-specific-pages/components/user-status-report/user-status-report-button.html';
  public bindings = {
    userStatuses: '<',
  };
}

export default angular
  .module('Hercules')
  .component('userStatusReportButton', new userStatusReportComponent())
  .name;
