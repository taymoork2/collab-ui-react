
interface INumberInfo {
  orgId: string;
  externalNumber: string;
  apiImplementation: string;
}

class DeleteExternalNumberCtrl implements ng.IComponentController {
  private numberInfo: INumberInfo;
  public refreshFn: Function;
  public dismiss: Function;
  public deleteConfirmationMessage: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private ExternalNumberService,
    private Notification,
  ) {}

  public $onInit() {
    const _isApiImplementationSwivel = this.numberInfo.apiImplementation === 'SWIVEL' ? this.$translate.instant('linesPage.deleteNumberTextBYOP') :
      this.$translate.instant('linesPage.deleteNumberTextStandard');
    this.deleteConfirmationMessage = this.$translate.instant('linesPage.deleteNumberTextBase', { isApiImplementationSwivel: _isApiImplementationSwivel });
  }

  public onDismiss(): void {
    this.dismiss();
  }

  public onDelete(): ng.IPromise<any> {
    const numberObj = { number: this.numberInfo.externalNumber, uuid: null };

    return this.ExternalNumberService.deleteNumber(this.numberInfo.orgId, numberObj)
      .then(() => {
        this.Notification.success('notifications.successDelete', {
          item: this.numberInfo.externalNumber,
        });
        this.refreshFn();
        this.dismiss();
      }, (error) => {
        this.Notification.errorResponse(error, 'notifications.errorDelete', {
          item: this.numberInfo.externalNumber,
        });
        this.dismiss();
      });
  }
}

export class DeleteExternalNumberComponent implements ng.IComponentOptions {
  public controller = DeleteExternalNumberCtrl;
  public template = require('modules/huron/lines/deleteExternalNumber/deleteExternalNumber.html');
  public bindings = {
    numberInfo: '<',
    refreshFn: '&',
    dismiss: '&',
  };
}
