import { LegalHoldService } from './legal-hold.service';
import { Notification } from 'modules/core/notifications';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { ImportMode, Events } from './legal-hold.enums';
import { IImportComponentApi } from './legal-hold.interfaces';
import { Matter } from './matter.model';

export class LegalHoldCustodiansManageController implements ng.IComponentController {
  public caseId: string;
  public mode: ImportMode;
  public isFileValid: boolean;
  public isDone: boolean;
  public fileError: string;
  public dismiss: Function;
  public importComponentApi: IImportComponentApi;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private Authinfo: Authinfo,
    private Notification: Notification,
    private LegalHoldService: LegalHoldService,
  ) { }

  public setFileValid(isValid, error): void {
    this.isFileValid = isValid;
    this.fileError = isValid ? undefined : error;
  }

  public startImport(): void {
    this.importComponentApi.convertEmailsToUsers();
  }

  public cancelModal(): void {
    this.dismiss();
  }

  public updateCustodians(custodianList: string[]): ng.IPromise<void> {
    const promise: ng.IPromise<Matter> = (this.mode === ImportMode.ADD) ?
      this.LegalHoldService.addUsersToMatter(this.Authinfo.getOrgId(), this.caseId, custodianList)
      : this.LegalHoldService.removeUsersFromMatter(this.Authinfo.getOrgId(), this.caseId, custodianList);
    return promise.then(() => {
      this.isDone = true;
      this.importComponentApi.displayResults();
      this.$rootScope.$emit(Events.CHANGED, [this.caseId] );
    })
      .catch((result) => {
        this.Notification.errorResponse(result);
      });
  }
}

export class LegalHoldCustodiansManageComponent implements ng.IComponentOptions {
  public controller = LegalHoldCustodiansManageController;
  public template = require('./legal-hold-custodians-manage.tpl.html');
  public bindings = {
    caseId: '<',
    mode: '<',
    dismiss: '&',
  };
}
