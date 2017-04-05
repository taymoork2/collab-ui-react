import { Site, EmergencyCallbackNumber } from 'modules/huron/sites';
import { IEmergencyNumberOption } from 'modules/huron/settings/settingsOptions.service';
import { HuronSettingsService, E911_ADDRESS_PENDING } from 'modules/huron/settings';

class EmergencyServiceNumberCtrl implements ng.IComponentController {
  public site: Site;
  public emergencyCallbackNumber: EmergencyCallbackNumber;
  public selectedNumber: IEmergencyNumberOption | null;
  public externalNumberOptions: Array<IEmergencyNumberOption>;
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
    private TelephoneNumberService,
    private ModalService,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const {
      emergencyCallbackNumber,
      externalNumberOptions,
    } = changes;

    if (externalNumberOptions && externalNumberOptions.currentValue) {
      this.externalNumberOptions = _.filter<IEmergencyNumberOption>(externalNumberOptions.currentValue, externalNumber => {
        return !_.isEqual(_.get(externalNumber, 'pattern'), _.get(this.site, 'voicemailPilotNumber'));
      });
    }

    if (emergencyCallbackNumber) {
      if (!_.isNull(emergencyCallbackNumber.currentValue)) {
        this.showMissingEmergencyCallbackNumber = this.checkNumberIsAssigned(emergencyCallbackNumber.currentValue, this.externalNumberOptions) ? false : true;
        this.selectedNumber = {
          value: emergencyCallbackNumber.currentValue.uuid,
          pattern: emergencyCallbackNumber.currentValue.pattern,
          label: this.TelephoneNumberService.getDIDLabel(emergencyCallbackNumber.currentValue.pattern),
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

  private checkNumberIsAssigned(currentValue: EmergencyCallbackNumber, existingOptions: Array<IEmergencyNumberOption>): Boolean {
    return Boolean(_.find(existingOptions, { value: currentValue.uuid }));
  }

}

export class EmergencyServiceNumberComponent implements ng.IComponentOptions {
  public controller = EmergencyServiceNumberCtrl;
  public templateUrl = 'modules/huron/settings/emergencyServiceNumber/emergencyServiceNumber.html';
  public bindings = {
    site: '<',
    emergencyCallbackNumber: '<',
    externalNumberOptions: '<',
    onNumberFilterFn: '&',
    onChangeFn: '&',
  };
}
