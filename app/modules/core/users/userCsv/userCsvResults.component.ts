
////////////////////
/* @ngInject */
class UserCsvResultsController implements ng.IComponentController {

  public DOWNLOAD_ERRORS = this.Analytics.sections.ADD_USERS.eventNames.CSV_ERROR_EXPORT;

  constructor(
    private Analytics,
  ) {
  }

  //////////////
  public $onInit(): void {
  }

}

/* UI for display Csv Results */
export class UserCsvResultsComponent {
  public controller = UserCsvResultsController;
  public template = require('modules/core/users/userCsv/userCsvResults.tpl.html');
  public bindings = {
    csvData: '<',
    onDoneImport: '&',
    onCancelImport: '&',
  };
}
