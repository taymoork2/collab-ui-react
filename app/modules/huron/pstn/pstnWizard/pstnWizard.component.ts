import { Notification } from 'modules/core/notifications/notification.service';
import { PstnWizardService } from './pstnWizard.service';
import { DirectInwardDialing } from './directInwardDialing';
import { TokenMethods } from '../pstnSwivelNumbers';
import { TOKEN_FIELD_ID } from '../pstn.const';
import { PstnService } from '../pstn.service';
import { PstnModel, IOrder } from '../pstn.model';
import { NumberModel, INumbersModel } from '../pstnNumberSearch';
import { PstnAddressService, Address } from '../shared/pstn-address';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

export class PstnWizardComponent implements ng.IComponentOptions {
  public controller = PstnWizardCtrl;
  public template = require('modules/huron/pstn/pstnWizard/pstnWizard.html');
  public bindings = {
    dismiss: '&',
    close: '&',
    refreshFn: '&',
    customerId: '<',
    customerName: '<',
    customerEmail: '<',
    customerCommunicationLicenseIsTrial: '<',
    customerRoomSystemsLicenseIsTrial: '<',
  };
}

export class PstnWizardCtrl implements ng.IComponentController {
  public tollFreeTitle: string;
  public emergencyAcknowledge: boolean = false;
  public swivelNumbers: string[] = [];
  public showCarriers: boolean;
  public placeOrderLoad: boolean;
  public totalPortNumbers: number;
  public totalNewAdvancedOrder: number;
  public newOrders: IOrder[];
  public advancedOrders: IOrder[];
  public swivelOrders: IOrder[];
  public newTollFreeOrders: IOrder[];
  public portOrders: IOrder[];
  public PORTING_NUMBERS: string;
  public invalidCount: number = 0;
  public invalidSwivelCount: number = 0;
  public validCount: number = 0;
  public step: number = 1;
  public showButtons: boolean = false;
  public contact: {firstName, lastName, emailAddress, companyName};
  public address: Address;
  public countryCode: string;
  public loading: boolean;
  public isTrial: boolean;
  public orderCart: IOrder[] = [];
  public model: INumbersModel = {
    pstn: new NumberModel(),
    tollFree: new NumberModel(),
  };
  public showContractIncomplete = false;
  public tokenfieldId: string = TOKEN_FIELD_ID;
  public showPortNumbers: boolean = false;
  public showTollFreeNumbers: boolean = false;
  public enableCarriers: boolean;
  public blockByopNumberAddForPartnerAdmin: boolean;
  public close: Function;
  public refreshFn: Function;
  public get provider() {
    return this.PstnModel.getProvider();
  }
  public tokenmethods: TokenMethods;
  public titles: {};
  public dismiss: Function;
  public prevStep: number = 1;
  public loggedInPartnerPortal: boolean = false;
  private did: DirectInwardDialing = new DirectInwardDialing();
  private ftI387PrivateTrunking: boolean;
  private ftLocation: boolean;
  public ftHI1635: boolean = false;

  /* @ngInject */
  constructor(private PstnModel: PstnModel,
              private PstnServiceAddressService,              //Site Based
              private PstnAddressService: PstnAddressService, //Location Based
              private Notification: Notification,
              private $state: ng.ui.IStateService,
              private $stateParams: ng.ui.IStateParamsService,
              private $window: ng.IWindowService,
              private $timeout: ng.ITimeoutService,
              private PstnService: PstnService,
              private $translate: ng.translate.ITranslateService,
              private PstnWizardService: PstnWizardService,
              private PhoneNumberService: PhoneNumberService,
              private FeatureToggleService,
              ) {
    this.contact = this.PstnWizardService.getContact();
    this.address = _.cloneDeep(PstnModel.getServiceAddress());
    this.countryCode = PstnModel.getCountryCode();
    this.isTrial = PstnModel.getIsTrial();
    this.showPortNumbers = !this.isTrial;
    this.PORTING_NUMBERS = this.$translate.instant('pstnSetup.portNumbersLabel');
    this.tokenmethods = new TokenMethods(this.createToken.bind(this), this.createdToken.bind(this), this.editToken.bind(this), this.removeToken.bind(this));
    this.titles = this.PstnWizardService.STEP_TITLE;

    if ($state['modal'] && $state['modal'].result) {
      $state['modal'].result.finally(PstnModel.clear);
    }
    this.showContractIncomplete = _.get<boolean>(this.$stateParams, 'showContractIncomplete');
  }

  public $onInit(): void {
    this.PstnWizardService.init().then(() => this.enableCarriers = true);
    this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking).then((enabled) => {
      this.ftI387PrivateTrunking = enabled;
    });
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484).then((enabled) => {
      this.ftHI1635 = enabled;
    });
    this.FeatureToggleService.getCallFeatureForCustomer(this.PstnModel.getCustomerId(), this.FeatureToggleService.features.hI1484).then((enabled) => {
      this.ftLocation = enabled;
    });
  }

  public getCapabilities(): void {
    if (!this.isTrial) {
      this.PstnWizardService.hasTollFreeCapability().then(result => {
        if (result) {
          this.showTollFreeNumbers = result;
          this.getTollFreeInventory();
        }
      })
      .catch(response => this.Notification.errorResponse(response, 'pstnSetup.errors.capabilities'));
    }
  }

  public getTollFreeInventory(): void {
    this.PstnService.getCarrierTollFreeInventory(this.PstnModel.getProviderId())
      .then(response => {
        this.model.tollFree.areaCodeOptions = response.areaCodes;
        const areaCodes = response.areaCodes
        .map(area => area.code)
        .join(', ') + '.';
        this.tollFreeTitle = this.$translate.instant('pstnSetup.tollFreeTitle', { areaCodes: areaCodes });
        this.model.tollFree.areaCode = null;
      })
      .catch(response => this.Notification.errorResponse(response, 'pstnSetup.errors.tollfree.areacodes'));
  }

  public createToken(e): void {
    const tokenNumber = e.attrs.label;
    e.attrs.value = this.PhoneNumberService.getE164Format(tokenNumber);
    e.attrs.label = this.PhoneNumberService.getNationalFormat(tokenNumber);
  }

  public createdToken(e): void {
    if (this.isTokenInvalid(e.attrs.value)) {
      angular.element(e.relatedTarget).addClass('invalid');
      e.attrs.invalid = true;
    } else {
      this.validCount++;
    }
    // add to service after validation/duplicate checks
    this.did.add(e.attrs.value);

    this.invalidCount = this.getInvalidTokens().length;
  }

  public isTokenInvalid(value): boolean {
    return !this.PhoneNumberService.validateDID(value) ||
      _.includes(this.did.getList(), value);
  }

  public removeToken(e): void {
    this.did.remove(e.attrs.value);
    this.$timeout(this.initTokens);
  }

  public editToken(e): void {
    this.did.remove(e.attrs.value);
    if (!angular.element(e.relatedTarget).hasClass('invalid')) {
      this.validCount--;
    }
  }

  public goToOrderNumbers(): void {
    if (!this.PstnModel.isCustomerExists()) {
      this.step = 2;
    } else if (!this.address.validated) {
      this.step = 3;
    } else {
      this.step = 4;
    }
  }

  public goToSwivelNumbers(): void {
    this.loggedInPartnerPortal = this.PstnWizardService.isPartnerPortal();
    if (this.ftI387PrivateTrunking) {
      this.blockByopNumberAddForPartnerAdmin = this.PstnWizardService.blockByopNumberAddForPartnerAdmin();
      if (this.blockByopNumberAddForPartnerAdmin || this.PstnModel.isEsaSigned()) {
        this.step = 9;
      } else {
        this.step = 8;
      }
    } else {
      this.step = 5;
    }
  }

  public isSwivel(): boolean {
    return this.PstnWizardService.isSwivel();
  }

  public goToNumbers(): void {
    if (this.isSwivel()) {
      this.goToSwivelNumbers();
    } else {
      this.goToOrderNumbers();
    }
    this.showButtons = true;
  }

  //Method is called from the uc-pstn-providers component
  public onProviderReady(): void {
    if (!this.PstnModel.isCustomerExists()) {
      //no need to initialize anything else because the Terminus customer hasn't been created.
      this.showCarriers = true;
      return;
    }
    if (this.ftLocation) {
      this.PstnWizardService.initLocations()
      .then(() => {
        this.address = _.cloneDeep(this.PstnModel.getServiceAddress());
        //If new PSTN setup show all the carriers even if there only one
        if (this.PstnModel.isCarrierExists()) {
          // Only 1 carrier should exist for a customer
          if (this.PstnModel.getCarriers().length === 1) {
            this.PstnModel.setSingleCarrierReseller(true);
            this.PstnModel.setProvider(this.PstnModel.getCarriers()[0]);
            this.goToNumbers();
            this.getCapabilities();
          }
        }
        this.showCarriers = true;
      });
    } else {
      this.PstnWizardService.initSites()
      .then(() => {
        this.address = _.cloneDeep(this.PstnModel.getServiceAddress());
        //If new PSTN setup show all the carriers even if there only one
        if (this.PstnModel.isCarrierExists()) {
          // Only 1 carrier should exist for a customer
          if (this.PstnModel.getCarriers().length === 1) {
            this.PstnModel.setSingleCarrierReseller(true);
            this.PstnModel.setProvider(this.PstnModel.getCarriers()[0]);
            this.goToNumbers();
            this.getCapabilities();
          }
        }
        this.showCarriers = true;
      });
    }
  }

  public onProviderChange(): void {
    this.goToNumbers();
  }

  public previousStep(): void {
    // pre check
    if (!this.ftI387PrivateTrunking && this.isSwivel() && this.step === 5) {
      this.step = 1;
    } else if (this.ftI387PrivateTrunking && this.isSwivel() && this.step === 8) {
      this.step = 1;
      this.PstnModel.setEsaDisclaimerAgreed(false);
    } else if (this.ftI387PrivateTrunking && this.isSwivel() && this.step === 9) {
      this.PstnModel.setEsaDisclaimerAgreed(false);
      if (this.blockByopNumberAddForPartnerAdmin) {
        this.step = 1;
      }
    } else if (this.ftI387PrivateTrunking && this.isSwivel() && this.step === 10) {
      if (this.blockByopNumberAddForPartnerAdmin) {
        this.step = 9;
      } else {
        this.step = this.prevStep === 8 ? 8 : 9;
      }
      return;
    } else if (!this.isSwivel() && this.step === 6) {
      this.step -= 1;
    }

    if (this.step > 1) {
      this.step -= 1;
    }
    //post check
    if (this.step === 1) {
      this.showButtons = false;
    }
  }

  public nextStep(): void {
    switch (this.step) {
      case 2:
        this.PstnWizardService.setContact(this.contact);
        break;
      case 4:
        if (this.getOrderNumbersTotal() === 0) {
          this.Notification.error('pstnSetup.orderNumbersPrompt');
          return;
        } else {
          this.PstnModel.setOrders(this.orderCart);
          this.step += 1;
          const orders = this.PstnWizardService.initOrders();
          this.totalPortNumbers = orders.totalPortNumbers;
          this.totalNewAdvancedOrder = orders.totalNewAdvancedOrder;
        }
        break;
      case 5:
        if (this.invalidSwivelCount) {
          this.Notification.error('pstnSetup.invalidNumberPrompt');
          return;
        } else if (this.swivelNumbers.length === 0) {
          this.Notification.error('pstnSetup.orderNumbersPrompt');
          return;
        } else {
          //set numbers for if they go back
          this.PstnModel.setNumbers(this.swivelNumbers);
          const swivelOrder = this.PstnWizardService.setSwivelOrder(this.swivelNumbers);
          this.PstnModel.setOrders(swivelOrder);
        }
        break;
      case 6:
        this.placeOrderLoad = true;
        this.PstnWizardService.placeOrder().then(() => {
          this.refreshFn();
          this.step = 7;
          this.placeOrderLoad = false;
        });
        return;
      case 7:
        this.dismissModal();
        return;
      case 8:
        this.PstnModel.setEsaDisclaimerAgreed(true);
        break;
      case 9:
        if (this.invalidSwivelCount) {
          this.Notification.error('pstnSetup.invalidNumberPrompt');
          return;
        } else {
            //set numbers for if they go back
          this.PstnModel.setNumbers(this.swivelNumbers);
          const swivelOrder = this.PstnWizardService.setSwivelOrder(this.swivelNumbers);
          this.PstnModel.setOrders(swivelOrder);
        }
        break;
      case 10:
        this.placeOrderLoad = true;
        this.PstnWizardService.finalizeImport().then(() => {
          this.refreshFn();
          this.step = 11;
        })
        .finally(() => this.placeOrderLoad = false);
        return;
      case 11:
        this.dismissModal();
        return;
    }
    this.step += 1;
  }

  public nextDisabled(): boolean {
    switch (this.step) {
      case 2:
        return this[`wizardForm${this.step}`].$invalid;
      case 3:
        return this.address.validated === false;
      case 5:
        return !this.emergencyAcknowledge;
      case 9:
        return this.blockByopNumberAddForPartnerAdmin || this.swivelNumbers.length === 0;
    }
    return false;
  }

  public hideBackBtn(): boolean {
    switch (this.step) {
      case 2:
        return this.PstnModel.getCarriers().length === 1;
      case 4:
      case 5:
        return this.PstnModel.isCustomerExists();
      case 7:
        return true;
      case 8:
        return this.PstnModel.isCustomerExists();
      case 9:
        return this.PstnModel.isEsaSigned() || (this.PstnModel.isCustomerExists() && this.blockByopNumberAddForPartnerAdmin);
      case 11:
        return true;
    }
    return false;
  }

  public validateAddress(): void {
    this.loading = true;

    if (this.ftLocation) {
      this.PstnAddressService.lookup(this.PstnModel.getProviderId(), this.address)
      .then((address: Address | null) => {
        if (address) {
          this.address = address;
          this.PstnModel.setServiceAddress(_.cloneDeep(address));
        } else {
          this.Notification.error('pstnSetup.serviceAddressNotFound');
        }
      })
      .catch(error => this.Notification.errorResponse(error))
      .finally(() => this.loading = false);
    } else {
      this.PstnServiceAddressService.lookupAddressV2(this.address, this.PstnModel.getProviderId())
      .then(address => {
        if (address) {
          this.address = address;
          this.PstnModel.setServiceAddress(address);
          this.address.validated = true;
        } else {
          this.Notification.error('pstnSetup.serviceAddressNotFound');
        }
      })
      .catch(response => this.Notification.errorResponse(response))
      .finally(() => this.loading = false);
    }
  }

  public resetAddress(): void {
    if (this.ftLocation) {
      this.address.reset();
    } else {
      this.address.uuid = undefined;
      this.address.streetAddress = null;
      this.address.unit = undefined;
      this.address.city = null;
      this.address.state = null;
      this.address.zip = null;
      this.address.country = null;
      this.address.default = false;
      this.address.validated = false;
    }
    this.PstnModel.setServiceAddress(_.cloneDeep(this.address));
  }

  public launchCustomerPortal(): void {
    this.$window.open(this.$state.href('login', {
      customerOrgId: this.PstnModel.getCustomerId(),
    }));
  }

  public searchCarrierInventory(areaCode: string, block: boolean, quantity: number, consecutive: boolean, stateAbbreviation: string): void {
    this.loading = true;
    this.PstnWizardService.searchCarrierInventory(areaCode, block, quantity, consecutive, stateAbbreviation, this.model, this.isTrial).then(() => this.loading = false);
  }

  public searchCarrierTollFreeInventory(areaCode: string, block: boolean, quantity: number, consecutive: boolean): void {
    this.loading = true;
    this.PstnWizardService.searchCarrierTollFreeInventory(areaCode, block, quantity, consecutive, this.model).then(() => this.loading = false);
  }

  public addToCart(orderType: string, numberType: string, quantity: number, searchResultsModel: boolean[]): void {
    this.model.pstn.addLoading = true;
    this.model.tollFree.addLoading = true;
    this.PstnWizardService.addToCart(orderType, numberType, quantity, searchResultsModel, this.orderCart, this.model).then(orderCart => {
      this.orderCart = orderCart;
      this.model.pstn.addLoading = false;
      this.model.tollFree.addLoading = false;
      this.model.pstn.addDisabled = true;
      this.model.tollFree.addDisabled = true;
      this.initTokens([]);
    });
  }

  public initTokens(didList): void {
    const tmpDids = didList || this.did.getList();
    // reset valid and list before setTokens
    this.validCount = 0;
    this.invalidCount = 0;
    this.did.clearList();
    (angular.element('#' + this.tokenfieldId) as any).tokenfield('setTokens', tmpDids);
  }

  public getInvalidTokens(): JQuery {
    return angular.element('#' + this.tokenfieldId).parent().find('.token.invalid');
  }

  public formatTelephoneNumber(telephoneNumber: IOrder): string | undefined {
    return this.PstnWizardService.formatTelephoneNumber(telephoneNumber);
  }

  public removeOrderFromCart(order: IOrder): void {
    _.pull(this.orderCart, order);
  }

  public removeOrder(order: IOrder): void {
    this.PstnWizardService.removeOrder(order)
        .then(_.partial(this.removeOrderFromCart.bind(this), order));
  }

  public showOrderQuantity(order: IOrder): boolean {
    return this.PstnWizardService.showOrderQuantity(order);
  }

  public getOrderQuantity(order: IOrder): number | undefined {
    return this.PstnWizardService.getOrderQuantity(order);
  }

  public getOrderNumbersTotal(): number {
    return _.size(_.flatten(this.orderCart));
  }

  public onSwivelChange(numbers: string[], invalidCount: number): void {
    this.swivelNumbers = numbers;
    this.invalidSwivelCount = invalidCount;
  }

  public onAcknowledge(value: boolean): void {
    this.emergencyAcknowledge = value;
  }

  public dismissModal() {
    this.PstnModel.clear(this.ftLocation);
    this.dismiss();
  }

  public showSkipBtn(): boolean {
    switch (this.step) {
      case 8:
        this.prevStep = this.step;
        return true;
      case 9:
        this.prevStep = this.step;
        return !this.PstnModel.isEsaSigned() || this.blockByopNumberAddForPartnerAdmin;
    }
    return false;
  }

  public onSkip(): void {
    switch (this.step) {
      case 8:
        if (this.PstnModel.isCustomerExists()) {
          this.dismissModal();
        }  else {
          this.finalizeCustomerAndEsA();
        }
        break;
      case 9:
        if (this.PstnWizardService.isLoggedInAsPartner()) {
          if (this.PstnModel.isCustomerExists()) {
            this.dismissModal();
          } else {
            this.step = 10;
          }
        } else if (this.PstnWizardService.blockByopNumberAddForAllAdmin) {
          this.finalizeCustomerAndEsA();
        }
        break;
      default:
        this.dismissModal();
    }
  }

  public finalizeCustomerAndEsA(): void {
    this.PstnModel.clearSwivelNumbers();
    this.onSwivelChange([], 0);
    this.PstnWizardService.setSwivelOrder([]);
    this.step = 10;
  }

}
