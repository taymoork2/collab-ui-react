import { ISubscription } from 'modules/core/users/userAdd/assignable-services/shared';
import { IAutoAssignTemplateData, IAutoAssignTemplateDataViewData, IAutoAssignTemplateResponse, IUserEntitlementsViewState } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';
import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.service';
import { IHybridServices } from 'modules/core/users/userAdd/hybrid-services-entitlements-panel/hybrid-services-entitlements-panel.service';
import { IUserEntitlementRequestItem, UserEntitlementState } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { OfferName } from 'modules/core/shared';
import { IAssignableLicenseCheckboxState } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';
import { ICrCheckboxItemState } from 'modules/core/users/shared/cr-checkbox-item/cr-checkbox-item.component';
import { AssignableServicesItemCategory } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';

class EditAutoAssignTemplateModalController implements ng.IComponentController {

  private prevState: string;
  private dismiss: Function;
  private autoAssignTemplateData: IAutoAssignTemplateData;
  public isEditTemplateMode: boolean;
  public sortedSubscriptions: ISubscription[];

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Analytics,
    private AutoAssignTemplateService: AutoAssignTemplateService,
  ) {}

  public $onInit(): void {
    this.prevState = _.get<string>(this.$state, 'params.prevState', 'users.manage.picker');
    this.isEditTemplateMode = !!this.isEditTemplateMode;

    // restore state if provided
    if (this.autoAssignTemplateData) {
      this.sortedSubscriptions = _.get(this.autoAssignTemplateData, 'apiData.subscriptions');
      return;
    }

    // otherwise use default initialization
    this.autoAssignTemplateData = this.AutoAssignTemplateService.initAutoAssignTemplateData();
    this.AutoAssignTemplateService.getSortedSubscriptions()
      .then(sortedSubscriptions => {
        this.sortedSubscriptions = sortedSubscriptions;
        this.autoAssignTemplateData.apiData.subscriptions = sortedSubscriptions;
      });
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(): void {
    this.$state.go(this.prevState);
  }

  public next(): void {
    this.$state.go('users.manage.edit-summary-auto-assign-template-modal', {
      autoAssignTemplateData: this.autoAssignTemplateData,
      isEditTemplateMode: this.isEditTemplateMode,
    });
  }

  public recvUpdate($event: {
    itemId: string;
    itemCategory: AssignableServicesItemCategory;
    item: ICrCheckboxItemState;
  }): void {
    const { itemId, itemCategory, item } = $event;
    if (!itemId || !itemCategory || !item) {
      return;
    }

    // update view data entry
    this.updateAutoAssignTemplateDataViewData({ itemId, itemCategory, item });

    // track user input change to determine whether to unlock "next" button
    const isSelected = item.isSelected;
    this.trackItemSelectionChange({ itemId, itemCategory, isSelected });
  }

  private updateAutoAssignTemplateDataViewData(viewDataItem: {
    itemId: string;
    itemCategory: AssignableServicesItemCategory;
    item: ICrCheckboxItemState;
  }): void {
    const { itemId, itemCategory, item } = viewDataItem;

    // notes:
    // - item id can potentially contain period chars ('.')
    // - so we wrap interpolated value in double-quotes to prevent unintended deep property creation
    _.set(this.autoAssignTemplateData, `viewData.${itemCategory}["${itemId}"]`, item);
  }

  private trackItemSelectionChange(itemSelectionChange: {
    itemId: string;
    itemCategory: AssignableServicesItemCategory;
    isSelected: boolean;
  }): void {
    const { itemId, itemCategory, isSelected } = itemSelectionChange;
    // notes:
    // - if a checkbox is selected twice, it effectively means "no change"
    // - we represent this by tracking the first change, and then deleting the entry on the second
    const existingItem: ICrCheckboxItemState = _.get(this.autoAssignTemplateData, `userChangesData.${itemCategory}.["${itemId}"]`);
    if (existingItem) {
      // - delete item only if it is actually changing its selection state
      if (existingItem.isSelected !== isSelected) {
        _.unset(this.autoAssignTemplateData, `userChangesData.${itemCategory}["${itemId}"]`);
      }
      return;
    }

    // early out if change is already represented by the corresponding item in existing template
    if (this.isChangeAlreadyRepresented({ itemId, itemCategory, isSelected })) {
      return;
    }

    // no entry yet, track it
    _.set(this.autoAssignTemplateData, `userChangesData.${itemCategory}.["${itemId}"]`, { isSelected });
  }

  private isChangeAlreadyRepresented(itemSelectionChange: {
    itemId: string;
    itemCategory: AssignableServicesItemCategory;
    isSelected: boolean;
  }): boolean {
    const { itemId, itemCategory, isSelected } = itemSelectionChange;
    const existingItem = this.AutoAssignTemplateService.getLicenseOrUserEntitlement(itemId, itemCategory, this.autoAssignTemplateData);
    if (!existingItem) {
      return !isSelected;
    }
    const existingItemEnabledStatus = this.AutoAssignTemplateService.getIsEnabled(existingItem, itemCategory);
    return existingItemEnabledStatus === isSelected;
  }

  public allowNext(): boolean {
    return this.hasSelectionChanges() && this.targetStateViewDataHasSelections();
  }

  private mkTargetStateViewData(): IAutoAssignTemplateDataViewData {
    const template: IAutoAssignTemplateResponse = _.get(this.autoAssignTemplateData, 'apiData.template');

    // start with template to populate view data
    const result = this.AutoAssignTemplateService.toViewData(template);

    // combine it with 'LICENSE' and 'USER_ENTITLEMENT' selections from user changes
    _.forEach([
      AssignableServicesItemCategory.LICENSE,
      AssignableServicesItemCategory.USER_ENTITLEMENT,
    ], (itemCategory) => {
      _.assignIn(result[itemCategory], _.get(this.autoAssignTemplateData, `userChangesData.${itemCategory}`));
    });
    return result;
  }

  private targetStateViewDataHasSelections(): boolean {
    const targetStateViewData = this.mkTargetStateViewData();
    const licenseSelections = _.get(targetStateViewData, AssignableServicesItemCategory.LICENSE);
    const hasLicenseSelections = _.some(licenseSelections, { isSelected: true });
    const userEntitlementSelections = _.get(targetStateViewData, AssignableServicesItemCategory.USER_ENTITLEMENT);
    const hasUserEntitlementSelections = _.some(userEntitlementSelections, { isSelected: true });
    return hasLicenseSelections || hasUserEntitlementSelections;
  }

  private hasSelectionChanges(): boolean {
    const hasNoChanges =
      _.isEmpty(_.get(this.autoAssignTemplateData, `userChangesData.${AssignableServicesItemCategory.LICENSE}`)) &&
      _.isEmpty(_.get(this.autoAssignTemplateData, `userChangesData.${AssignableServicesItemCategory.USER_ENTITLEMENT}`));
    return !hasNoChanges;
  }

  public recvHybridServicesEntitlementsUpdate(entitlements: IUserEntitlementRequestItem[]): void {
    _.forEach(entitlements, (entitlement) => {
      const { entitlementName, entitlementState } = entitlement;
      const isSelected = entitlementState === UserEntitlementState.ACTIVE;
      const itemId = entitlementName;
      const itemCategory = AssignableServicesItemCategory.USER_ENTITLEMENT;
      const item = {
        isSelected: isSelected,
        isDisabled: false,
      };

      // update view data entry
      this.updateAutoAssignTemplateDataViewData({ itemId, itemCategory, item });

      // track user input change to determine whether to unlock "next" button
      this.trackItemSelectionChange({ itemId, itemCategory, isSelected });
    });
    this.updateHuronCallLicenses();
  }

  private updateHuronCallLicenses(): void {
    const licenseEntries: { [key: string]: IAssignableLicenseCheckboxState } = _.get(this.autoAssignTemplateData, 'viewData.LICENSE');
    const callLicenseEntries: IAssignableLicenseCheckboxState[] = _.filter(licenseEntries, {
      license: {
        offerName: OfferName.CO,
      },
    });
    _.forEach(callLicenseEntries, (callLicenseEntry) => {
      callLicenseEntry.isDisabled = this.isHybridCallSelected;
    });
  }

  public get isHybridCallSelected(): boolean {
    return !!_.get(this.autoAssignTemplateData, 'viewData.USER_ENTITLEMENT.squaredFusionUC.isSelected');
  }

  public get isHuronCallLicenseSelected(): boolean {
    const licenseEntries: { [key: string]: IAssignableLicenseCheckboxState } = _.get(this.autoAssignTemplateData, 'viewData.LICENSE');
    return !!_.find(licenseEntries, {
      isSelected: true,
      license: {
        offerName: OfferName.CO,
      },
    });
  }

  public getUserEntitlements(): IUserEntitlementsViewState {
    return _.get(this.autoAssignTemplateData, `viewData.${AssignableServicesItemCategory.USER_ENTITLEMENT}`);
  }

  public getHybridServices(): IHybridServices {
    return _.get(this.autoAssignTemplateData, `otherData.hybridServices`);
  }

  public setHybridServices(hybridServices: IHybridServices): void {
    _.set(this.autoAssignTemplateData, `otherData.hybridServices`, hybridServices);
  }
}

export class EditAutoAssignTemplateModalComponent implements ng.IComponentOptions {
  public controller = EditAutoAssignTemplateModalController;
  public template = require('./edit-auto-assign-template-modal.html');
  public bindings = {
    prevState: '<',
    isEditTemplateMode: '<',
    autoAssignTemplateData: '<',
    dismiss: '&?',
  };
}
