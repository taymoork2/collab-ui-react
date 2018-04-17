import { EmergencyCallbackNumber } from 'modules/huron/sites';
import { HuronSettingsService, E911_ADDRESS_PENDING, IEmergencyNumberOption } from 'modules/call/settings/shared';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

class EmergencyServiceNumberCtrl implements ng.IComponentController {
  public voicemailPilotNumber: string;
  public emergencyCallbackNumber: EmergencyCallbackNumber;
  public selectedNumber: IEmergencyNumberOption | null;
  public externalNumberOptions: IEmergencyNumberOption[];
  public onNumberFilterFn: Function;
  public onChangeFn: Function;

  public emergencyServiceNumberForm: ng.IFormController;
  public filterPlaceholder: string;
  public showMissingEmergencyCallbackNumber: boolean;
  public e911PendingError: boolean;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HuronSettingsService: HuronSettingsService,
    private PhoneNumberService: PhoneNumberService,
    private ModalService,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      emergencyCallbackNumber,
      externalNumberOptions,
    } = changes;

    if (externalNumberOptions && externalNumberOptions.currentValue) {
      this.externalNumberOptions = _.filter<IEmergencyNumberOption>(externalNumberOptions.currentValue, externalNumber => {
        return !_.isEqual(_.get(externalNumber, 'pattern'), this.voicemailPilotNumber);
      });
    }

    if (emergencyCallbackNumber) {
      if (!_.isNull(emergencyCallbackNumber.currentValue)) {
        this.showMissingEmergencyCallbackNumber = this.checkNumberIsAssigned(emergencyCallbackNumber.currentValue, this.externalNumberOptions) ? false : true;
        this.selectedNumber = {
          value: emergencyCallbackNumber.currentValue.uuid,
          pattern: emergencyCallbackNumber.currentValue.pattern,
          label: this.PhoneNumberService.getNationalFormat(emergencyCallbackNumber.currentValue.pattern),
        };
      } else {
        this.showMissingEmergencyCallbackNumber = true;
        this.selectedNumber = null;
      }

      if (this.emergencyServiceNumberForm) {
        if (this.emergencyServiceNumberForm.$invalid) {
          this.e911PendingError = true;
        }
      }
    }
  }

  public onEmergencyServiceNumberChanged(): void {
    this.emergencyServiceNumberForm.$setValidity('', false, this.emergencyServiceNumberForm);
    this.HuronSettingsService.getE911State(_.get<string>(this.selectedNumber, 'pattern'))
      .then(e911Status => {
        if (e911Status === E911_ADDRESS_PENDING) {
          return this.ModalService.open({
            hideDismiss: true,
            hideTitle: true,
            message: this.$translate.instant('huronSettings.e911Unavailable'),
            dismiss: this.$translate.instant('common.ok'),
            btnType: 'primary',
          });
        } else {
          this.emergencyServiceNumberForm.$setValidity('', true, this.emergencyServiceNumberForm);
          this.onChangeFn({
            emergencyCallbackNumber: {
              uuid: _.get(this.selectedNumber, 'value'),
              pattern: _.get(this.selectedNumber, 'pattern'),
            },
          });
        }
      });
  }

  public getNumbers(filter: string): void {
    this.onNumberFilterFn({
      filter: filter,
    });
  }

  private checkNumberIsAssigned(currentValue: EmergencyCallbackNumber, existingOptions: IEmergencyNumberOption[]): Boolean {
    return Boolean(_.find(existingOptions, { value: currentValue.uuid }));
  }

}

export class EmergencyServiceNumberComponent implements ng.IComponentOptions {
  public controller = EmergencyServiceNumberCtrl;
  public template = require('modules/call/settings/settings-emergency-service-number/settings-emergency-service-number.component.html');
  public bindings = {
    voicemailPilotNumber: '<',
    emergencyCallbackNumber: '<',
    externalNumberOptions: '<',
    onNumberFilterFn: '&',
    onChangeFn: '&',
  };
}
