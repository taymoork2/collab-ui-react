import { InternalNumberRange } from 'modules/call/shared/internal-number-range';

class ExtensionRangeCtrl implements ng.IComponentController {
  public extensionLength: string;
  public steeringDigit: string;
  public numberRanges: InternalNumberRange[];
  public firstTimeSetup: boolean;
  public isCreateLocation: boolean;
  public isRoutingPrefixValid: boolean;
  public onChangeFn: Function;
  public extensionRangeForm: ng.IFormController;
  public messages: any = {};
  public DEFAULT_START_RANGE: string = '500';
  public DEFAULT_END_RANGE: string = '599';
  public addDisabled: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      minlength: this.$translate.instant('serviceSetupModal.extensionLengthError'),
      maxlength: this.$translate.instant('serviceSetupModal.extensionLengthError'),
      pattern: this.$translate.instant('validation.numeric'),
      rangeLength: this.$translate.instant('serviceSetupModal.rangeTooLargeError'),
      lessThan: this.$translate.instant('serviceSetupModal.lessThanGreaterThan'),
      greaterThan: this.$translate.instant('serviceSetupModal.lessThanGreaterThan'),
      required: this.$translate.instant('validation.required'),
      overlap: this.$translate.instant('serviceSetupModal.rangeOverlap'),
      singleNumber: this.$translate.instant('serviceSetupModal.singleNumberRangeError'),
    };
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { numberRanges } = changes;

    if (numberRanges && numberRanges.currentValue) {
      if (numberRanges.currentValue.length < 1) {
        if (this.firstTimeSetup) {
          this.numberRanges = [{
            beginNumber: this.DEFAULT_START_RANGE,
            endNumber: this.DEFAULT_END_RANGE,
          }];
          this.onExtensionRangeChange();
        } else {
          this.addExtensionRange();
        }
      }
    }
  }

  public onExtensionRangeChange(): void {
    this.onChangeFn({
      extensionRanges: this.numberRanges,
    });
  }

  public addExtensionRange(): void {
    this.numberRanges.push({
      beginNumber: '',
      endNumber: '',
    });
    if (this.extensionRangeForm) {
      this.extensionRangeForm.$setDirty();
    }
    this.onExtensionRangeChange();
  }

  public removeExtensionRange(internalNumberRange): void {
    const index = _.findIndex(this.numberRanges, {
      beginNumber: internalNumberRange.beginNumber,
      endNumber: internalNumberRange.endNumber,
    });
    if (index !== -1) {
      this.numberRanges.splice(index, 1);
    }
    this.extensionRangeForm.$setDirty();
    this.onExtensionRangeChange();
  }

  public steeringDigitOverlap(range: InternalNumberRange) {
    if (_.startsWith(range.beginNumber, this.steeringDigit) ||
      _.startsWith(range.endNumber, this.steeringDigit)) {
      return true;
    }
    return false;
  }

  public showTrashCan(numberRange: InternalNumberRange): boolean {
    if (this.isCreateLocation && !_.isEmpty(numberRange.uuid)) {
      return false;
    } else if (this.numberRanges.length === 1) {
      return false;
    }
    return true;
  }

  public isDisabled(numberRange: InternalNumberRange): boolean {
    if (this.isCreateLocation) {
      if (this.isRoutingPrefixValid) {
        this.addDisabled = false;
        return !_.isEmpty(numberRange.uuid);
      } else {
        this.addDisabled = true;
        return true;
      }
    } else {
      return !_.isEmpty(numberRange.uuid);
    }
  }

}

export class ExtensionRangeComponent implements ng.IComponentOptions {
  public controller = ExtensionRangeCtrl;
  public template = require('modules/call/settings/settings-extension-range/settings-extension-range.component.html');
  public bindings = {
    steeringDigit: '<',
    extensionLength: '<',
    numberRanges: '<',
    firstTimeSetup: '<',
    isCreateLocation: '<',
    isRoutingPrefixValid: '<',
    onChangeFn: '&',
  };
}
