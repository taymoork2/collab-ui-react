import './cr-users-error-results.scss';

class CrUsersErrorResultsController implements ng.IComponentController {
}

export class CrUsersErrorResultsComponent implements ng.IComponentOptions {
  public controller = CrUsersErrorResultsController;
  public template = require('./cr-users-error-results.html');
  public bindings = {
    userErrorArray: '<',
  };
}
