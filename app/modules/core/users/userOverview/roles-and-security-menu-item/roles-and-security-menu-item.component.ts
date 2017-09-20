export class RolesAndSecurityMenuItemComponentController implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {}

  public clickRolesAndSecurity() {
    this.$state.go('user-overview.roles-and-security');
  }

}

export class RolesAndSecurityMenuItemComponent implements ng.IComponentOptions {
  public controller = RolesAndSecurityMenuItemComponentController;
  public template = require('modules/core/users/userOverview/roles-and-security-menu-item/roles-and-security-menu-item.component.html');
}
