import { Site } from 'modules/huron/sites';
import { IExtensionRange } from 'modules/huron/settings/extensionRange';

const MAX_NUMBER_RANGE_COUNT: number = 20;

class ExtensionRangeCtrl implements ng.IComponentController {
  public site: Site;
  public numberRanges: IExtensionRange[];
  public firstTimeSetup: boolean;
  public onChangeFn: Function;
  public extensionRangeForm: ng.IFormController;
  public messages: any = {};
  public DEFAULT_START_RANGE: string = '500';
  public DEFAULT_END_RANGE: string = '599';

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

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
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
    if (this.numberRanges.length < MAX_NUMBER_RANGE_COUNT) {
      this.numberRanges.push({
        beginNumber: '',
        endNumber: '',
      });
      this.extensionRangeForm.$setDirty();
      this.onExtensionRangeChange();
    }
  }

  public removeExtensionRange(internalNumberRange): void {
    let index = _.findIndex(this.numberRanges, {
      beginNumber: internalNumberRange.beginNumber,
      endNumber: internalNumberRange.endNumber,
    });
    if (index !== -1) {
      this.numberRanges.splice(index, 1);
    }
    this.extensionRangeForm.$setDirty();
    this.onExtensionRangeChange();
  }

  public steeringDigitOverlap(range: IExtensionRange) {
    if (_.startsWith(range.beginNumber, this.site.steeringDigit) ||
      _.startsWith(range.endNumber, this.site.steeringDigit)) {
      return true;
    }
    return false;
  }

  public showTrashCan(): boolean {
    if (this.numberRanges.length === 1) {
      return false;
    }
    return true;
  }

  public isDisabled(numberRange: IExtensionRange): boolean {
    return !_.isEmpty(numberRange.uuid);
  }

}

export class ExtensionRangeComponent implements ng.IComponentOptions {
  public controller = ExtensionRangeCtrl;
  public templateUrl = 'modules/huron/settings/extensionRange/extensionRange.html';
  public bindings = {
    site: '<',
    numberRanges: '<',
    firstTimeSetup: '<',
    onChangeFn: '&',
  };
}
