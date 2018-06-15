import { IOption } from 'modules/huron/dialing/dialing.service';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { LocationCallerId } from 'modules/call/locations/shared';

class LocationCallerIdCtrl implements ng.IComponentController {
  public callerId: LocationCallerId;
  public showLabel: boolean;
  public selectedNumber: string;
  public regionCode: string;
  public companyName: string;
  public externalNumberOptions: IOption[];
  public voicemailPilotNumber: string;
  public onChangeFn: Function;
  public onNumberFilter: Function;
  public locationCallerIdEnabled: boolean;
  public size: string;
  public keyPress: Function;
  public origCallerId: LocationCallerId;

  /* @ngInject */
  constructor(
    private PhoneNumberService: PhoneNumberService,
  ) { }

  public $onInit(): void {
    this.origCallerId = _.cloneDeep(this.callerId);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      callerId,
      externalNumberOptions,
    } = changes;

    if (externalNumberOptions && externalNumberOptions.currentValue) {
      this.externalNumberOptions = _.filter<IOption>(externalNumberOptions.currentValue, externalNumber => {
        return !_.isEqual(_.get(externalNumber, 'value'), this.voicemailPilotNumber);
      });
    }

    if (callerId && callerId.currentValue) {
      this.origCallerId = _.cloneDeep(this.callerId);
      this.locationCallerIdEnabled = true;
      this.selectedNumber = this.PhoneNumberService.getNationalFormat(callerId.currentValue.number);
    } else if (callerId && !callerId.currentValue) {
      this.locationCallerIdEnabled = false;
    }
  }

  public onLocationCallerIdToggled(value: boolean): void {
    if (value && this.origCallerId) {
      this.onChange(this.origCallerId);
    } else if (value) {
      this.callerId = new LocationCallerId({
        name: this.companyName,
        number: '',
        uuid: '',
      });
      this.onChange(this.callerId);
    } else {
      this.onChange(null);
    }
  }

  public onLocationCallerIdNameChanged(): void {
    this.onChange(this.callerId);
  }

  public onLocationCallerIdNumberChanged(value): void {
    if (_.isObject(value)) {
      this.callerId.number = this.PhoneNumberService.getE164Format(_.get<string>(value, 'value'));
    } else {
      this.callerId.number = this.PhoneNumberService.getE164Format(value);
    }
    this.onChange(this.callerId);
  }

  public getNumbers(filter: string): void {
    this.onNumberFilter({
      filter: filter,
    });
  }

  public onChange(callerId: LocationCallerId | null): void {
    if (callerId && callerId.uuid && !_.isEqual(callerId, this.origCallerId)) {
      callerId.uuid = undefined;
    }
    this.onChangeFn({
      callerId: _.cloneDeep(callerId),
    });
  }

  public evalKeyPress ($event): void {
    this.keyPress($event);
  }

}

export class LocationCallerIdComponent implements ng.IComponentOptions {
  public controller = LocationCallerIdCtrl;
  public template = require('modules/call/locations/locations-caller-id/locations-caller-id.component.html');
  public bindings = {
    showLabel: '<',
    callerId: '<',
    regionCode: '<',
    externalNumberOptions: '<',
    voicemailPilotNumber: '<',
    companyName: '<',
    onNumberFilter: '&',
    onChangeFn: '&',
    size: '&',
    keyPress: '&',
  };
}
