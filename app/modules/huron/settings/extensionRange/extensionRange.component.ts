import { Site } from 'modules/huron/sites';
import { IExtensionRange } from 'modules/huron/settings/extensionRange';

class ExtensionRangeCtrl implements ng.IComponentController {
  public site: Site;
  public numberRanges: Array<IExtensionRange>;
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

  public $onInit(): void {
    if (this.numberRanges && this.numberRanges.length === 0) {
      this.numberRanges = [{
        beginNumber: this.DEFAULT_START_RANGE,
        endNumber: this.DEFAULT_END_RANGE,
      }];
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
    this.extensionRangeForm.$setDirty();
    this.onExtensionRangeChange();
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
    return !this.firstTimeSetup && !_.isEmpty(numberRange.uuid);
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
