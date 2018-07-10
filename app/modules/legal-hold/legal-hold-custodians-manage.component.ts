import { LegalHoldService } from './legal-hold.service';
import { Notification } from 'modules/core/notifications';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { ImportMode, Events } from './legal-hold.enums';
import { IImportComponentApi, IMatterJsonDataForDisplay, IUserUpdateResult } from './legal-hold.interfaces';

export class LegalHoldCustodiansManageController implements ng.IComponentController {
  public matter: IMatterJsonDataForDisplay;
  public mode: ImportMode;
  public isFileValid: boolean;
  public isDone: boolean;
  public isConverting = false;
  public fileError: string;
  public dismiss: Function;
  public importComponentApi: IImportComponentApi;

  /* @ngInject */
  constructor(
    private $previousState,
    private $state: ng.ui.IStateService,
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
    this.isConverting = true;
    this.importComponentApi.convertEmailsToUsers();
  }

  public cancelModal(): void {
    this.$previousState.forget('modalMemo');
    this.$state.go('legalhold.detail', { matter: this.matter });
  }

  public cancel() {
    this.isDone = true;
  }

  public updateCustodians(custodianList: string[]): ng.IPromise<void> {
    const promise: ng.IPromise<IUserUpdateResult> = (this.mode === ImportMode.ADD) ?
      this.LegalHoldService.addUsersToMatter(this.Authinfo.getOrgId(), this.matter.caseId, custodianList)
      : this.LegalHoldService.removeUsersFromMatter(this.Authinfo.getOrgId(), this.matter.caseId, custodianList);
    return promise.then(updateResult => {
      this.isDone = true;
      this.matter.numberOfCustodians = updateResult.userListSize;
      this.importComponentApi.displayResults(updateResult.failList, this.mode);
      this.$rootScope.$emit(Events.CHANGED, [this.matter.caseId] );
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
    matter: '<',
    mode: '<',
    dismiss: '&',
  };
}
