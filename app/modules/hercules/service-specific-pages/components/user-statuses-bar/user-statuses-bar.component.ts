export class UserStatusesBarComponent implements ng.IComponentOptions {
  public template = require('modules/hercules/service-specific-pages/components/user-statuses-bar/user-statuses-bar.html');
  public bindings = {
    userStatuses: '<',
  };
}
