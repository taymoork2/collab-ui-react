import './_search.scss';

class WebexReportsMore implements ng.IComponentController {

  /* @ngInject */
  public constructor(
    private $state: ng.ui.IStateService,
  ) {

  }

  public $onInit() {
    this.$state.current.data.displayName = 'Session and Participants'; // TODO, Will translate
  }
}

export class CustWebexReportsMoreComponent implements ng.IComponentOptions {
  public controller = WebexReportsMore;
  public templateUrl = 'modules/core/customerReports/webexReports/search/webexReportsMore.html';
}
