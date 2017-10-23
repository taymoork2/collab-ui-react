import { SpeedDialService, ISpeedDial } from './speedDial.service';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import { Notification } from 'modules/core/notifications';
import { CallDestinationTranslateService, ICallDestinationTranslate } from 'modules/call/shared/call-destination-translate';
import { AccessibilityService, KeyCodes } from 'modules/core/accessibility/accessibility.service';
import { IToolkitModalService } from 'modules/core/modal';

interface IValidationMessages {
  required: string;
  pattern: string;
}

interface ITranslationMessages {
  placeholderText: string;
  helpText: string;
}

const SPEED_DIAL_LIMIT = 125;
const inputs: string[] = ['external', 'uri', 'custom'];

class SpeedDialCtrl implements ng.IComponentController {
  private ownerId: string;
  private ownerType: string;
  private firstReordering: boolean = true;
  private editing: boolean;
  private reordering: boolean;
  private speedDialList: ISpeedDial[] = [];
  private copyList: ISpeedDial[] | undefined;
  private newLabel: string;
  private newNumber: string;
  private labelMessages: IValidationMessages;
  private numberMessages: IValidationMessages;
  private customTranslations: ITranslationMessages;
  private inputTranslations: ICallDestinationTranslate;
  private customNumberValidationPatern: RegExp;
  private actionList: IActionItem[];
  private actionListCopy: IActionItem[] = [];
  private callDestInputs: string[];
  private optionSelected: string = '';
  private selectedSpeedDial?: ISpeedDial;
  private dragularInstance: any;

  public ownerName: string = '';
  public isValid: boolean = false;
  public extension: string = '';
  public inputType: any;
  public callPickupEnabled: boolean = false;
  public form: ng.IFormController;
  public countryCode: string;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $modal: IToolkitModalService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private AccessibilityService: AccessibilityService,
    private Authinfo,
    private BlfInternalExtValidation,
    private BlfURIValidation,
    private CallDestinationTranslateService: CallDestinationTranslateService,
    private dragularService,
    private FeatureMemberService,
    private Notification: Notification,
    private Orgservice,
    private SpeedDialService: SpeedDialService,
  ) {
    const params = {
      basicInfo: true,
    };
    this.Orgservice.getOrg(_.noop, null, params).then(response => {
      this.countryCode = response.data.countryCode;
    });
    this.callDestInputs = inputs;
    this.firstReordering = true;
    this.editing = false;
    this.reordering = false;
    this.FeatureMemberService.getUser(this.ownerId).then((user) => {
      this.ownerName = this.FeatureMemberService.getFullNameFromUser(user);
    });
    this.SpeedDialService.getSpeedDials(this.ownerType, this.ownerId).then((data) => {
      this.speedDialList = data.speedDials;
    }).catch(() => {
      this.Notification.error('speedDials.retrieveSpeedDialsFail');
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

    if (!this.reachSpeedDialLimit()) {
      this.actionListCopy.push({
        actionKey: 'speedDials.addSpeedDial',
        actionFunction: this.add.bind(this),
      });
    }
    this.actionListCopy.push({
      actionKey: 'speedDials.reorder',
      actionFunction: this.setReorder.bind(this),
    });
    this.actionList = _.cloneDeep(this.actionListCopy);
    this.inputTranslations = this.CallDestinationTranslateService.getCallDestinationTranslate();
    this.customNumberValidationPatern = this.CallDestinationTranslateService.getCustomNumberValidationPatern();
  }

  public extensionOwned(number: string): void {
    this.$timeout(() => {
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
    });
  }

  public reachSpeedDialLimit() {
    return this.speedDialList.length >= SPEED_DIAL_LIMIT;
  }

  public add(): void {
    const sd = {
      index: this.speedDialList.length + 1,
      label: '',
      number: '',
      callDest: undefined,
      callPickupEnabled: this.callPickupEnabled,
    };
    this.speedDialList.push(sd);
    this.setEdit(sd);
    this.$timeout(function () {
      $('#sd-' + sd.index).focus();
    }, 100);
  }

  public setSpeedDial(number): void {
    this.newNumber = number;
    this.isValid = false;
    this.callPickupEnabled = false;
    this.extensionOwned(this.newNumber);
  }

  public save(): void {
    if (this.editing) {
      const sd = _.find(this.speedDialList, {
        edit: true,
      });
      sd.edit = false;
      sd.label = this.newLabel;
      sd.callPickupEnabled = this.callPickupEnabled;
      sd.number = _.replace(this.newNumber, / /g, '');
    } else if (this.reordering) {
      this.updateIndex();
      this.copyList = undefined;
    }

    this.SpeedDialService.updateSpeedDials(this.ownerType, this.ownerId, this.speedDialList).then(() => {
      this.isValid = false;
      this.reordering = false;
      this.editing = false;
      this.actionList = _.cloneDeep(this.actionListCopy);
      this.selectedSpeedDial = undefined;
    }, () => {
      this.Notification.error('speedDials.speedDialChangesFailed');
      if (_.has(this, 'ownerId')) {
        this.SpeedDialService.getSpeedDials(this.ownerType, this.ownerId).then((data) => {
          this.speedDialList = data.speedDials;
        }).catch(() => {
          this.Notification.error('speedDials.retrieveSpeedDialsFail');
        });
      }
      this.reordering = false;
      this.editing = false;
      this.actionList = _.cloneDeep(this.actionListCopy);
      this.selectedSpeedDial = undefined;
    });
  }

  public reset(): void {
    if (this.editing) {
      const sd = _.find(this.speedDialList, {
        edit: true,
      });
      if (_.isEmpty(sd.label) || _.isEmpty(sd.number)) {
        //Create case: remove last element
        this.speedDialList.pop();
      } else {
        //Update case: go back to read only mode
        sd.edit = false;
      }
      this.newLabel = '';
      this.newNumber = '';
      this.callPickupEnabled = false;
      this.isValid = false;
    } else if (this.reordering) {
      this.speedDialList.length = 0;
      Array.prototype.push.apply(this.speedDialList, _.cloneDeep(this.copyList));
    }
    this.editing = false;
    this.reordering = false;
    this.actionList = _.cloneDeep(this.actionListCopy);
    this.selectedSpeedDial = undefined;
  }

  public setReorder(): void {
    this.reordering = true;
    this.actionList = [];
    this.copyList = _.cloneDeep(this.speedDialList);
    if (this.firstReordering) {
      this.firstReordering = false;
      this.dragularInstance = this.createDragularInstance();
    }
  }

  private createDragularInstance() {
    return this.dragularService('#speedDialsContainer', {
      classes: {
        transit: 'sd-reorder-transit',
      },
      containersModel: [this.speedDialList],
      moves: () => {
        return this.reordering;
      },
    });
  }

  // TODO: a separate component for drag and drop lists should be created so that
  // there's uniform keyboard navigation for all places where dragular is used
  // without breaking the existing functionality and avoiding duplicate code
  public speedDialKeypress($event: KeyboardEvent, sd: ISpeedDial) {
    if (!this.reordering) {
      return;
    }

    const keycode = $event.which;
    switch (keycode) {
      case KeyCodes.ENTER:
      case KeyCodes.SPACE:
        if (_.isUndefined(this.selectedSpeedDial)) {
          this.selectedSpeedDial = sd;
        } else {
          this.selectedSpeedDial = undefined;
        }
        break;
      case KeyCodes.UP:
        if (_.isUndefined(this.selectedSpeedDial) && sd.index > 1) {
          this.AccessibilityService.setFocus(this.$element, `#speedDial${sd.index - 1}`);
        } else if (sd.index > 1) {
          this.pushSpeedDial(keycode);
        }
        break;
      case KeyCodes.DOWN:
        if (_.isUndefined(this.selectedSpeedDial) && sd.index < this.speedDialList.length) {
          this.AccessibilityService.setFocus(this.$element, `#speedDial${sd.index + 1}`);
        } else if (sd.index < this.speedDialList.length) {
          this.pushSpeedDial(keycode);
        }
        break;
      case KeyCodes.TAB: // prevent tab from breaking arrow navigation
        if ($event.shiftKey && this.selectedSpeedDial && sd.index > 1) {
          $event.preventDefault();
          $event.stopPropagation();
          this.pushSpeedDial(KeyCodes.UP);
        } else if (!$event.shiftKey && this.selectedSpeedDial && sd.index < this.speedDialList.length) {
          $event.preventDefault();
          $event.stopPropagation();
          this.pushSpeedDial(KeyCodes.DOWN);
        } else { // resets to undefined for tabbing out of the speed dial re-order menu
          this.selectedSpeedDial = undefined;
        }
        break;
    }
  }

  private pushSpeedDial(keycode: number) {
    if (this.selectedSpeedDial) {
      const index = this.selectedSpeedDial.index;
      const speedDialList = _.cloneDeep(this.speedDialList);
      speedDialList.splice(index - 1, 1);  // remove selectedSpeedDial from list

      // reinsert selectedSpeedDial into list at new position
      if (keycode === KeyCodes.UP) {
        speedDialList.splice(index - 2, 0, this.selectedSpeedDial);
        this.selectedSpeedDial.index = index - 1;
      } else {
        speedDialList.splice(index, 0, this.selectedSpeedDial);
        this.selectedSpeedDial.index = index + 1;
      }

      // re-order the speed dial index numbers
      _.forEach(speedDialList, (speedDial: ISpeedDial, index: number) => {
        speedDial.index = index + 1;
      });

      this.speedDialList = speedDialList;
      this.dragularInstance.destroy();
      this.dragularInstance = this.createDragularInstance();
      this.AccessibilityService.setFocus(this.$element, `#speedDial${this.selectedSpeedDial!.index}`);
    }
  }

  public isSelectedSpeedDial(sd: ISpeedDial) {
    return sd === this.selectedSpeedDial;
  }

  public setEdit(sd: ISpeedDial): void {
    if (_.isObject(sd) && _.has(sd, 'label') && _.has(sd, 'number')) {
      this.editing = true;
      sd.edit = true;
      this.newLabel = sd.label;
      this.newNumber = sd.number;
      this.callPickupEnabled = <boolean>sd.callPickupEnabled;
      if (sd.number) {
        this.extensionOwned(sd.number);
      }
    }
  }

  public delete(sd): void {
    this.$modal.open({
      template: require('modules/huron/speedDials/deleteConfirmation.tpl.html'),
      type: 'dialog',
    }).result.then(() => {
      _.pull(this.speedDialList, sd);
      this.updateIndex();
      this.SpeedDialService.updateSpeedDials(this.ownerType, this.ownerId, this.speedDialList).then( () => undefined).catch(() => {
        this.Notification.error('speedDials.speedDialChangesFailed');
      });
    });
  }

  public getTooltipText(sd: ISpeedDial): string {
    const tooltipText = this.$translate.instant('speedDials.blfPickup', { username: this.ownerName, extension: sd.number });
    return tooltipText;
  }

  private updateIndex(): void {
    _.each(this.speedDialList, (sd, index) => {
      sd.index = index + 1;
    });
  }
}

export class SpeedDialComponent implements ng.IComponentOptions {
  public controller = SpeedDialCtrl;
  public template = require('modules/huron/speedDials/speedDials.html');
  public bindings = {
    ownerId: '<',
    ownerType: '@',
  };
}
