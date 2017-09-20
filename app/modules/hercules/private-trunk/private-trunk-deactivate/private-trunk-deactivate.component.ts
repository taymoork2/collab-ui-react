import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services';
import { Notification } from 'modules/core/notifications';

export class PrivateTrunkDeactivateCtrl implements ng.IComponentController {
  public dismiss: Function;
  /* @ngInject */
  constructor(
   private PrivateTrunkService: PrivateTrunkService,
   private Notification: Notification,
   private $state: ng.ui.IStateService,
  ) {
  }

  public deactivatePrivateTrunk(): void {
    this.PrivateTrunkService.deprovisionPrivateTrunk()
      .then(() => {
        this.Notification.success('servicesOverview.cards.privateTrunk.success.deactivate');
        this.dismiss();
        this.$state.go('services-overview');
      }).catch((error) => {
        this.Notification.error(error, 'servicesOverview.cards.privateTrunk.deactivateError');
        this.dismiss();
      });
  }

}

export class PrivateTrunkDeactivateComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkDeactivateCtrl;
  public template = require('modules/hercules/private-trunk/private-trunk-deactivate/private-trunk-deactivate-confirm.html');
  public bindings = {
    dismiss: '&',
  };
}
