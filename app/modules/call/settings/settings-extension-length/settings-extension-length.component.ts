import { HuronSettingsService, HuronSettingsData, CallSettingsData, CallSettingsService } from 'modules/call/settings/shared';
import { IToolkitModalService } from 'modules/core/modal';

const MIN_EXT_LENGTH: number = 3;
const MAX_EXT_LENGTH: number = 10;

class ExtensionLengthCtrl implements ng.IComponentController {
  public firstTimeSetup: boolean;
  public extensionLength: number;
  public settingsData: HuronSettingsData | CallSettingsData;
  public extensionDecreaseAllowed: boolean;
  public extensionLengthSavedFn: Function;
  public decreaseExtensionLengthFn: Function;
  public onChangeFn: Function;
  public extensionLengthOptions: number[] = [];
  public showHelpText: boolean = false;
  public isDisabled: boolean = false;
  public helpText: string;
  public routingPrefixLength: string;

  private originalExtLength: number;
  private supportsI1484: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HuronSettingsService: HuronSettingsService,
    private CallSettingsService: CallSettingsService,
    private $modal: IToolkitModalService,
    private ModalService,
    private FeatureToggleService,
  ) { }

  public $onInit(): void {
    this.extensionLengthOptions = this.buildExtensionLengthOptions();
    this.routingPrefixLength = _.get(this.settingsData, 'customerVoice.routingPrefixLength');
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(supports => {
        this.supportsI1484 = supports;
        this.buildHelpText();
      });
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { extensionLength } = changes;

    if (extensionLength && extensionLength.currentValue) {
      this.originalExtLength = extensionLength.currentValue;
    }
  }

  public onExtensionLengthChanged(): void {
    if (!this.firstTimeSetup) {
      if (_.toSafeInteger(this.extensionLength) > _.toSafeInteger(this.originalExtLength)) {
        if (this.hasPendingChanges()) {
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

  private hasPendingChanges(): boolean {
    if (this.supportsI1484) {
      return !this.CallSettingsService.matchesOriginalConfig(this.settingsData as CallSettingsData);
    } else {
      return !this.HuronSettingsService.matchesOriginalConfig(this.settingsData as HuronSettingsData);
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

  private buildExtensionLengthOptions(): number[] {
    const options: number[] = [];
    const minExtLength = !this.extensionDecreaseAllowed ? _.toSafeInteger(this.extensionLength) : MIN_EXT_LENGTH;
    for (let index = minExtLength; index <= MAX_EXT_LENGTH; index++) {
      options.push(_.toSafeInteger(index));
    }
    return options;
  }

  private buildHelpText(): void {
    if (!this.extensionDecreaseAllowed) {
      if (this.originalExtLength === MAX_EXT_LENGTH) {
        this.showHelpText = true;
        this.isDisabled = true;
        this.helpText = this.supportsI1484 ? this.$translate.instant('serviceSetupModal.extensionLengthServicesHelpTextForLocation') :
          this.$translate.instant('serviceSetupModal.extensionLengthServicesHelpText');
      } else if (this.originalExtLength === MIN_EXT_LENGTH) {
        this.showHelpText = false;
      } else {
        this.showHelpText = true;
        if (_.toSafeInteger(this.extensionLength) === MIN_EXT_LENGTH + 1) {
          this.helpText = this.supportsI1484 ? this.$translate.instant('serviceSetupModal.extensionLengthSingleOptionHelpTextForLocation', { minExtLength: MIN_EXT_LENGTH }) :
            this.$translate.instant('serviceSetupModal.extensionLengthSingleOptionHelpText', { minExtLength: MIN_EXT_LENGTH });
        } else {
          this.helpText = this.supportsI1484 ? this.$translate.instant('serviceSetupModal.extensionLengthRangeOptionHelpTextForLocation', {
            minExtLength: MIN_EXT_LENGTH,
            extLengthMinusOne: (_.toSafeInteger(this.extensionLength) - 1),
          }) :
          this.$translate.instant('serviceSetupModal.extensionLengthRangeOptionHelpText', {
            minExtLength: MIN_EXT_LENGTH,
            extLengthMinusOne: (_.toSafeInteger(this.extensionLength) - 1),
          });
        }
      }
    } else {
      this.showHelpText = false;
      this.isDisabled = false;
    }
  }

  private openExtensionPrefixModal(): ng.IPromise<any> {
    return this.$modal.open({
      type: 'small',
      template: `<uc-extension-prefix-modal class="ucExtensionPrefixModal" new-extension-length="${this.extensionLength}" old-extension-length="${this.originalExtLength}" routing-prefix-length="${this.routingPrefixLength}" dismiss="$dismiss()" close="$close()"></uc-extension-prefix-modal>`,
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
  public template = require('modules/call/settings/settings-extension-length/settings-extension-length.component.html');
  public bindings = {
    firstTimeSetup: '<',
    extensionLength: '<',
    settingsData: '<',
    extensionDecreaseAllowed: '<',
    extensionLengthSavedFn: '&',
    decreaseExtensionLengthFn: '&',
    onChangeFn: '&',
  };
}
