import { IToolkitModalService } from 'modules/core/modal';
import { LegalHoldService } from './legal-hold.service';
import { Notification } from 'modules/core/notifications';
import { Matter } from './matter.model';
import { MatterState, ImportMode, Events } from './legal-hold.enums';
import { IMatterJsonDataForDisplay } from './legal-hold.interfaces';
import { Authinfo } from 'modules/core/scripts/services/authinfo';

export class LegalHoldMatterDetailController implements ng.IComponentController {

  public static readonly DATE_FORMAT = 'MMM Do, YYYY h:mm A';

  public form: ng.IFormController;
  public saveInProcess = false;
  public matter: IMatterJsonDataForDisplay;
  public matterEdit: IMatterJsonDataForDisplay;
  private releaseMessage: string;
  private deleteMessage: string;
  public isEdit = false;
  public isProcessing = false;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo: Authinfo,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
    private LegalHoldService: LegalHoldService,
  ) { }

  public $onInit(): void {
    this.matterEdit = _.cloneDeep(this.matter);
    this.releaseMessage = `<p class="text-left">${this.$translate.instant('legalHold.releaseConfirmation1', { name: this.matter.matterName })}
    </p><p class="text-left">${this.$translate.instant('legalHold.releaseConfirmation2')}</p>`;
    this.deleteMessage = `<p class="text-left">${this.$translate.instant('legalHold.deleteConfirmation', { name: this.matter.matterName })}</p>`;
  }

  public get status(): string {
    return this.isActive() ? 'success' : 'danger';
  }

  public get l10nStatus(): string {
    return this.isActive() ?
      'legalHold.matterList.filter.active' :
      'legalHold.matterList.filter.released';
  }

  public get exportFileName(): string {
    return `${this.matter.matterName}_${this.$translate.instant('legalHold.detail.exportFileName')}`;
  }

  public isActive(): boolean {
    return this.matter.matterState === MatterState.ACTIVE;
  }

  public get name(): string {
    return this.matter.matterName;
  }
  public get creationDate(): string {
    return moment(this.matter.creationDate).format(LegalHoldMatterDetailController.DATE_FORMAT);
  }

  public get createdByName(): string {
    return this.matter.createdByName || '';
  }

  public get description(): string {
    return this.matter.matterDescription;
  }

  public get numberOfCustodians(): string {
    return this.matter.numberOfCustodians.toString();
  }

  public cancelEdit(): void {
    this.matterEdit = _.cloneDeep(this.matter);
    this.isEdit = false;
  }

  public saveEdit(): ng.IPromise<void> {
    this.saveInProcess = true;
    return this.LegalHoldService.updateMatter(Matter.matterFromResponseData(this.matterEdit))
      .then(() => {
        this.$rootScope.$emit(Events.CHANGED, this.matter);
        this.matter = _.cloneDeep(this.matterEdit);
        this.isEdit = false;
        this.$rootScope.$emit(Events.CHANGED);
        this.Notification.success('legalHold.notifications.saveSuccess');
      })
      .catch((err) => {
        this.Notification.errorResponse(err);
      })
      .finally(() => {
        this.saveInProcess = false;
      });
  }

  public releaseMatter(): ng.IPromise<void> {
    return this.ModalService.open({
      title: this.$translate.instant('legalHold.detail.releaseMatter'),
      message: this.releaseMessage,
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
    }).result.then(() => {
      this.isProcessing = true;
      return this.LegalHoldService.releaseMatter(Matter.matterFromResponseData(this.matter), new Date())
        .then(() => {
          this.matter.matterState = MatterState.RELEASED;
          this.$rootScope.$emit(Events.CHANGED);
          this.Notification.success('legalHold.notifications.releaseSuccess');
        })
        .catch((err) => {
          this.Notification.errorResponse(err);
        })
        .finally(() => {
          this.isProcessing =  false;
        });
    });
  }

  public deleteMatter(): ng.IPromise<void> {
    return this.ModalService.open({
      title: this.$translate.instant('common.warning'),
      message: this.deleteMessage,
      close: this.$translate.instant('common.continue'),
      dismiss: this.$translate.instant('common.cancel'),
    }).result.then(() => {
      this.isProcessing = true;
      this.LegalHoldService.deleteMatter(this.matter.orgId, this.matter.caseId)
        .then(() => {
          this.$rootScope.$emit(Events.CHANGED);
          this.Notification.success('legalHold.notifications.deleteSuccess');
          this.$state.go('legalhold.landing');
        })
        .catch((err) => {
          this.Notification.errorResponse(err);
        })
        .finally(() => {
          this.isProcessing = false;
        });
    });
  }

  public exportCustodians(): void {
    this.$state.go('legalhold.export', {
      caseId: this.matter.caseId,
      orgId: this.Authinfo.getOrgId(),
      matterName: this.matter.matterName,
    });
  }

  public addCustodians(): void {
    this.$state.go('legalhold.custodians-manage', {
      caseId: this.matter.caseId,
      mode: ImportMode.ADD,
    });
  }

  public removeCustodians(): void {
    this.$state.go('legalhold.custodians-manage', {
      caseId: this.matter.caseId,
      mode: ImportMode.REMOVE,
    });
  }
}

export class LegalHoldMatterDetailComponent implements ng.IComponentOptions {
  public controller = LegalHoldMatterDetailController;
  public template = require('./legal-hold-matter-detail.tpl.html');
  public bindings = {
    matter: '<',
  };
}
