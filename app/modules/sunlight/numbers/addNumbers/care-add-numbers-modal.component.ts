import { TokenMethods } from './tokenMethods';
import { Notification } from 'modules/core/notifications';
import { HuronSettingsService, HuronSettingsOptionsService, HuronSettingsOptions, HuronSettingsData } from 'modules/call/settings/shared';
import { PstnWizardService } from 'modules/huron/pstn';
import { InternalNumberRange } from 'modules/call/shared/internal-number-range';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { PstnProvidersService } from 'modules/huron/pstn/pstnProviders/pstnProviders.service';

class CareAddNumbersModalCtrl implements ng.IComponentController {

  public dismiss: Function;
  public extensionLength: number;              // Dismiss callback for modal dialog
  public internalNumberRanges: any[] = [ { beginNumber: '500', endNumber: '599' } ];
  public acknowledge: boolean = false;

  /** token properties */
  public numbers: any[] = [];
  public tokenfieldid: string = 'careAddNumbersID';
  public tokenplaceholder: string;
  public tokenoptions: Object = {
    delimiter: [',', ';'],
    createTokensOnBlur: true,
    tokens: [],
    minLength: 2,
    beautify: false,
  };
  public tokenmethods: TokenMethods;
  public invalidCount: number = 0;

  public loading: boolean;

  public settingsOptions: HuronSettingsOptions = new HuronSettingsOptions();
  public siteId: string;
  public huronSettingsData: HuronSettingsData;
  public firstTimeSetup: boolean;
  public form: ng.IFormController;

  public showDialPlanChangedDialog: boolean = false;
  public processing: boolean = false;
    /* @ngInject*/
  constructor(private $timeout: ng.ITimeoutService,
              private Notification: Notification,
              public $translate,
              public PhoneNumberService,
              public Orgservice,
              public $q,
              private HuronSettingsOptionsService: HuronSettingsOptionsService,
              private HuronSettingsService: HuronSettingsService,
              private ModalService,
              private PstnModel,
              private PstnWizardService: PstnWizardService,
              private Authinfo: Authinfo,
              private PstnProvidersService: PstnProvidersService) {
    this.extensionLength = 3;
    this.tokenplaceholder = this.$translate.instant('didManageModal.inputPlacehoder');
    this.tokenmethods = new TokenMethods(
      this.createToken.bind(this),
      this.createdToken.bind(this),
      this.editToken.bind(this),
      this.removeToken.bind(this),
    );
  }

  public $onInit(): void {
    this.loading = true;
    // Setting customer details
    this.PstnModel.setCustomerId(this.Authinfo.getOrgId());
    this.PstnModel.setCustomerExists(false);
    this.PstnModel.setCustomerName(this.Authinfo.getOrgName());
    this.PstnModel.setCustomerEmail(this.Authinfo.getCustomerAdminEmail());
    this.PstnModel.setIsTrial(this.Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc') && this.Authinfo.getLicenseIsTrial('SHARED_DEVICES', false));

    //Reset Carriers
    this.PstnModel.setCarriers([]);

    this.$q.all({
      customerAndReseller: this.PstnWizardService.init()
                           .then(() => this.PstnProvidersService.getCarriers())
                           .then(() => {
                             if (this.PstnModel.isCarrierExists()) {
                               const bypstnCarriers = _.filter(this.PstnModel.getCarriers(), (carrier: any) => {
                                 return carrier.name === 'BYO-PSTN';
                               });
                               if (_.isArray(bypstnCarriers) && bypstnCarriers.length > 0) {
                                 this.PstnModel.setProvider(bypstnCarriers[0]);
                               }
                             }
                           }),
      intiallizeSettings: this.initSettingsComponent(),
    }).finally(() => this.loading = false);
  }

  private initSettingsComponent(): ng.IPromise<any> {
    return this.HuronSettingsOptionsService.getOptions().then(options => this.settingsOptions = options)
      .then(() => {
        return this.HuronSettingsService.get(this.siteId).then(huronSettingsData => {
          this.huronSettingsData = huronSettingsData;
          if (this.huronSettingsData.site) {
            this.firstTimeSetup = true;
          }
        });
      });
  }

  public isPSTNNumber(value: string): boolean {
    let number = _.clone(value);
    if (number.charAt(0) !== '+') {
      number = '+'.concat(number);
    }
    const e164FormattedNumber = this.PhoneNumberService.getE164Format(number);
    return this.PhoneNumberService.internationalNumberValidator(e164FormattedNumber);
  }

  public isAANumber(number: string): boolean {
    return number.length >= 2 && this.isNumeric(number);
  }

  public createToken(e): void {
    // if PSTN number add '+' if it doesn't exist
    // if its not a PSTN number, user is trying to add a AA number
    if (this.isPSTNNumber(e.attrs.value)) {
      // Only add + to e164 nums
      if (e.attrs.value.charAt(0) !== '+') {
        e.attrs.value = '+'.concat(e.attrs.value);
      }

      try {
        e.attrs.value = e.attrs.label = this.PhoneNumberService.getE164Format(e.attrs.value);
      } catch (e) {
        //noop
      }
    }

    const duplicate = _.find(this.getTokens(), {
      value: e.attrs.value,
    });
    if (duplicate) {
      e.attrs.duplicate = true;
    }
  }

  public createdToken(e): void {
    if (e.attrs.duplicate) {
      this.$timeout(() => {
        let tokens = this.getTokens();
        tokens = tokens.splice(_.indexOf(tokens, e.attrs), 1);
        this.Notification.error('careAddNumberTpl.duplicateNumber', {
          number: e.attrs.label,
        });
        this.setTokens(tokens.map(function (token) {
          return token.value;
        }));
      });

    } else if (!this.isPSTNNumber(e.attrs.value) && !this.isAANumber(e.attrs.value)) {
      angular.element(e.relatedTarget).addClass('invalid');
      e.attrs.invalid = true;
      this.invalidCount++;
    } else {
      if (this.numbers.indexOf(e.attrs.value) === -1) {
        this.numbers.push(e.attrs.value);
      }
      this.setPlaceholderText('');
    }
  }

  public editToken(e): void {
    this.removeNumber(e.attrs.value);
    // If invalid token, show the label text in the edit input
    if (!this.isPSTNNumber(e.attrs.value) && !this.isAANumber(e.attrs.value)) {
      e.attrs.value = e.attrs.label;
      this.invalidCount--;
    }
  }

  private removeToken(e): void {
    this.removeNumber(e.attrs.value);
    if (angular.element(e.relatedTarget).hasClass('invalid')) {
      this.invalidCount--;
    }
    if (this.numbers.length === 0) {
      this.resetForm();
    }
  }

  private setPlaceholderText(text): void {
    $('#' + this.tokenfieldid).attr('placeholder', text);
  }

  private getTokens(): {value, label}[] {
    return (angular.element('#' + this.tokenfieldid) as any).tokenfield('getTokens');
  }

  private setTokens(tokens): void {
    (angular.element('#' + this.tokenfieldid) as any).tokenfield('setTokens', tokens);
  }

  private isNumeric(num): boolean {
    return !isNaN(num);
  }

  private removeNumber(value): void {
    const index = _.indexOf(this.numbers, value);
    if (index > -1) {
      this.numbers.splice(index, 1);
    }
  }

  public onExtensionLengthChanged(extensionLength: number): void {
    this.huronSettingsData.site.extensionLength = extensionLength;
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onDecreaseExtensionLength(extensionLength: number): void {
    this.huronSettingsData.internalNumberRanges = [];
    this.huronSettingsData.site.extensionLength = extensionLength;
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onExtensionLengthSaved(): void {
    this.$onInit();
  }

  private setShowDialPlanChangedDialogFlag(): void {
    const originalConfig = this.HuronSettingsService.getOriginalConfig();
    if (this.huronSettingsData.site.extensionLength !== originalConfig.site.extensionLength
      || this.huronSettingsData.site.steeringDigit !== originalConfig.site.steeringDigit
      || this.huronSettingsData.site.routingPrefix !== originalConfig.site.routingPrefix
      || this.huronSettingsData.site.regionCodeDialing !== originalConfig.site.regionCodeDialing) {
      this.showDialPlanChangedDialog = true;
    } else {
      this.showDialPlanChangedDialog = false;
    }
  }

  public onExtensionRangeChanged(extensionRanges: InternalNumberRange[]): void {
    this.huronSettingsData.internalNumberRanges = extensionRanges;
    this.checkForChanges();
  }

  public showSaveDialogs(): void {
    if (this.showDialPlanChangedDialog) {
      this.openDialPlanChangeDialog()
        .then(() => this.saveHuronSettings());
    } else {
      this.saveHuronSettings();
    }
  }

  public openDialPlanChangeDialog() {
    return this.ModalService.open({
      title: this.$translate.instant('serviceSetupModal.saveModal.title'),
      message: this.$translate.instant('serviceSetupModal.saveModal.message1') + '<br/><br/>'
      + this.$translate.instant('serviceSetupModal.saveModal.message2'),
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
    }).result;
  }

  public saveHuronSettings(): ng.IPromise<void> {
    this.processing = true;
    this.PstnModel.setNumbers(this.numbers);
    const swivelOrder = this.PstnWizardService.setSwivelOrder(this.numbers);
    this.PstnModel.setOrders(swivelOrder);
    this.PstnModel.setEsaDisclaimerAgreed(true);

    return this.$q.all({
      importNumbers: this.PstnWizardService.finalizeImport(),
      saveHuronSettings: this.HuronSettingsService.save(this.huronSettingsData),
    })
      .then(huronSettingsData => {
        this.huronSettingsData = huronSettingsData;
        this.Notification.success('serviceSetupModal.saveSuccess');
        this.dismiss();
      }).finally(() => {
        this.processing = false;
        this.resetForm();
      });
  }

  public checkForChanges(): void {
    if (this.HuronSettingsService.matchesOriginalConfig(this.huronSettingsData) && this.numbers.length === 0) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.showDialPlanChangedDialog = false;
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
    }
  }

}

export class CareAddNumbersModalComponent implements ng.IComponentOptions {
  public controller = CareAddNumbersModalCtrl;
  public template = require('modules/sunlight/numbers/addNumbers/care-add-numbers-modal.component.html');
  public bindings = {
    dismiss: '&',
  };
}
