import { UserManageEmailSuppressController } from './emailSuppress.controller';

export class UserManageEmailSuppressComponent implements ng.IComponentOptions {
  public controller = UserManageEmailSuppressController;
  public template = require('modules/core/users/userManage/emailSuppress/emailSuppress.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}
