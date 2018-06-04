import { PSTN_ESA_DISCLAIMER_ACCEPT } from '../pstn.const';
import { Notification } from 'modules/core/notifications';

export class EsaDisclaimerComponent implements ng.IComponentOptions {
  public controller = EsaDisclaimerCtrl;
  public template = require('modules/huron/pstn/esaDisclaimer/esaDisclaimer.html');
  public bindings = {
    onDismiss: '&',
  };
}

export class EsaDisclaimerCtrl implements ng.IComponentController {
  private onDismiss: Function;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private Notification: Notification,
    private TerminusService,
    private Authinfo,
  ) {}

  public onAgreeClick(): ng.IPromise<any> {
    const payload = {
      e911Signee: this.Authinfo.getUserId(),
    };
    return this.TerminusService.customer().update({
      customerId: this.Authinfo.getOrgId(),
    }, payload).$promise
      .then(() => {
        this.$rootScope.$broadcast(PSTN_ESA_DISCLAIMER_ACCEPT);
      }).catch(response => {
        this.Notification.errorResponse(response);
      }).finally(() => {
        this.onDismiss();
      });
  }

  public onDismissClick(): void {
    this.onDismiss();
  }
}
