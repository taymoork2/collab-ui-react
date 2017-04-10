import { SpeedDialService, ISpeedDial } from './speedDial.service';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import { Notification } from 'modules/core/notifications';
import { HuronCustomerService } from 'modules/huron/customer/customer.service';
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
  private actionList: IActionItem[];
  private actionListCopy: IActionItem[] = [];
  public ownerName: string = '';
  public isValid: boolean = false;
  public extension: string = '';
  public inputType: any;
  public callPickupEnabled: boolean = false;
 // private
  private callDest: any;
  private callDestInputs: string[];
  public form: ng.IFormController;
  private optionSelected: string = '';

  /* @ngInject */
  constructor(
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private dragularService,
    private Notification: Notification,
    private SpeedDialService: SpeedDialService,
    private TelephoneNumberService,
    private $timeout,
    private HuronCustomerService: HuronCustomerService,
    private BlfInternalExtValidation,
    private Authinfo,
    private FeatureMemberService,
    private BlfURIValidation,
  ) {
    this.callDestInputs = inputs;
    this.firstReordering = true;
    this.editing = false;
    this.reordering = false;
    this.SpeedDialService.getUserName(this.ownerId)
    .then((user) => {
      this.ownerName = this.FeatureMemberService.getFirstLastName(user);
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
        actionKey: this.$translate.instant('speedDials.addSpeedDial'),
        actionFunction: this.add.bind(this),
      });
    }
    this.actionListCopy.push({
      actionKey: this.$translate.instant('speedDials.reorder'),
      actionFunction: this.setReorder.bind(this),
    });
    this.actionList = _.cloneDeep(this.actionListCopy);
  }

  public extensionOwned() {
    this.$timeout(() => {
      this.extension = this.callDest.phoneNumber;
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
    let sd = {
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

  public setSpeedDial(model) {
    this.callDest = model;
    this.isValid = false;
    this.callPickupEnabled = false;
    this.extensionOwned();
  }

  public save(): void {
    if (this.editing) {
      let sd = _.find(this.speedDialList, {
        edit: true,
      });
      sd.edit = false;
      sd.label = this.newLabel;
      sd.callPickupEnabled = this.callPickupEnabled;
      this.newNumber = this.callDest.phoneNumber;
      if (this.TelephoneNumberService.validateDID(this.callDest.phoneNumber)) {
        this.newNumber = this.TelephoneNumberService.getDIDValue(this.callDest.phoneNumber);
      } else if (this.callDest.phoneNumber.indexOf('@') === -1) {
        this.newNumber = _.replace(this.callDest.phoneNumber, /-/g, '');
      }
      sd.number = this.newNumber.replace(/ /g, '');
    } else if (this.reordering) {
      this.updateIndex();
      this.copyList = undefined;
    }

    this.SpeedDialService.updateSpeedDials(this.ownerType, this.ownerId, this.speedDialList).then(() => {
      this.callDest = 'undefined';
      this.isValid = false;
      this.reordering = false;
      this.editing = false;
      this.actionList = _.cloneDeep(this.actionListCopy);
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
    });
  }

  public reset(): void {
    if (this.editing) {
      let sd = _.find(this.speedDialList, {
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
      this.callDest = 'undefined';
      this.callPickupEnabled = false;
      this.isValid = false;
    } else if (this.reordering) {
      this.speedDialList.length = 0;
      Array.prototype.push.apply(this.speedDialList, _.cloneDeep(this.copyList));
    }
    this.editing = false;
    this.reordering = false;
    this.actionList = _.cloneDeep(this.actionListCopy);
  }

  public setReorder(): void {
    this.reordering = true;
    this.actionList = [];
    this.copyList = _.cloneDeep(this.speedDialList);
    if (this.firstReordering) {
      this.firstReordering = false;
      this.dragularService('#speedDialsContainer', {
        classes: {
          transit: 'sd-reorder-transit',
        },
        containersModel: [this.speedDialList],
        moves: () => {
          return this.reordering;
        },
      });
    }
  }

  public setEdit(sd: ISpeedDial): void {
    if (_.isObject(sd) && _.has(sd, 'label') && _.has(sd, 'number')) {
      this.editing = true;
      sd.edit = true;
      this.newLabel = sd.label;
      this.callPickupEnabled = <boolean>sd.callPickupEnabled;
      if (sd.number) {
        this.callDest = this.TelephoneNumberService.getDestinationObject(sd.number);
        this.extensionOwned();
      }
    }
  }

  public getRegionCode() {
    return this.HuronCustomerService.getVoiceCustomer();
  }

  public delete(sd): void {
    this.$modal.open({
      templateUrl: 'modules/huron/speedDials/deleteConfirmation.tpl.html',
      type: 'dialog',
    }).result.then(() => {
      _.pull(this.speedDialList, sd);
      this.updateIndex();
      this.SpeedDialService.updateSpeedDials(this.ownerType, this.ownerId, this.speedDialList).then( () => undefined).catch(() => {
        this.Notification.error('speedDials.speedDialChangesFailed');
      });
    });
  }

  private updateIndex(): void {
    _.each(this.speedDialList, (sd, index) => {
      sd.index = index + 1;
    });
  }
}

export class SpeedDialComponent implements ng.IComponentOptions {
  public controller = SpeedDialCtrl;
  public templateUrl = 'modules/huron/speedDials/speedDials.html';
  public bindings = {
    ownerId: '<',
    ownerType: '@',
  };
}
