import { LegalHoldService, GetUserBy } from './legal-hold.service';
import { ICustodian } from './legal-hold.interfaces';
import { Notification } from 'modules/core/notifications';

export class LegalHoldCustodianExportComponent implements ng.IComponentOptions {
  public controller = LegalHoldCustodianExportController;
  public template = require('./legal-hold-custodian-export.html');
  public exportResults: ICustodian[];
  public bindings = {
    orgId: '<',
    caseId: '<',
    matterName: '<',
  };
}

export class LegalHoldCustodianExportController implements ng.IComponentController {

  public exportResults: ICustodian[];
  public static readonly EXPORT_CHUNK_SIZE = 10;
  public orgId: string;
  public caseId: string;
  public matterName: string;
  public isExporting = false;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private LegalHoldService: LegalHoldService,
    private Notification: Notification,
  ) { }

  public export() {
    this.exportCustodians()
      .then(() => {
        //small timeout to allow for the toaster and also display the file in download bar
        this.$timeout(() => {
          this.$state.go('legalhold.landing');
        }, 100);
      });
  }

  public exportCustodians(): IPromise<ICustodian[]> {
    this.isExporting = true;
    return this.LegalHoldService.listUsersInMatter(this.orgId, this.caseId)
      .then((userUuidList) => { //get the users in uuid
        const chunkedArray = _.chunk(<string[]>userUuidList, LegalHoldCustodianExportController.EXPORT_CHUNK_SIZE);
        return this.LegalHoldService.convertUsersChunk(chunkedArray, GetUserBy.ID);
      })
      .then((result) => { //exportResults is watched by download component. as soon as it's set download starts
        if (_.isEmpty(result)) {
          return [];
        } else {
          this.exportResults = _.concat(result.success, result.error);
          return this.exportResults;
        }
      })
      .catch((errorResponse) => {
        this.Notification.errorResponse(errorResponse);
        return [];
      })
      .finally(() => {
        this.isExporting = false;
      });
  }

  public get exportFileName(): string {
    return `${this.matterName}_${this.$translate.instant('legalHold.detail.exportFileName')}`;
  }

  public cancel(): void {
    this.$state.go('legalhold.landing');
  }
}
