import { LegalHoldService } from './legal-hold.service';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { Notification } from 'modules/core/notifications';
import { Matter } from './matter.model';
import { IImportComponentApi } from './legal-hold.interfaces';
import { ImportMode, Events } from './legal-hold.enums';

export class LegalHoldMatterNewController implements ng.IComponentController {

  public ImportModeType = ImportMode;

  public dismiss: Function;
  public isFileValid = false;
  public importComponentApi: IImportComponentApi;
  public matter: Matter;

  public matterName: string;
  public matterDescription: string;
  public isDone = false;
  public form: ng.IFormController;
  public validationMessages = {
    name: {
      required: '',
    },
  };

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo: Authinfo,
    private LegalHoldService: LegalHoldService,
    private Notification: Notification,
  ) {
    this.validationMessages.name.required = this.$translate.instant('common.required');
  }

  public cancelModal() {
    this.dismiss();
  }

  public cancel() {
    this.isDone = true;
  }

  public createMatter() {
    this.LegalHoldService.createMatter(this.Authinfo.getOrgId(), this.matterName, this.matterDescription, new Date(), [])
      .then((result) => {
        this.matter = result;
        this.importComponentApi.convertEmailsToUsers();
      })
      .catch(error => {
        this.Notification.errorResponse(error);
      });
  }

  public addUsersToMatter(custodianIds: string[]) {
    this.LegalHoldService.addUsersToMatter(this.Authinfo.getOrgId(), this.matter.caseId, custodianIds)
      .then(updateResults => {
        this.isDone = true;
        this.importComponentApi.displayResults(updateResults.failList, ImportMode.ADD);
        this.$rootScope.$emit(Events.CHANGED);
      })
      .catch(error => {
        this.Notification.errorResponse(error);
      });
  }
  public setFileValid(isValid) {
    this.isFileValid = isValid;
  }
}

export class LegalHoldMatterNewComponent implements ng.IComponentOptions {
  public controller = LegalHoldMatterNewController;
  public template = require('./legal-hold-matter-new.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}
