import { AssignableServicesItemCategory } from 'modules/core/users/userAdd/assignable-services/shared';
import { ICrCheckboxItemState } from 'modules/core/shared/cr-checkbox-item/cr-checkbox-item.component';
import { IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';

export class AssignableUserEntitlementCheckboxController implements ng.IComponentController {

  private static readonly itemCategory = AssignableServicesItemCategory.USER_ENTITLEMENT;
  public itemId: string;
  public onUpdate: Function;
  public autoAssignTemplateData: IAutoAssignTemplateData;

  public $onInit(): void {
    this.entryData = _.assignIn({
      isSelected: false,
      isDisabled: false,
    }, this.entryData);
  }

  // TODO (mipark2): refactor this (these properties identical to 'AssignableUserEntitlementCheckboxComponent')
  public get entryData(): ICrCheckboxItemState {
    return _.get(this.autoAssignTemplateData, `viewData.${AssignableUserEntitlementCheckboxController.itemCategory}["${this.itemId}"]`);
  }

  public set entryData(entryData: ICrCheckboxItemState) {
    _.set(this.autoAssignTemplateData, `viewData.${AssignableUserEntitlementCheckboxController.itemCategory}["${this.itemId}"]`, entryData);
  }

  public get isSelected(): boolean {
    return this.entryData.isSelected;
  }

  public get isDisabled(): boolean {
    return this.entryData.isDisabled;
  }

  public recvChange(itemUpdateEvent): void {
    const userEntitlementUpdateEvent = {
      $event: {
        itemId: this.itemId,
        itemCategory: AssignableUserEntitlementCheckboxController.itemCategory,
        item: {
          isSelected: itemUpdateEvent.item.isSelected,
          isDisabled: itemUpdateEvent.item.isDisabled,
        },
      },
    };
    this.onUpdate(userEntitlementUpdateEvent);
  }
}

export class AssignableUserEntitlementCheckboxComponent implements ng.IComponentOptions {
  public controller = AssignableUserEntitlementCheckboxController;
  public template = require('./assignable-user-entitlement-checkbox.html');
  public bindings = {
    itemId: '<',
    l10nLabel: '@',
    onUpdate: '&',
    autoAssignTemplateData: '<',
  };
}
