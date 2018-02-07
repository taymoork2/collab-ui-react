import { ISubscription } from 'modules/core/users/userAdd/assignable-services/shared';
import { IAutoAssignTemplateData, IUserEntitlementsViewState } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';
import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.service';
import { IHybridServices } from 'modules/core/users/userAdd/hybrid-services-entitlements-panel/hybrid-services-entitlements-panel.service';
import { IUserEntitlementRequestItem, UserEntitlementState } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { OfferName } from 'modules/core/shared';
import { IAssignableLicenseCheckboxState } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';

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

  public recvUpdate($event): void {
    const itemId = _.get($event, 'itemId');
    const itemCategory = _.get($event, 'itemCategory');
    const item = _.get($event, 'item');
    if (!itemId || !itemCategory || !item) {
      return;
    }
    // notes:
    // - item id can potentially contain period chars ('.')
    // - so we wrap interpolated value in double-quotes to prevent unintended deep property creation
    _.set(this.autoAssignTemplateData, `viewData.${itemCategory}["${itemId}"]`, item);
  }

  public recvHybridServicesEntitlementsUpdate(entitlements: IUserEntitlementRequestItem[]): void {
    _.forEach(entitlements, (entitlement) => {
      const { entitlementName, entitlementState } = entitlement;
      const isSelected = entitlementState === UserEntitlementState.ACTIVE;
      _.set(this.autoAssignTemplateData, `viewData.USER_ENTITLEMENT.${entitlementName}`, {
        isSelected: isSelected,
        isDisabled: false,
      });
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
    return _.get(this.autoAssignTemplateData, `viewData.USER_ENTITLEMENT`);
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
