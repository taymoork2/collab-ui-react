import { HuronSettingsService, HuronSettingsData } from 'modules/huron/settings/services';
import { IToolkitModalService } from 'modules/core/modal';

const MIN_EXT_LENGTH: number = 3;
const MAX_EXT_LENGTH: number = 10;

class ExtensionLengthCtrl implements ng.IComponentController {
  public firstTimeSetup: boolean;
  public extensionLength: string;
  public huronSettingsData: HuronSettingsData;
  public extensionsAssigned: boolean;
  public extensionLengthSavedFn: Function;
  public decreaseExtensionLengthFn: Function;
  public onChangeFn: Function;
  public extensionLengthOptions: string[] = [];
  public showHelpText: boolean = false;
  public isDisabled: boolean = false;
  public helpText: string;

  private originalExtLength: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HuronSettingsService: HuronSettingsService,
    private $modal: IToolkitModalService,
    private ModalService,
  ) { }

  public $onInit(): void {
    this.extensionLengthOptions = this.buildExtensionLengthOptions();
    this.buildHelpText();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { extensionLength } = changes;

    if (extensionLength && extensionLength.currentValue) {
      this.originalExtLength = extensionLength.currentValue;
    }
  }

  public onExtensionLengthChanged(): void {
    if (!this.firstTimeSetup) {
      if (_.toSafeInteger(this.extensionLength) > _.toSafeInteger(this.originalExtLength)) {
        if (!this.HuronSettingsService.matchesOriginalConfig(this.huronSettingsData)) {
          this.openPendingChangesWarningDialog()
            .then(() => this.openIncreaseExtLengthIncreaseDialog())
            .then(() => this.openExtensionPrefixModal())
            .then(() => this.onExtensionLengthSaved())
            .catch(() => {
              this.resetExtensionLength();
              this.onChange();
            });
        } else {
          this.openIncreaseExtLengthIncreaseDialog()
            .then(() => this.openExtensionPrefixModal())
            .then(() => this.onExtensionLengthSaved())
            .catch(() => {
              this.resetExtensionLength();
              this.onChange();
            });
        }
      } else {
        this.openDeleteNumberRangesWarningDialog()
          .then(() => {
            this.decreaseExtensionLengthFn({
              extensionLength: this.extensionLength,
            });
          })
          .catch(() => {
            this.resetExtensionLength();
            this.onChange();
          });
      }
    } else {
      this.onChange();
    }
  }

  private onExtensionLengthSaved() {
    this.extensionLengthSavedFn();
  }

  public onChange(): void {
    this.onChangeFn({
      extensionLength: this.extensionLength,
    });
  }

  private buildExtensionLengthOptions(): string[] {
    let options: string[] = [];
    let minExtLength = this.extensionsAssigned ? _.toSafeInteger(this.extensionLength) : MIN_EXT_LENGTH;
    for (let index = minExtLength; index <= MAX_EXT_LENGTH; index++) {
      options.push(_.toString(index));
    }
    return options;
  }

  private buildHelpText(): void {
    if (this.extensionsAssigned) {
      if (this.originalExtLength === MAX_EXT_LENGTH.toString()) {
        this.showHelpText = true;
        this.isDisabled = true;
        this.helpText = this.$translate.instant('serviceSetupModal.extensionLengthServicesHelpText');
      } else if (this.originalExtLength === MIN_EXT_LENGTH.toString()) {
        this.showHelpText = false;
      } else {
        this.showHelpText = true;
        if (_.toSafeInteger(this.extensionLength) === MIN_EXT_LENGTH + 1) {
          this.helpText = this.$translate.instant('serviceSetupModal.extensionLengthSingleOptionHelpText', { minExtLength: MIN_EXT_LENGTH });
        } else {
          this.helpText = this.$translate.instant('serviceSetupModal.extensionLengthRangeOptionHelpText', {
            minExtLength: MIN_EXT_LENGTH,
            extLengthMinusOne: (_.toSafeInteger(this.extensionLength) - 1),
          });
        }
      }
    }
  }

  private openExtensionPrefixModal(): ng.IPromise<any> {
    return this.$modal.open({
      type: 'small',
      template: '<uc-extension-prefix-modal class="ucExtensionPrefixModal" new-extension-length="' + this.extensionLength + '" old-extension-length="' + this.originalExtLength + '" dismiss="$dismiss()" close="$close()"></uc-extension-prefix-modal>',
    }).result;
  }

  private openPendingChangesWarningDialog(): any {
    return this.ModalService.open({
      title: this.$translate.instant('serviceSetupModal.saveChangesFirstTitle'),
      message: this.$translate.instant('serviceSetupModal.saveChangesFirstMessage'),
      close: this.$translate.instant('serviceSetupModal.continueWithoutSaving'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'negative',
    }).result;
  }

  private openDeleteNumberRangesWarningDialog(): any {
    return this.ModalService.open({
      title: this.$translate.instant('common.warning'),
      message: this.$translate.instant('serviceSetupModal.extensionLengthDecreaseWarning'),
      close: this.$translate.instant('common.continue'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'negative',
    }).result;
  }

  private openIncreaseExtLengthIncreaseDialog(): any {
    return this.ModalService.open({
      title: this.$translate.instant('common.warning'),
      message: this.$translate.instant('serviceSetupModal.extensionLengthIncreaseWarning'),
      close: this.$translate.instant('common.continue'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'negative',
    }).result;
  }

  private resetExtensionLength(): void {
    this.extensionLength = this.originalExtLength;
  }

}

export class ExtensionLengthComponent implements ng.IComponentOptions {
  public controller = ExtensionLengthCtrl;
  public templateUrl = 'modules/huron/settings/extensionLength/extensionLength.html';
  public bindings = {
    firstTimeSetup: '<',
    extensionLength: '<',
    huronSettingsData: '<',
    extensionsAssigned: '<',
    extensionLengthSavedFn: '&',
    decreaseExtensionLengthFn: '&',
    onChangeFn: '&',
  };
}
