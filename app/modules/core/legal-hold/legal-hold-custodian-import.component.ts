import { ITableField } from 'modules/core/shared/cr-table';
import { IToolkitModalService } from 'modules/core/modal';
import { LegalHoldService, GetUserBy } from './legal-hold.service';
import { Notification } from 'modules/core/notifications';
import { ICustodian, IImportComponentApi, IImportResult } from './legal-hold.interfaces';
import { ImportMode, ImportStep, ImportResultStatus } from './legal-hold.enums';


export class LegalHoldCustodianImportController implements ng.IComponentController {

  private $: any;

  private static readonly DEFAULTS = {
    styleFileInputWidth: 7,
    styleProgressWidth: 12,
    styleResultsWidth: 12,
    maxNumberOfEmails: 15000,
    importChunkSize: 10,
  };

  //field mapping for error table
  public errorTableMetadata: ITableField[] = [
    {
      fieldName: 'emailAddress',
      fieldL10nLabel: 'common.emailAddress',
      fieldClass: 'custodian-import__table-column--first',
    },
    {
      fieldName: 'error',
      fieldL10nLabel: 'common.error',
    },
  ];

  //enums exposed to template
  public ImportModeEnum = ImportMode;
  public ImportStepEnum = ImportStep;
  public ImportResultStatusEnum = ImportResultStatus;

  //current state - step and mode
  public currentStep: ImportStep = ImportStep.UPLOAD;
  public mode: ImportMode;

  //params
  public styleFileInputWidth;
  public styleProgressWidth;
  public styleResultsWidth;

  //callback fns params
  public onFileValidation: Function;
  public onImportInit: Function;
  public onConversionCompleted: Function;

  // for import process
  public progress: number = 0;
  public fileInputErrorMsg ? = '';
  public file: File | string | undefined;
  public fileName: string;
  private chunks: number = 0;
  private totalChunks: number;

  public errorData: ICustodian[] = [];
  public csvErrorData: ICustodian[] = [];
  private csvEmailsArray: string[]; // emails uploaded from csv. Data to be converted
  public result: IImportResult | undefined;
  private shouldCancel = false; // triggers cancelation
  public resultStatus: ImportResultStatus | undefined;
  public progressLabel = this.$translate.instant('common.uploadingEllipsis');

  public CSV_IMPORT_HEADER = this.$translate.instant('common.emailAddress');
  public exportTemplate = [{
    [this.CSV_IMPORT_HEADER]: '',
  }];
  public api: IImportComponentApi = {
    convertEmailsToUsers: this.convertEmailsToUsers.bind(this),
    displayResults: this.displayResults.bind(this),
  };

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private Notification: Notification,
    private LegalHoldService: LegalHoldService,
    private ModalService: IToolkitModalService,
  ) {
  }

  public $onInit() {
    this.$ = jQuery;
    this.$scope.$watch(() => {
      return this.file;
    }, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this.$timeout(() => {
          this.getEmailsFromCsv();
        });
      }
    });
    this.setupDefaults();
    this.onImportInit({ importComponentApi: this.api });
  }

  // style and text strings setup
  private setupDefaults(): void {
    this.styleFileInputWidth = this.styleFileInputWidth || LegalHoldCustodianImportController.DEFAULTS.styleFileInputWidth;
    this.styleProgressWidth = this.styleProgressWidth || LegalHoldCustodianImportController.DEFAULTS.styleProgressWidth;
    this.styleResultsWidth = this.styleResultsWidth || LegalHoldCustodianImportController.DEFAULTS.styleResultsWidth;
  }

  public get l10nTitle(): string {
    return `legalHold.custodianImport.${this.mode}.title`;
  }

  public get l10nDescription(): string {
    return `legalHold.custodianImport.${this.mode}.description`;
  }

  public get l10nStatusTitle(): string {
    return `legalHold.custodianImport.${this.mode}.statusTitle`;
  }

  public get l10nResultString(): string {
    switch (this.resultStatus) {
      case ImportResultStatus.FAILED:
        return `legalHold.custodianImport.${this.mode}.resultFailure`;
      case ImportResultStatus.SUCCESS:
        return `legalHold.custodianImport.${this.mode}.resultSuccess`;
      case ImportResultStatus.CANCELED:
        return `legalHold.custodianImport.${this.mode}.resultCanceled`;
      default:
        return `legalHold.custodianImport.${this.mode}.resultPartial`;
    }
  }

  public get resultClass(): string {
    return this.resultStatus ? `custodianImport__results--${ImportResultStatus[this.resultStatus].toLowerCase()}` : '';
  }

  public get l10nActionPerformed(): string {
    return (this.mode === ImportMode.REMOVE) ? 'legalHold.custodianImport.usersRemoved' : 'legalHold.custodianImport.usersAdded';
  }

  public get progressbarLabel(): string {
    if (this.progress < 1000) {
      return this.$translate.instant('fileUpload.uploading');
    } else {
      return this.$translate.instant('fileUpload.success');
    }
  }

  public onCancelImport(): void {
    const verb = (this.mode === ImportMode.REMOVE) ? 'remove' : 'add';
    const params = {
      title: this.$translate.instant('legalHold.custodianImport.cancelImportTitle'),
      message: this.$translate.instant(`legalHold.custodianImport.${verb}.cancelConfirm`),
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
      hideDismiss: false,
    };
    this.ModalService.open(params).result.then(() => {
      this.shouldCancel = true;
      this.LegalHoldService.cancelConvertUsers();
      this.progressLabel = this.$translate.instant('common.cancelingEllipsis');
    }).catch(_.noop);
  }

  // getting raw data from file
  private getEmailsFromCsv(): boolean {
    this.progress = 0;
    if (!this.file) {
      this.resetFile();
      return false;
    }
    this.csvEmailsArray = this.$.csv.toArrays(this.file);
    if (_.isEmpty(this.csvEmailsArray) || !_.isArray(this.csvEmailsArray[0])) {
      return this.returnValidationResult(false, this.$translate.instant('legalHold.custodianImport.errorCsvBadFormat'));
    }
    if (this.csvEmailsArray.length > LegalHoldCustodianImportController.DEFAULTS.maxNumberOfEmails) {
      return this.returnValidationResult(false, this.$translate.instant('legalHold.custodianImport.errorCsvExceedsMax', { maxUsers: LegalHoldCustodianImportController.DEFAULTS.maxNumberOfEmails }));
    }
    return this.returnValidationResult(true);
  }

  public onFileSizeError(): void {
    this.Notification.error('legalHold.custodianImport.errorCsvMaxSizeError');
  }

  private returnValidationResult(isValid: boolean, error?: string): boolean {
    if (!isValid) {
      this.resetFile();
    }
    this.fileInputErrorMsg = (isValid) ? '' : error;
    this.onFileValidation({ isValid: isValid });
    return isValid;
  }

  private resetFile(): void {
    this.file = undefined;
    this.chunks = 0;
    this.progress = 0;
    this.shouldCancel = false;
  }

  //converting emails to users
  public convertEmailsToUsers(): IPromise<void> {
    this.currentStep = ImportStep.CONVERT;
    if (_.indexOf(this.csvEmailsArray[0], this.CSV_IMPORT_HEADER) > -1) {
      this.csvEmailsArray.shift();
    }
    const emailsArray = _.flatten(this.csvEmailsArray);
    const chunkedArray = _.chunk(emailsArray, LegalHoldCustodianImportController.DEFAULTS.importChunkSize);
    this.totalChunks = chunkedArray.length;
    return this.LegalHoldService.convertUsersChunk(chunkedArray, GetUserBy.EMAIL)
      .then((result) => {
        this.setResults(true, result);
      })
      .catch((errorResponse) => {
        const result = {
          success: [],
          error: [],
        };
        this.setResults(false, result, errorResponse);
      });
  }

  private setResults(isSuccess: boolean, result: IImportResult, errorResponse?): void {
    this.setResultAndStatus(result);
    if (isSuccess) {
      this.sendResults(<ICustodian[]>result.success);
    } else {
      this.currentStep = ImportStep.RESULT;
      if (!this.shouldCancel) {
        this.Notification.errorResponse(errorResponse);
      }
      this.resetFile();
    }
  }

  private setResultAndStatus(result: IImportResult): void {
    this.result = result;
    if (_.isEmpty(_.get(this.result, 'success', []))) {
      this.resultStatus = this.shouldCancel ? ImportResultStatus.CANCELED : ImportResultStatus.FAILED;
    } else {
      this.resultStatus = _.isEmpty(this.result.error) ? ImportResultStatus.SUCCESS : ImportResultStatus.SUCCESS_PARTIAL;
    }
  }

  private sendResults(custodians: ICustodian[]): void {
    const custodiansIds = _.map(custodians, 'userId');
    this.onConversionCompleted({ custodianLists: custodiansIds });
  }

  public setUploadProgress(): void {
    this.chunks = this.chunks + 1;
    this.progress = Math.round((90.0 * this.chunks) / this.totalChunks);
  }

  public displayResults(): void {
    this.errorData = this.getErrorsForDisplay();
    this.csvErrorData = _.cloneDeep(this.errorData);
    this.csvErrorData.unshift({
      emailAddress: this.$translate.instant('common.emailAddress'),
      error: this.$translate.instant('common.error'),
    });
    this.progress = 100;
    this.$timeout(() => {
      this.currentStep = ImportStep.RESULT;
    }, 1000);
  }

  public getTemplate(): string[][] {
    return [[this.CSV_IMPORT_HEADER]];
  }

  // there might be additional logic needed - hence the function
  private getErrorsForDisplay(): ICustodian[] {
    return (!this.result) ? [] : _.clone(this.result.error);
  }
}

export class LegalHoldCustodianImportComponent implements ng.IComponentOptions {
  public controller = LegalHoldCustodianImportController;
  public template = require('./legal-hold-custodian-import.tpl.html');
  public bindings = {
    onImportInit: '&',
    mode: '<',
    onFileValidation: '&',
    onConversionCompleted: '&',
    styleFileInputWidth: '@?',
    styleProgressWidth: '@?',
    styleResultsWidth: '@?',
  };
}
