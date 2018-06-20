import { Notification } from 'modules/core/notifications';
import { USSService } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

export class ReactivateUserCtrl implements ng.IComponentController {

  public loading: boolean = false;
  public userId: string;
  public service: HybridServiceId;
  public dismiss: Function;
  public close: Function;

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private USSService: USSService,
  ) { }

  public $onInit(): void {
  }

  public submit() {
    this.loading = true;
    this.USSService.reactivateUser(this.userId, this.service)
      .then(() => {
        this.Notification.success('hercules.userSidepanel.reactivateUser.success');
        this.close();
      })
      .catch((err) => {
        this.Notification.errorWithTrackingId(err, 'notifications.genericError');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  public cancel(): void {
    this.dismiss();
  }
}

export class ReactivateUserModalComponent implements ng.IComponentOptions {
  public controller = ReactivateUserCtrl;
  public template = require('modules/hercules/user-sidepanel/reactivate-user-modal/reactivate-user-modal.component.html');
  public bindings = {
    userId: '<',
    service: '<',
    dismiss: '&',
    close: '&',
  };
}
