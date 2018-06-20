import { CallDestinationTranslateService, ICallDestinationTranslate } from 'modules/call/shared/call-destination-translate';
import { DraggableInstance, DraggableService } from 'modules/core/accessibility';
import { Notification } from 'modules/core/notifications';
import { IActionItem } from 'modules/core/shared/section-title/section-title.component';
import { IPhoneButton, PhoneButtonLayoutService } from './phoneButtonLayout.service';

interface IValidationMessages {
  required: string;
  pattern: string;
}

interface ITranslationMessages {
  placeholderText: string;
  helpText: string;
}

interface IPhoneButtonType {
  name: string;
  value: string;
}

const PHONE_BUTTON_LIMIT = 150;
const inputs: string[] = ['external', 'uri', 'custom'];
const addableButtonTypes: string[] = ['FEATURE_NONE', 'FEATURE_SPEED_DIAL_BLF'];
const defaultNewButtonType: string = 'FEATURE_SPEED_DIAL_BLF';
const PLACE_OWNER_TYPE: string = 'places';

class PhoneButtonLayoutCtrl implements ng.IComponentController {
  private ownerId: string;
  private ownerType: string;
  private editing: boolean;
  private phoneButtonList: IPhoneButton[] = [];
  private phoneButtonListReadonly: IPhoneButton[] = [];
  private phoneButtonListFull: IPhoneButton[] = [];
  private copyList: IPhoneButton[] | undefined;
  private newLabel: string;
  private newDestination: string;
  private newType: IPhoneButtonType;
  public labelMessages: IValidationMessages;
  public numberMessages: IValidationMessages;
  public customTranslations: ITranslationMessages;
  public inputTranslations: ICallDestinationTranslate;
  public customNumberValidationPatern: RegExp;
  private actionList: IActionItem[] = [];
  private buttonTypeInputs: object[] = [];
  public callDestInputs: string[];
  private optionSelected: string = '';
  private isButtonLimitReached: boolean = false;
  private draggableInstance: DraggableInstance;

  public ownerName: string = '';
  public isValid: boolean = false;
  public extension: string = '';
  public inputType: any;
  public callPickupEnabled: boolean = false;
  public appliesToSharedLines: boolean = false;
  public form: ng.IFormController;
  public buttonTypeEmpty: string = 'FEATURE_NONE';
  public hasPhoneButtonsFeatureToggle: boolean;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $modal,
    private $scope: ng.IScope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private BlfInternalExtValidation,
    private BlfURIValidation,
    private CallDestinationTranslateService: CallDestinationTranslateService,
    private DraggableService: DraggableService,
    private FeatureMemberService,
    private HuronUserService,
    private Notification: Notification,
    private PhoneButtonLayoutService: PhoneButtonLayoutService,
  ) { }

  public $onInit() {
    this.callDestInputs = inputs;
    this.editing = false;
    if (this.ownerType === PLACE_OWNER_TYPE) {
      this.FeatureMemberService.getMachineAcct(this.ownerId).then((machine) => {
        this.ownerName = _.get(machine, 'displayName');
      });
    } else {
      this.HuronUserService.getUserV2(this.ownerId).then((user) => {
        this.ownerName = this.HuronUserService.getFullNameFromUser(user);
      });
    }
    this.PhoneButtonLayoutService.getPhoneButtons(this.ownerType, this.ownerId).then((data) => {
      this.phoneButtonList = data.buttonLayout;
      this.setDefaultPhoneButtonAttributes(this.phoneButtonList);
      if (!_.isEmpty(this.phoneButtonList)) {
        // split the phone button list into buttons that can and can't be re-arranged
        this.phoneButtonListReadonly = _.filter(this.phoneButtonList, { index: 1 });
        _.each(this.phoneButtonListReadonly, (readonlyButton) => {
          _.remove(this.phoneButtonList, readonlyButton);
        });
      }
    }).catch(() => {
      this.Notification.error('phoneButtonLayout.retrievePhoneButtonLayoutFailed');
    });
    this.labelMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      pattern: this.$translate.instant('speedDials.labelIncorrectCharacter'),
    };
    this.numberMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      pattern: this.$translate.instant('common.incorrectFormat'),
    };
    this.customTranslations = {
      placeholderText: this.$translate.instant('callDestination.alternateCustomPlaceholder'),
      helpText: this.$translate.instant('callDestination.alternateCustomHelpText'),
    };
    _.each(addableButtonTypes, (type) => {
      this.buttonTypeInputs.push({
        name: this.$translate.instant('phoneButtonLayout.buttonType.' + type),
        value: type,
      });
    });
    this.$scope.$watchCollection(() => {
      return this.phoneButtonList;
    }, () => {
      this.buildFullPhoneButtonList();
      this.setDefaultPhoneButtonAttributes(this.phoneButtonList);
      this.isButtonLimitReached = this.phoneButtonListFull.length >= PHONE_BUTTON_LIMIT;
      this.buildActionList();
    });
    this.inputTranslations = this.CallDestinationTranslateService.getCallDestinationTranslate();
    this.customNumberValidationPatern = this.CallDestinationTranslateService.getCustomNumberValidationPatern();
  }

  public extensionOwned(number: string): void {
    this.extension = number;
    if (this.form['$ctrl.callDestinationForm']) {
      this.optionSelected = this.form['$ctrl.callDestinationForm'].CallDestTypeSelect.$viewValue.input;
    }
    if (this.optionSelected.toLowerCase() === 'custom') {
      return this.BlfInternalExtValidation.get({
        customerId: this.Authinfo.getOrgId(),
        value: this.extension,
      }).$promise.then(() => {
        this.isValid = true;
      }).catch(() => {
        this.isValid = false;
      });
    } else if (this.optionSelected.toLowerCase() === 'uri') {
      return this.BlfURIValidation.get({
        customerId: this.Authinfo.getOrgId(),
        value: this.extension,
      }).$promise.then(() => {
        this.isValid = true;
      }).catch(() => {
        this.isValid = false;
      });
    }
  }

  public add(): void {
    const phoneButton = {
      type: defaultNewButtonType,  // initial value for new phone buttons
      index: this.phoneButtonList.length + 1,
      label: '',
      number: '',
      destination: '',
      callPickupEnabled: this.callPickupEnabled,
      appliesToSharedLines: this.appliesToSharedLines,
    };
    this.phoneButtonList.push(phoneButton);
    this.setEdit(phoneButton);
    this.$timeout(function () {
      $('#phonebutton-' + phoneButton.index).focus();
    }, 100);
  }

  public setPhoneButton(number): void {
    this.newDestination = number;
    this.isValid = false;
    this.callPickupEnabled = false;
    this.extensionOwned(this.newDestination);
  }

  public save(): void {
    if (this.editing) {
      const phoneButton = _.find(this.phoneButtonList, {
        edit: true,
      });
      phoneButton.callPickupEnabled = this.callPickupEnabled;
      phoneButton.destination = _.replace(this.newDestination, / /g, '');
      phoneButton.edit = false;
      phoneButton.label = this.newLabel;
      phoneButton.type = this.newType.value;
    } else if (this.isReordering()) {
      this.copyList = undefined;
      this.draggableInstance.selectedItem = undefined;
    }
    _.each(this.phoneButtonListFull, (phoneButton) => {
      if (phoneButton.type === this.buttonTypeEmpty) {
        phoneButton.destination = '';
        phoneButton.label = '';
      }
    });
    this.PhoneButtonLayoutService.updatePhoneButtons(this.ownerType, this.ownerId, this.phoneButtonListFull).then(() => {
      this.Notification.success('phoneButtonLayout.success');
      this.isValid = false;
      this.editing = false;
      this.deactivateDraggable();
      this.setDefaultPhoneButtonAttributes(this.phoneButtonListFull);
      this.buildActionList();
    }, () => {
      this.Notification.error('phoneButtonLayout.updatePhoneButtonLayoutFailed');
      if (_.has(this, 'ownerId')) {
        this.PhoneButtonLayoutService.getPhoneButtons(this.ownerType, this.ownerId).then((data) => {
          this.phoneButtonList = data.buttonLayout;
        }).catch(() => {
          this.Notification.error('phoneButtonLayout.retrievePhoneButtonLayoutFailed');
        });
      }
      this.editing = false;
      this.deactivateDraggable();
      this.setDefaultPhoneButtonAttributes(this.phoneButtonListFull);
      this.buildActionList();
    });
  }

  public reset(): void {
    if (this.editing) {
      const phoneButton = _.find(this.phoneButtonList, {
        edit: true,
      });
      if (_.isEmpty(phoneButton.label) || _.isEmpty(phoneButton.destination)) {
        //Create case: remove last element
        this.phoneButtonList.pop();
      } else {
        //Update case: go back to read only mode
        phoneButton.edit = false;
      }
      this.newLabel = '';
      this.newDestination = '';
      this.newType = { name: '', value: '' };
      this.callPickupEnabled = false;
      this.isValid = false;
    } else if (this.isReordering()) {
      this.phoneButtonList.length = 0;
      Array.prototype.push.apply(this.phoneButtonList, _.cloneDeep(this.copyList));
      this.draggableInstance.selectedItem = undefined;
    }
    this.editing = false;
    this.deactivateDraggable();
    this.buildActionList();
  }

  public setReorder(): void {
    this.actionList = [];  // empty the actionList so that it's not displayed
    this.copyList = _.cloneDeep(this.phoneButtonList);
    if (_.isUndefined(this.draggableInstance)) {
      this.draggableInstance = this.DraggableService.createDraggableInstance({
        elem: this.$element,
        identifier: '#arrangeablePhoneButtonsContainer',
        transitClass: 'phonebuttonlayout-reorder',
        itemIdentifier: '#phoneButton',
        list: this.phoneButtonList,
        scope: this.$scope,
      });
    } else {
      this.draggableInstance.reordering = true;
    }
  }

  public phoneButtonKeyPress($event: KeyboardEvent, phoneButton: IPhoneButton) {
    if (!this.isReordering()) {
      return;
    } else if (_.get(this.draggableInstance, 'keyPress')) {
      this.draggableInstance.keyPress($event, phoneButton);
      this.phoneButtonList = this.draggableInstance.list;
    }
  }

  public isReordering() {
    return _.get(this.draggableInstance, 'reordering', false);
  }

  public isSelectedPhoneButton(phoneButton: IPhoneButton) {
    return phoneButton === this.draggableInstance.selectedItem;
  }

  public setEdit(phoneButton: IPhoneButton): void {
    if (_.isObject(phoneButton) && _.has(phoneButton, 'label') && _.has(phoneButton, 'destination')) {
      this.editing = true;
      phoneButton.edit = true;
      this.actionList = [];  // empty the actionList so that it's not displayed
      this.newLabel = phoneButton.label;
      this.newDestination = phoneButton.destination;
      this.newType = this.buildButtonTypeObject(phoneButton.type);
      this.callPickupEnabled = <boolean>phoneButton.callPickupEnabled;
      if (phoneButton.destination) {
        this.extensionOwned(phoneButton.destination);
      }
    }
  }

  public delete(phoneButton): void {
    this.$modal.open({
      template: require('./deleteConfirmation.tpl.html'),
      type: 'dialog',
    }).result.then(() => {
      _.pull(this.phoneButtonList, phoneButton);
      this.buildFullPhoneButtonList();
      this.PhoneButtonLayoutService.updatePhoneButtons(this.ownerType, this.ownerId, this.phoneButtonListFull).then( () => undefined).catch(() => {
        this.Notification.error('phoneButtonLayout.updatePhoneButtonLayoutFailed');
      });
    });
  }

  public getButtonLimitReachedText(): string {
    const buttonLimitText = this.$translate.instant('phoneButtonLayout.reachedButtonLimit', { buttonLimit: PHONE_BUTTON_LIMIT });
    return buttonLimitText;
  }

  public getTooltipText(phoneButton: IPhoneButton): string {
    const tooltipText = this.$translate.instant('phoneButtonLayout.blfPickup', { username: this.ownerName, extension: phoneButton.destination });
    return tooltipText;
  }

  private buildActionList(): void {
    const hasAddButtonsAction = _.some(this.actionList, { actionKey: 'phoneButtonLayout.addButton' });
    if (this.editing || this.isReordering()) {
      this.actionList = [];  // empty the actionList so that it's not displayed
    } else {
      if (hasAddButtonsAction) {
        if (this.isButtonLimitReached) {
          _.remove(this.actionList, (action) => {
            return action.actionKey === 'phoneButtonLayout.addButton';
          });
        }
      } else {
        if (!this.isButtonLimitReached) {
          // add the addButtons action to the beginning of the actionList array
          this.actionList.unshift({
            actionKey: 'phoneButtonLayout.addButton',
            actionFunction: this.add.bind(this),
          });
        }
      }
      const hasReorderButtonAction = _.some(this.actionList, { actionKey: 'phoneButtonLayout.reorder' });
      if (!hasReorderButtonAction) {
        this.actionList.push({
          actionKey: 'phoneButtonLayout.reorder',
          actionFunction: this.setReorder.bind(this),
        });
      }
    }
  }

  private buildFullPhoneButtonList(): void {
    this.phoneButtonListFull = _.concat(this.phoneButtonListReadonly, this.phoneButtonList);
    this.updateIndex();
  }

  private buildButtonTypeObject(buttonTypeValue: string): IPhoneButtonType {
    return {
      name: this.$translate.instant('phoneButtonLayout.buttonType.' + buttonTypeValue),
      value: buttonTypeValue,
    };
  }

  private deactivateDraggable() {
    if (!_.isUndefined(this.draggableInstance)) {
      this.draggableInstance.selectedItem = undefined;
      this.draggableInstance.reordering = false;
    }
  }

  private setDefaultPhoneButtonAttributes(phoneButtonList: IPhoneButton[]): IPhoneButton[] {
    _.each(phoneButtonList, (phoneButton) => {
      if (phoneButton.type === 'FEATURE_SPEED_DIAL') {
        // convert non-blf speed dials to blf speeed dials
        phoneButton.type = 'FEATURE_SPEED_DIAL_BLF';
      } else if (phoneButton.type === 'FEATURE_CALL_PARK') {
        // convert non-blf call parks to blf call parks
        phoneButton.type = 'FEATURE_BLF_DIRECTED_PARK';
      }
      if (phoneButton.type === 'FEATURE_SPEED_DIAL_BLF') {
        phoneButton.isEditable = true;
        phoneButton.isDeletable = true;
      } else if (phoneButton.type === 'FEATURE_NONE') {
        phoneButton.appliesToSharedLines = false;
        phoneButton.callPickupEnabled = false;
        phoneButton.destination = '';
        phoneButton.isEditable = false;
        phoneButton.isDeletable = true;
        phoneButton.label = this.$translate.instant('common.none');
      } else {
        phoneButton.isEditable = false;
        phoneButton.isDeletable = false;
      }
    });
    return phoneButtonList;
  }

  private updateIndex(): void {
    _.each(this.phoneButtonListFull, (phoneButton, index) => {
      phoneButton.index = index + 1;  // button index should start with 1, not 0
    });
  }
}

export class PhoneButtonLayoutComponent implements ng.IComponentOptions {
  public controller = PhoneButtonLayoutCtrl;
  public template = require('./phoneButtonLayout.html');
  public bindings = {
    hasPhoneButtonsFeatureToggle: '<',
    ownerId: '<',
    ownerType: '@',
  };
}
