import { IOption } from 'modules/huron/dialing';
import { VoicemailPilotNumber } from 'modules/call/locations/shared';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

export class LocationsVoicemailComponent implements ng.IComponentOptions {
  public controller = LocationsVoicemailComponentCtrl;
  public template = require('modules/call/locations/locations-voicemail/locations-voicemail.component.html');
  public bindings = {
    displayLabel: '<',
    voicemailPilotNumber: '<',
    dialPlanCountryCode: '<',
    externalNumberOptions: '<',
    voicemailToEmailEnabled: '<',
    changeFn: '&',
    numberFilterFn: '&',
  };
}

class LocationsVoicemailComponentCtrl implements ng.IComponentController {
  public displayLabel: boolean;
  public voicemailPilotNumber: VoicemailPilotNumber;
  public dialPlanCountryCode: string;
  public externalNumberOptions: IOption[];
  public voicemailToEmailEnabled: boolean;
  private changeFn: Function;
  private numberFilterFn: Function;

  public externalAccess: boolean;
  public selectPlaceholder: string;
  public voicemailToEmailText: string;
  public externalNumberModel: IOption | null;
  public missingDirectNumbers: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private ServiceSetup,
    private Authinfo,
  ) {}

  public $onInit(): void {
    this.selectPlaceholder = this.$translate.instant('locations.voicemailFilter');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      voicemailPilotNumber,
      voicemailToEmailEnabled,
      externalNumberOptions,
    } = changes;

    if (voicemailPilotNumber) {
      if (!_.isUndefined(voicemailPilotNumber.currentValue) && !_.isNull(voicemailPilotNumber.currentValue) && !voicemailPilotNumber.currentValue.generated) {
        this.externalAccess = true;
        this.externalNumberModel = this.setCurrentOption(_.get(voicemailPilotNumber.currentValue, 'number'), this.externalNumberOptions);
      } else {
        this.externalAccess = false;
        this.externalNumberModel = null;
      }
    }

    if (voicemailToEmailEnabled) {
      this.voicemailToEmailText = voicemailToEmailEnabled.currentValue ? this.$translate.instant('locations.voicemailInstructionEnabled') : this.$translate.instant('locations.voicemailInstructionDisabled');
    }

    if (externalNumberOptions) {
      if (externalNumberOptions.currentValue && _.isArray(externalNumberOptions.currentValue)) {
        if (externalNumberOptions.currentValue.length === 0) {
          this.missingDirectNumbers = true;
        } else {
          this.missingDirectNumbers = false;
        }
      }
    }
  }

  public onNumberFilter(filter: string): void {
    this.numberFilterFn({
      filter: filter,
    });
  }

  public onExternalVoicemailAccessChanged(): void {
    if (this.externalAccess) {
      this.externalNumberModel = this.externalNumberOptions[0];
      this.onChange(new VoicemailPilotNumber({
        number: this.externalNumberModel.value,
        generated: false,
      }));
    } else {
      this.externalNumberModel = null;
      this.onChange(new VoicemailPilotNumber({
        number: this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode),
        generated: true,
      }));
    }
  }

  public onCompanyVoicemailNumberChanged() {
    this.onChange(new VoicemailPilotNumber({
      number: _.get(this.externalNumberModel, 'value'),
      generated: false,
    }));
  }

  public onChange(voicemailPilotNumber: VoicemailPilotNumber): void {
    this.changeFn({
      voicemailPilotNumber: voicemailPilotNumber,
    });
  }

  private setCurrentOption(currentValue: string, existingOptions: IOption[]): IOption {
    const existingOption: IOption = _.find(existingOptions, { value: currentValue });
    if (!existingOption) {
      const currentExternalNumberOption: IOption = {
        value: currentValue,
        label: this.PhoneNumberService.getNationalFormat(currentValue),
      };
      existingOptions.unshift(currentExternalNumberOption);
      return currentExternalNumberOption;
    } else {
      return existingOption;
    }
  }
}
