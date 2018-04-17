import { PagingGroup, PagingGroupSettingsService, PagingNumberService, CUSTOM } from 'modules/call/features/paging-group/shared';
import { CallFeatureMember } from 'modules/call/features/shared/call-feature-members';
import { ComponentType } from 'modules/call/features/shared/call-feature-members';
import { Notification } from 'modules/core/notifications';

class PagingGroupComponentCtrl implements ng.IComponentController {

  public pgId: string;
  public pagingGroup: PagingGroup;
  public componentType: ComponentType = ComponentType.PAGING_GROUP;
  public nameRegEx: RegExp = /^[^[;&'"<>\/\\,\]]+$/;
  public internalNumberOptions: string[] = [];
  public filterPlaceholder: string;
  public memberProperties: string[] = ['name', 'number'];
  public huronFeaturesUrl: string = 'huronfeatures';
  public form: ng.IFormController;
  public isLoading: boolean = true;
  public saveInProcess: boolean = false;
  public title: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private PagingNumberService: PagingNumberService,
    private PagingGroupSettingsService: PagingGroupSettingsService,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
    this.pgId = _.get(this.$stateParams.feature, 'id');
    this.title = _.get(this.$stateParams.feature, 'cardName');
  }

  public $onInit(): void {
    if (!this.pgId) {
      this.$state.go(this.huronFeaturesUrl);
    } else {
      this.isLoading = true;
      this.$q.resolve(this.initComponentData()
        .catch(_.noop)
        .finally(() => this.isLoading = false));
    }
  }

  private initComponentData(): ng.IPromise<PagingGroup> {
    return this.PagingNumberService.getInternalNumbers()
      .then(numbers => this.internalNumberOptions = numbers)
      .then(() => this.PagingGroupSettingsService.get(this.pgId)
        .then(pagingGroup => this.pagingGroup = pagingGroup))
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'pagingGroup.errorUpdate');
        return this.$q.reject();
      });
  }

  public setPagingGroupName(name: string): void {
    this.pagingGroup.name = name;
    this.checkForChanges();
  }

  public setPagingGroupExtension(extension: string): void {
    this.pagingGroup.extension = extension;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setPagingGroupMembers(members: CallFeatureMember[]): void {
    this.pagingGroup.members = members;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setPagingGroupInitiators(initiatorType: string, initiators: CallFeatureMember[]): void {
    this.pagingGroup.initiatorType = initiatorType;
    if (this.pagingGroup.initiatorType === CUSTOM
        && this.PagingGroupSettingsService.getOriginalConfig().initiatorType === CUSTOM
        && initiators.length === 0) {
      this.pagingGroup.initiators = this.PagingGroupSettingsService.getOriginalConfig().initiators;
    } else {
      this.pagingGroup.initiators = initiators;
    }
    this.form.$setDirty();
    this.checkForChanges();
  }

  public save(): void {
    this.saveInProcess = true;
    this.PagingGroupSettingsService.savePagingGroup(this.pagingGroup)
      .then(pagingGroup => {
        this.pagingGroup = pagingGroup;
        this.Notification.success('pagingGroup.successUpdate', { pagingGroupName: this.pagingGroup.name });
      })
      .finally(() => {
        this.saveInProcess = false;
        this.resetForm();
      });
  }

  public filterInternalNumbers(filter: string): void {
    this.PagingNumberService.getInternalNumbers(filter)
      .then(numbers => this.internalNumberOptions = numbers);
  }

  public onCancel(): void {
    this.pagingGroup = this.PagingGroupSettingsService.getOriginalConfig();
    this.resetForm();
  }

  private checkForChanges(): void {
    if (this.PagingGroupSettingsService.matchesOriginalConfig(this.pagingGroup)) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.form.$setPristine();
    this.form.$setUntouched();
  }
}

export class PagingGroupComponent implements ng.IComponentOptions {
  public controller = PagingGroupComponentCtrl;
  public template = require('modules/call/features/paging-group/paging-group.component.html');
  public bindings = {};
}
