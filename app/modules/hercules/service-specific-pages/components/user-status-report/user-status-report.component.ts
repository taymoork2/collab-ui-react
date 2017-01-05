
class userStatusReportComponentCtrl implements ng.IComponentController {

  private servicesId: string[];
  private userStatusSummary: any;

  /* @ngInject */
  constructor(
    private $modal: any,
    private $scope: any,
    private USSService
  ) {  }

  public $onInit() {
    this.USSService.subscribeStatusesSummary('data', this.extractSummaryForAService, {
      scope: this.$scope
    });
  }

  private extractSummaryForAService = () => {
    this.userStatusSummary = this.USSService.extractSummaryForAService(this.servicesId);
  };

  public openUserStatusReportModal = () => {
      this.$modal.open({
          controller: 'ExportUserStatusesController',
          controllerAs: 'exportUserStatusesCtrl',
          templateUrl: 'modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html',
          type: 'small',
          resolve: {
            servicesId: () => this.servicesId,
            userStatusSummary: () => this.userStatusSummary,
          }
      });
  }


}

class userStatusReportComponent implements ng.IComponentOptions {
  public controller = userStatusReportComponentCtrl;
  public templateUrl = 'modules/hercules/service-specific-pages/components/user-status-report/user-status-report-button.html';
  public bindings = {
    servicesId: '<',
  };
}

export default angular
  .module('Hercules')
  .component('userStatusReportButton', new userStatusReportComponent())
  .name;
