import { CallDestinationTranslateService, ICallDestinationTranslate } from 'modules/call/shared/call-destination-translate';
import { DraggableInstance, DraggableService } from 'modules/core/accessibility';
import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { IActionItem } from 'modules/core/shared/section-title/section-title.component';
import { ISpeedDial, SpeedDialService } from './speedDial.service';

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
  private editing: boolean;
  private speedDialList: ISpeedDial[] = [];
  private copyList: ISpeedDial[] | undefined;
  private newLabel: string;
  private newNumber: string;
  public labelMessages: IValidationMessages;
  public numberMessages: IValidationMessages;
  public customTranslations: ITranslationMessages;
  public inputTranslations: ICallDestinationTranslate;
  public customNumberValidationPatern: RegExp;
  public actionList: IActionItem[];
  private actionListCopy: IActionItem[] = [];
  public callDestInputs: string[];
  private optionSelected: string = '';
  private draggableInstance: DraggableInstance;

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
    private Authinfo,
    private BlfInternalExtValidation,
    private BlfURIValidation,
    private CallDestinationTranslateService: CallDestinationTranslateService,
    private DraggableService: DraggableService,
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
    this.editing = false;
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
    } else if (this.isReordering()) {
      this.updateIndex();
      this.copyList = undefined;
      this.deactivateDraggable();
    }

    this.SpeedDialService.updateSpeedDials(this.ownerType, this.ownerId, this.speedDialList).then(() => {
      this.isValid = false;
      this.editing = false;
      this.actionList = _.cloneDeep(this.actionListCopy);
      this.deactivateDraggable();
    }, () => {
      this.Notification.error('speedDials.speedDialChangesFailed');
      if (_.has(this, 'ownerId')) {
        this.SpeedDialService.getSpeedDials(this.ownerType, this.ownerId).then((data) => {
          this.speedDialList = data.speedDials;
        }).catch(() => {
          this.Notification.error('speedDials.retrieveSpeedDialsFail');
        });
      }
      this.editing = false;
      this.actionList = _.cloneDeep(this.actionListCopy);
      this.deactivateDraggable();
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
    } else if (this.isReordering()) {
      this.speedDialList.length = 0;
      Array.prototype.push.apply(this.speedDialList, _.cloneDeep(this.copyList));
    }
    this.editing = false;
    this.actionList = _.cloneDeep(this.actionListCopy);
    this.deactivateDraggable();
  }

  public setReorder(): void {
    this.actionList = [];
    this.copyList = _.cloneDeep(this.speedDialList);
    if (_.isUndefined(this.draggableInstance)) {
      this.draggableInstance = this.DraggableService.createDraggableInstance({
        elem: this.$element,
        identifier: '#speedDialsContainer',
        transitClass: 'sd-reorder',
        itemIdentifier: '#speedDial',
        list: this.speedDialList,
      });
    } else {
      this.draggableInstance.reordering = true;
    }
  }

  public speedDialKeypress($event: KeyboardEvent, sd: ISpeedDial) {
    if (!this.isReordering()) {
      return;
    } else if (_.get(this.draggableInstance, 'keyPress')) {
      this.draggableInstance.keyPress($event, sd);
      this.speedDialList = this.draggableInstance.list;
    }
  }

  public isReordering() {
    return _.get(this.draggableInstance, 'reordering', false);
  }

  public isSelectedSpeedDial(sd: ISpeedDial) {
    return sd === _.get(this.draggableInstance, 'selectedItem');
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

  private deactivateDraggable() {
    if (!_.isUndefined(this.draggableInstance)) {
      this.draggableInstance.selectedItem = undefined;
      this.draggableInstance.reordering = false;
    }
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
