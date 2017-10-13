export class UserStatusMessagesComponent implements ng.IComponentOptions {
  public template = require('modules/hercules/user-sidepanel/user-status-messages/user-status-messages.html');
  public bindings = {
    messages: '<',
  };
}
