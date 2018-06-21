import IExternalLinkedAccount = csdm.IExternalLinkedAccount;
import ICsdmDataModelService = csdm.ICsdmDataModelService;
import { ExternalLinkedAccountHelperService } from '../../devices/services/external-acct-helper.service';
import IWizardData = csdm.IWizardData;
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';
import { Notification } from 'modules/core/notifications';
import { UserListService } from 'modules/core/scripts/services/userlist.service';
import { USSService } from 'modules/hercules/services/uss.service';
import { IQService } from 'angular';
import { ICsdmFilteredViewFactory } from '../csdm-filtered-view-factory';
import {
  BaseExternalLinkedAccountUniqueSafe,
  ValidationState,
} from '../external-linked-account-validation/base-external-linked-account-unique-safe';

export class CallConnectOptions extends BaseExternalLinkedAccountUniqueSafe implements ng.IComponentController {
  private dismiss: Function;
  private wizardData: IWizardData;
  private static hybridCalluc = 'squared-fusion-uc';
  public mailID: string;
  public title: string;
  public isLoading: boolean = false;
  private isFirstStep: boolean = false;

  public resourceGroup: {
    selected?: { label: string, value: string },
    current?: { label: string, value: string },
    options: { label: string, value: string }[],
    shouldWarn: boolean,
    show: boolean,
    init: () => void,
  } = {
    init: () => {
      this.resourceGroup.options = [{
        label: this.$translate.instant('hercules.resourceGroups.noGroupSelectedOnPlace'),
        value: '',
      }];
      this.resourceGroup.selected = this.resourceGroup.current = this.resourceGroup.options[0];
      this.resourceGroup.shouldWarn = false;
    },
    options: [],
    shouldWarn: false,
    show: false,
  };

  /* @ngInject */
  constructor(
    private $stateParams: ng.ui.IStateParamsService,
    $translate: ng.translate.ITranslateService,
    private CsdmDataModelService: ICsdmDataModelService,
    CsdmFilteredViewFactory: ICsdmFilteredViewFactory,
    private ExtLinkHelperService: ExternalLinkedAccountHelperService,
    private Notification: Notification,
    private ResourceGroupService: ResourceGroupService,
    UserListService: UserListService,
    private USSService: USSService,
    $q: IQService,
    $timeout: ng.ITimeoutService,
  ) {
    super({
      nullAccountMessageKey: 'addDeviceWizard.sparkCallConnect.mailIdInvalidFormat',
      conflictWithUserEmailMessageKey: 'addDeviceWizard.sparkCallConnect.mailIdBelongsToUser',
      conflictWithExternalLinkedAccountMessageKey: 'addDeviceWizard.sparkCallConnect.mailIdBelongsToPlace',
    },
      CsdmFilteredViewFactory,
      UserListService,
      $q,
      $timeout,
      $translate);
  }

  public $onInit() {
    const state = this.$stateParams.wizard.state();
    this.wizardData = state.data;
    this.resourceGroup.init();
    this.title = this.wizardData.title;

    const existingHybridCallLink: IExternalLinkedAccount = _.head(_.filter(this.wizardData.account.externalLinkedAccounts || [], (linkedAccount) => {
      return linkedAccount && (linkedAccount.providerID === CallConnectOptions.hybridCalluc);
    }));
    if (existingHybridCallLink) {
      this.mailID = existingHybridCallLink.accountGUID;
    }

    this.fetchResourceGroups();

    this.isFirstStep = _.get(state, 'history.length') === 0;
  }

  public hasNextStep() {
    return this.wizardData.function !== 'editServices' || this.wizardData.account.enableCalService;
  }

  public hasBackStep() {
    return !this.isFirstStep;
  }

  public isNextDisabled() {
    return !(
    this.currentValidationState === ValidationState.Success
    && (this.resourceGroup.selected || !this.resourceGroup.options || this.resourceGroup.options.length === 0));
  }

  public isSaveDisabled() {
    return this.isNextDisabled();
  }

  public getResourceGroupShow() {
    return this.resourceGroup && this.resourceGroup.show;
  }

  public onMailIDInputKeyUp() {
    this.validate(this.mailID, CallConnectOptions.hybridCalluc);
  }

  public submitForm() {
    if (this.hasNextStep()) {
      if (!this.isNextDisabled()) {
        this.next();
      }
    } else if (!this.isSaveDisabled()) {
      this.save();
    }
  }

  public next() {
    this.$stateParams.wizard.next(
      {
        account: {
          externalHybridCallIdentifier: this.getNewExtLinkedAccount(),
          ussProps: this.getUssProps(),
        },
      },
      this.wizardData.account.enableCalService ? 'calendar' : 'next');

  }

  private getNewExtLinkedAccount(): IExternalLinkedAccount[] {
    const newExtLink = {
      providerID: CallConnectOptions.hybridCalluc,
      accountGUID: this.mailID,
      status: 'unconfirmed-email',
    };
    return [newExtLink];
  }

  public save() {
    this.isLoading = true;
    this.CsdmDataModelService.reloadPlaceByCisUuid(this.wizardData.account.cisUuid).then((place) => {
      if (place) {
        this.CsdmDataModelService.updateCloudberryPlace(
          place, {
            entitlements: this.wizardData.account.entitlements,
            externalLinkedAccounts: this.ExtLinkHelperService.getExternalLinkedAccountForSave(
              this.wizardData.account.externalLinkedAccounts,
              this.getNewExtLinkedAccount(),
              this.wizardData.account.entitlements || [],
            ),
          })
          .then(() => {
            const props = this.getUssProps();
            if (props) {
              this.$q.all({
                saveRGroup: this.USSService.updateBulkUserProps([props]),
                ussRefresh: this.USSService.refreshEntitlementsForUser(place.id || ''),
              }).then(() => {
                this.dismiss();
                this.Notification.success('addDeviceWizard.editServices.servicesSaved');
              }, (error) => {
                this.isLoading = false;
                this.Notification.errorResponse(error, 'hercules.addResourceDialog.CouldNotSaveResourceGroup');
              });
            } else {
              this.dismiss();
              this.Notification.success('addDeviceWizard.editServices.servicesSaved');
            }
          }, (error) => {
            this.isLoading = false;
            this.Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
          });
      } else {
        this.isLoading = false;
        this.Notification.warning('addDeviceWizard.assignPhoneNumber.placeNotFound');
      }
    }, (error) => {
      this.Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
    });
  }

  public back() {
    this.$stateParams.wizard.back();
  }

  public close() {
    this.dismiss();
  }

  private fetchResourceGroups() {
    this.ResourceGroupService.getAllAsOptions().then((options) => {
      if (options.length > 0) {
        this.resourceGroup.options = this.resourceGroup.options.concat(options);
        if (this.wizardData.account.cisUuid) {
          this.USSService.getUserProps(this.wizardData.account.cisUuid).then((props) => {
            if (props.resourceGroups && props.resourceGroups[CallConnectOptions.hybridCalluc]) {
              const selectedGroup = _.find(this.resourceGroup.options, (group) => {
                return group.value === props.resourceGroups[CallConnectOptions.hybridCalluc];
              });
              if (selectedGroup) {
                this.resourceGroup.selected = selectedGroup;
                this.resourceGroup.current = selectedGroup;
              }
            }
          });
        }
        this.resourceGroup.show = true;
      }
    });
  }

  public setResourceGroup(group: string) {
    if (!group) {
      const selectedGroup = _.find(this.resourceGroup.options, (rgroup) => {
        return rgroup.value === '';
      });
      if (selectedGroup) {
        this.resourceGroup.selected = selectedGroup;
      }
    }
  }

  private getUssProps(): { userId: string, resourceGroups: { 'squared-fusion-uc': string } } | null {
    const isExistingPlaceOrNonEmptyRGroup = this.wizardData.account.cisUuid || (this.resourceGroup.selected && this.resourceGroup.selected.value);
    if (this.resourceGroup.selected && isExistingPlaceOrNonEmptyRGroup) {
      return {
        userId: this.wizardData.account.cisUuid,
        resourceGroups: { 'squared-fusion-uc': this.resourceGroup.selected.value },
      };
    }
    return null;
  }
}

export class CallConnectOptionsComponent implements ng.IComponentOptions {
  public controller = CallConnectOptions;
  public controllerAs = 'callConnectOptions';
  public template = require('modules/squared/places/callConnect/CallConnectOptions.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}
