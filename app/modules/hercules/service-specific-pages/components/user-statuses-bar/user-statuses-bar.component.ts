export class UserStatusesBarComponent implements ng.IComponentOptions {
  public template = require('./user-statuses-bar.html');
  public bindings = {
    userStatuses: '<',
  };
}
