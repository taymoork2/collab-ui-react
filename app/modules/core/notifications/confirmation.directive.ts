import { AlertService } from './alert.service';

interface IConfirmationScope extends ng.IScope {
  message: string;
  notify: {(shouldNotify: boolean): void};
}

export class Confirmation implements ng.IDirective {
  public templateUrl = 'modules/core/notifications/confirmation.tpl.html';
  public link: ng.IDirectiveLinkFn = (scope: IConfirmationScope) => {
    scope.message = this.AlertService.getMessage();
    scope.notify = (shouldNotify) => {
      if (shouldNotify) {
        this.AlertService.getDeferred().resolve();
        this.toaster.clear('*');
      } else {
        this.AlertService.getDeferred().reject();
        this.toaster.clear('*');
      }
    };
  }

  constructor(
    private AlertService: AlertService,
    private toaster,
  ) {}

  /* @ngInject */
  public static directive(
    AlertService,
    toaster,
  ) {
    return new Confirmation(AlertService, toaster);
  }
}
