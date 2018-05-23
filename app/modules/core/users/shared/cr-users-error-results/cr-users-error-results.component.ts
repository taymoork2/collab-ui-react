import './cr-users-error-results.scss';
// algendel 3/14/18  TODO refactor to use cr-table instead
class CrUsersErrorResultsController implements ng.IComponentController {
}

export class CrUsersErrorResultsComponent implements ng.IComponentOptions {
  public controller = CrUsersErrorResultsController;
  public template = require('./cr-users-error-results.html');
  public bindings = {
    userErrorArray: '<',
  };
}
