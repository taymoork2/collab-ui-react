import {
  NUMBER_ORDER, PORT_ORDER, BLOCK_ORDER, NXX, NUMTYPE_DID, NUMTYPE_TOLLFREE,
  NXX_EMPTY, MIN_VALID_CODE, MAX_VALID_CODE, MAX_DID_QUANTITY,
  TOLLFREE_ORDERING_CAPABILITY, TOKEN_FIELD_ID, SWIVEL_ORDER, SWIVEL,
} from '../pstn.const';
import {
  PstnModel, IOrder, IOrderData, IAuthCustomer, IAuthLicense,
} from '../pstn.model';
import { INumbersModel } from '../pstnNumberSearch/number.model';
import { PstnService, TerminusLocation } from '../pstn.service';
import { PstnAddressService, Address } from '../shared/pstn-address';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { Notification } from 'modules/core/notifications';
import { LocationsService, Location } from 'modules/call/locations';

export class PstnWizardService {
  public STEP_TITLE: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
  };
  private tokenfieldId = TOKEN_FIELD_ID;
  private PORTING_NUMBERS: string;
  private advancedOrders: IOrder[] = [];
  private swivelOrders: IOrder[] = [];
  private portOrders: IOrder[] = [];
  private newTollFreeOrders: IOrder[] = [];
  private newOrders: IOrder[] = [];
  private orderCart: IOrder[] = [];
  private location: TerminusLocation = new TerminusLocation();
  private ftEnterprisePrivateTrunking: boolean = false;
  private ftLocation: boolean = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private PstnModel: PstnModel,
    private PstnService: PstnService,
    private PstnServiceAddressService,              //Site based
    private PstnAddressService: PstnAddressService, //Location based
    private LocationsService: LocationsService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private Orgservice,
    private FeatureToggleService,
    private Authinfo,
  ) {
    this.PORTING_NUMBERS = this.$translate.instant('pstnSetup.portNumbersLabel');
    this.STEP_TITLE = {
      1: $translate.instant('pstnSetup.setupService'),
      2: $translate.instant('pstnSetup.setupPstn'),
      3: $translate.instant('pstnSetup.setupPstn'),
      4: $translate.instant('pstnSetup.setupNumbers'),
      5: $translate.instant('pstnSetup.setupNumbers'),
      6: $translate.instant('pstnSetup.orderSummary'),
      7: $translate.instant('pstnSetup.setupService'),
      8: $translate.instant('pstnSetup.setupService'),
      9: $translate.instant('pstnSetup.setupService'),
      10: $translate.instant('pstnSetup.setupService'),
      11: $translate.instant('pstnSetup.setupPstn'),
    };
  }

  public init(): ng.IPromise<any> {
    const deferred = this.$q.defer();

    //Get and save organization/customer information
    const params = {
      basicInfo: true,
    };
    this.checkReseller();
    this.Orgservice.getOrg(data => {
      if (data.countryCode) {
        this.PstnModel.setCountryCode(data.countryCode);
      }
      this.PstnService.getCustomerV2(this.PstnModel.getCustomerId())
      .then((response) => {
        this.PstnModel.setCustomerExists(true);
        if (response.e911Signee) {
          this.PstnModel.setEsaSigned(true);
        }
        deferred.resolve(true);
      }, () => {
        this.PstnModel.setCustomerExists(false);
        deferred.resolve(true);
      });
    }, this.PstnModel.getCustomerId(), params);
    return deferred.promise;
  }

  public getContact() {
    return {
      companyName : this.PstnModel.getCustomerName(),
      firstName : this.PstnModel.getCustomerFirstName(),
      lastName : this.PstnModel.getCustomerLastName(),
      emailAddress : this.PstnModel.getCustomerEmail(),
    };
  }

  public setContact(contact) {
    this.PstnModel.setCustomerName(contact.companyName);
    this.PstnModel.setCustomerFirstName(contact.firstName);
    this.PstnModel.setCustomerLastName(contact.lastName);
    this.PstnModel.setCustomerEmail(contact.emailAddress);
  }

  public isSwivel(): boolean {
    return this.provider.apiImplementation === SWIVEL;
  }

  //PSTN check to verify if the Partner is registered with the Terminus service as a carrier reseller
  private checkReseller(): void {
    if (!this.PstnModel.isResellerExists()) {
      this.PstnService.getResellerV2().then(() => this.PstnModel.setResellerExists(true))
      .catch(() => this.createReseller());
    }
  }

  //PSTN register the Partner as a carrier reseller
  private createReseller(): void {
    this.PstnService.createResellerV2().then(() => this.PstnModel.setResellerExists(true))
    .catch(error => this.Notification.errorResponse(error, 'pstnSetup.resellerCreateError'));
  }

  private get provider(): any {
    return this.PstnModel.getProvider();
  }

  public initLocations(): ng.IPromise<Location | undefined> {
    //On success the default location is saved in the LocationsService
    //and will be updated if the default changes.
    return this.LocationsService.getDefaultLocation(this.PstnModel.getCustomerId())
    .then((location: Location) => {
      const locaionId: string = _.isString(location.uuid) ? location.uuid : '';
      //Save the default ESA
      return this.PstnAddressService.getByLocation(this.PstnModel.getCustomerId(), locaionId)
      .then((addresses: Address[]) => {
        this.PstnModel.setServiceAddress(addresses[0]);
        return location;
      });
    })
    .catch(error => {
      this.Notification.errorResponse(error, 'settingsServiceAddress.getError');
      return undefined;
    });
  }

  public createLocation(): ng.IPromise<string | void> {
    return this.PstnService.createLocation(this.location)
    .catch(error => {
      this.Notification.errorResponse(error, 'locations.createFailed');
    });
  }

  public initSites(): ng.IPromise<any> {
    return this.PstnServiceAddressService.listCustomerSites(this.PstnModel.getCustomerId())
      .then(sites => {
        //Currently only one site per customer -- removing sites for locations
        //If we have sites, set the flag and store the first site address
        if (_.isArray(sites) && _.size(sites)) {
          this.PstnModel.setSiteExists(true);
          const serviceAddress = _.get(sites[0], 'serviceAddress');
          const address = new Address();
          address.streetAddress = _.get<string>(serviceAddress, 'serviceStreetNumber') + ' ' + _.get<string>(serviceAddress, 'serviceStreetName');
          address.city = _.get<string>(serviceAddress, 'serviceCity');
          address.state = _.get<string>(serviceAddress, 'serviceState');
          address.zip = _.get<string>(serviceAddress, 'serviceZip');
          address.default = true;
          address.validated = true;
          this.PstnModel.setServiceAddress(address);
        }
      })
      .catch(response => {
        //TODO temp remove 500 status after terminus if fixed
        if (response && response.status !== 404 && response.status !== 500) {
          this.Notification.errorResponse(response, 'pstnSetup.listSiteError');
        }
      });
  }

  private createSite(): ng.IPromise<any> {
      // Only create site for API providers
    if (this.provider.apiImplementation !== 'SWIVEL' && !this.PstnModel.isSiteExists()) {
      return this.PstnServiceAddressService.createCustomerSite(this.PstnModel.getCustomerId(), this.PstnModel.getCustomerName(), this.PstnModel.getServiceAddress())
        .then(() => {
          this.PstnModel.setSiteExists(true);
          return true;
        })
        .catch(response => {
          this.Notification.errorResponse(response, 'pstnSetup.siteCreateError');
          return this.$q.reject(response);
        });
    } else {
      return this.$q.resolve(true);
    }
  }

  private logESAAcceptance(): ng.IPromise<any> {
    if (!this.PstnModel.isEsaSigned() && this.PstnModel.isEsaDisclaimerAgreed()) {
      return this.PstnService.updateCustomerE911Signee(this.PstnModel.getCustomerId())
        .catch(response => {
          this.Notification.errorResponse(response, 'pstnSetup.esaSignatureFailed');
          return this.$q.reject(response);
        });
    } else {
      return this.$q.resolve(true);
    }
  }

  private getEnterprisePrivateTrunkingFeatureToggle(): ng.IPromise<boolean> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking)
      .then((enabled) => this.ftEnterprisePrivateTrunking = enabled);
  }

  private getLocationFeatureToggle(): ng.IPromise<boolean> {
    return this.FeatureToggleService.getCallFeatureForCustomer(this.PstnModel.getCustomerId(), this.FeatureToggleService.features.hI1484)
    .then((enabled) => this.ftLocation = enabled);
  }

  private createNumbers(): ng.IPromise<any> {
    const promises: ng.IPromise<any>[] = [];
    const errors: any = [];
    let promise;

    const pushErrorArray = response => errors.push(this.Notification.processErrorResponse(response));

    if (this.newOrders.length > 0) {
      promise = this.PstnService.orderNumbersV2(this.PstnModel.getCustomerId(), this.newOrders)
        .catch(pushErrorArray);
      promises.push(promise);
    }

    if (this.newTollFreeOrders.length > 0) {
      promise = this.PstnService.orderNumbersV2(this.PstnModel.getCustomerId(), this.newTollFreeOrders)
        .catch(pushErrorArray);
      promises.push(promise);
    }

    if (this.portOrders.length > 0) {
      promise = this.PstnService.portNumbers(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), <string[]>_.get(this, 'portOrders[0].data.numbers'))
        .catch(pushErrorArray);
      promises.push(promise);
    }

    if (this.swivelOrders.length > 0) {
      if (this.ftEnterprisePrivateTrunking) {
        promise = this.PstnService.orderNumbersV2Swivel(this.PstnModel.getCustomerId(), <string[]>_.get(this, 'swivelOrders[0].data.numbers'))
          .catch(pushErrorArray);
      } else {
        promise = this.PstnService.orderNumbers(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), <string[]>_.get(this, 'swivelOrders[0].data.numbers'))
          .catch(pushErrorArray);
      }
      promises.push(promise);
    }

    _.forEach(this.advancedOrders, order => {
      let quantity: number = 0;
      if (order.orderType === BLOCK_ORDER && order.numberType === NUMTYPE_DID) {
        //Block Order
        if (_.isArray(order.data)) {
          quantity = (<any[]>order.data).length;
        }
        promise = this.PstnService.orderBlock(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), order.data.areaCode, quantity, order.data.consecutive, order.data.nxx)
          .catch(pushErrorArray);
      } else if (order.orderType === BLOCK_ORDER && order.numberType === NUMTYPE_TOLLFREE) {
        promise = this.PstnService.orderBlock(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), order.data.areaCode, quantity, order.data.consecutive, order.data.nxx);
        promises.push(promise);
        promise = this.PstnService.orderTollFreeBlock(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), order.data.areaCode, quantity)
          .catch(pushErrorArray);
      }
      promises.push(promise);
    });

    return this.$q.all(promises).then(() => {
      if (errors.length > 0) {
        errors.splice(0, 0, this.$translate.instant('pstnSetup.orderNumbersError'));
        this.Notification.notify(errors);
      }
    });
  }

  private importNumbers(): ng.IPromise<any> {
    const swivelNumbers: string[] = <string[]>_.get(this, 'swivelOrders[0].data.numbers', []);
    if (swivelNumbers.length > 0) {
      return this.PstnService.orderNumbersV2Swivel(this.PstnModel.getCustomerId(), swivelNumbers)
        .catch(response => {
          this.Notification.errorResponse(response, 'pstnSetup.orderNumbersError');
          return this.$q.reject(response);
        });
    } else {
      return this.$q.resolve(true);
    }
  }

  public setSwivelOrder(order: string[]): IOrder[] {
    if (order.length > 0) {
      const swivelOrder = [{
        data: { numbers: order },
        numberType: NUMTYPE_DID,
        orderType: SWIVEL_ORDER,
      }];
      this.swivelOrders = swivelOrder;
    } else {
      this.swivelOrders = [];
    }
    return this.swivelOrders;
  }

  private updateCustomerCarrier(): ng.IPromise<any> {
    return this.PstnService.updateCustomerCarrier(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId())
      .then(() => this.PstnModel.setCarrierExists(true))
      .catch(response => {
        this.Notification.errorResponse(response, 'pstnSetup.customerUpdateError');
        return this.$q.reject(response);
      });
  }

  private createCustomerV2(): ng.IPromise<boolean> {
    return this.Orgservice.getAdminOrgUsage(this.PstnModel.getCustomerId())
    .then((org) => {
      let isTrial: boolean = true;
      const customer: IAuthCustomer = _.get<IAuthCustomer>(org, 'data[0]');
      if (customer) {
        isTrial = this.isTrialCallOrRoom(customer.licenses);
      }
      return this.PstnService.createCustomerV2(
        this.PstnModel.getCustomerId(),
        this.PstnModel.getCustomerName(),
        this.PstnModel.getCustomerFirstName(),
        this.PstnModel.getCustomerLastName(),
        this.PstnModel.getCustomerEmail(),
        this.PstnModel.getProviderId(),
        isTrial,
      )
      .then(() => {
        if (this.ftLocation) {
          //Setup Location Object
          this.location.name = this.PstnModel.getCustomerName();
          this.location.default = true; //This is the first location on a new customer
          const address: Address = this.PstnModel.getServiceAddress();
          address.default = true; //This is the first address on a new location
          this.location.addresses = [address.getRAddress()];
        }
        return true;
      })
      .catch(function (response) {
        this.Notification.errorResponse(response, 'PstnModel.customerCreateError');
        return this.$q.reject(response);
      });
    });
  }

  public placeOrder(): ng.IPromise<any> {
    let promise = this.$q.resolve(true);
    if (!this.PstnModel.isCustomerExists()) {
      promise = this.createCustomerV2();
    } else if (!this.PstnModel.isCarrierExists()) {
      promise = this.updateCustomerCarrier();
    }
    return promise
      .then(this.getLocationFeatureToggle.bind(this))
      .then(this.createLocationOrSite.bind(this))
      .then(this.getEnterprisePrivateTrunkingFeatureToggle.bind(this))
      .then(this.createNumbers.bind(this));
  }

  private createLocationOrSite(): ng.IPromise<any> {
    if (this.ftLocation) {
      return this.createLocation();
    }
    return this.createSite();
  }

  public finalizeImport(): ng.IPromise<any> {
    let promise = this.$q.resolve(true);
    if (!this.PstnModel.isCustomerExists()) {
      promise = this.createCustomerV2();
    } else if (!this.PstnModel.isCarrierExists()) {
      promise = this.updateCustomerCarrier();
    }
    return promise
      .then(this.logESAAcceptance.bind(this))
      .then(this.importNumbers.bind(this));
  }

  public initOrders(): {totalNewAdvancedOrder: number, totalPortNumbers: number} {
    const orderCart: IOrder[] = _.cloneDeep(this.PstnModel.getOrders());
    let totalNewAdvancedOrder, totalPortNumbers;

    this.portOrders = _.remove(orderCart, order => order.orderType === PORT_ORDER);

    this.newTollFreeOrders = _.remove(orderCart, order => {
      return order.orderType === NUMBER_ORDER && order.numberType === NUMTYPE_TOLLFREE;
    });

    const pstnAdvancedOrders: any = _.remove(orderCart, order => {
      return order.orderType === BLOCK_ORDER && order.numberType === NUMTYPE_DID;
    });

    this.swivelOrders = _.remove(orderCart, order => order.orderType === SWIVEL_ORDER);

    const tollFreeAdvancedOrders: any = _.remove(orderCart, order => {
      return order.orderType === BLOCK_ORDER && order.numberType === NUMTYPE_TOLLFREE;
    });
    this.advancedOrders = [].concat(pstnAdvancedOrders, tollFreeAdvancedOrders);

    this.newOrders = _.cloneDeep(orderCart);

    if (this.advancedOrders.length > 0 || this.newOrders.length > 0) {
      totalNewAdvancedOrder = this.getTotal(this.newOrders, this.advancedOrders);
    }

    if (this.portOrders.length > 0) {
      totalPortNumbers = this.getTotal(this.portOrders);
    }
    return { totalNewAdvancedOrder, totalPortNumbers };
  }

  private getTotal(newOrders: IOrder[], advancedOrders?: IOrder[]): number {
    let total = 0;
    _.forEach(newOrders, order => {
      if (_.isString(order.data.numbers)) {
        total += 1;
      } else {
        total += order.data.numbers.length;
      }
    });
    if (advancedOrders) {
      _.forEach(advancedOrders, order => {
        if (_.isArray(order.data)) {
          total += (<any[]>order.data).length;
        }
      });
    }
    return total;
  }

  public formatTelephoneNumber(telephoneNumber: IOrder) {
    switch (_.get(telephoneNumber, 'orderType')) {
      case NUMBER_ORDER:
        return this.getCommonPattern(telephoneNumber.data.numbers);
      case PORT_ORDER:
        return this.PORTING_NUMBERS;
      case BLOCK_ORDER: {
        let pstn = 'XXX-XXXX';
        if (_.has(telephoneNumber.data, NXX)) {
          pstn = telephoneNumber.data.nxx + '-' + 'XXXX';
        }
        return '(' + telephoneNumber.data.areaCode + ') ' + pstn;
      }
      case undefined:
        return this.getCommonPattern(telephoneNumber);
      default:
        return undefined;
    }
  }

  private getCommonPattern(telephoneNumber) {
    if (_.isString(telephoneNumber)) {
      return this.PhoneNumberService.getNationalFormat(telephoneNumber);
    } else {
      const firstNumber = this.PhoneNumberService.getNationalFormat(_.head<string>(telephoneNumber));
      const lastNumber = this.PhoneNumberService.getNationalFormat(_.last<string>(telephoneNumber));
      if (this.isConsecutiveArray(telephoneNumber)) {
        return firstNumber + ' - ' + _.last(lastNumber.split('-'));
      } else {
        const commonNumber = this.getLongestCommonSubstring(firstNumber, lastNumber);
        return commonNumber + _.repeat('X', firstNumber.length - commonNumber.length);
      }
    }
  }

  public showOrderQuantity(order): boolean {
    return (_.isArray(order.data.numbers) && !this.isConsecutiveArray(order.data.numbers)) || this.isPortOrder(order) || this.isAdvancedOrder(order);
  }

  private isPortOrder(order: IOrder): boolean {
    return order.orderType === PORT_ORDER;
  }

  private isAdvancedOrder(order: IOrder): boolean {
    return order.orderType === BLOCK_ORDER;
  }

  public getOrderQuantity(order: IOrder): number | undefined {
    switch (order.orderType) {
      case NUMBER_ORDER:
        return order.data.numbers.length;
      case PORT_ORDER:
        return order.data.numbers.length;
      case BLOCK_ORDER:
        if (_.isArray(order.data)) {
          return (<any[]>order.data).length;
        }
      case undefined:
        return undefined;
    }
  }

  private isConsecutiveArray(array: string[]): boolean {
    return _.every(array, (value, index, arr) => {
      // return true for the first element
      if (index === 0) {
        return true;
      }
      // check the difference with the previous element
      return _.parseInt(value) - _.parseInt(<string>arr[index - 1]) === 1;
    });
  }

  private getLongestCommonSubstring(x: string, y: string): string {
    if (!_.isString(x) || !_.isString(y)) {
      return '';
    }
    let i = 0;
    const length = x.length;
    while (i < length && x.charAt(i) === y.charAt(i)) {
      i++;
    }
    return x.substring(0, i);
  }

  public addToCart(orderType: string, numberType: string, quantity: number, searchResultsModel: boolean[], orderCart, model: INumbersModel): ng.IPromise<IOrder[]> {
    this.orderCart = orderCart;
    if (quantity) {
      if (numberType === NUMTYPE_DID) {
        model.pstn.quantity = quantity;
      } else if (numberType === NUMTYPE_TOLLFREE) {
        model.tollFree.quantity = quantity;
      }
    }
    if (searchResultsModel) {
      if (numberType === NUMTYPE_DID) {
        model.pstn.searchResultsModel = searchResultsModel;
      } else if (numberType === NUMTYPE_TOLLFREE) {
        model.tollFree.searchResultsModel = searchResultsModel;
      }
    }

    switch (orderType) {
      case NUMBER_ORDER:
        return this.addToOrder(numberType, model);
      case PORT_ORDER:
        return this.addPortNumbersToOrder();
      case BLOCK_ORDER:
      default:
        return this.addAdvancedOrder(numberType, model);
    }
  }

  private addToOrder(numberType: string, modelValue: INumbersModel): ng.IPromise<IOrder[]> {
    let model;
    const promises: any[] = [];
    let reservation;
    // add to cart
    if (numberType === NUMTYPE_DID) {
      model = modelValue.pstn;
    } else if (numberType === NUMTYPE_TOLLFREE) {
      model = modelValue.tollFree;
    } else {
      this.Notification.error('pstnSetup.errors.unsupportedOrderType', numberType);
    }
    _.forIn(model.searchResultsModel, (value, _key) => {
      if (value) {
        const key = _.parseInt(<string>_key);
        const searchResultsIndex = (model.paginateOptions.currentPage * model.paginateOptions.pageSize) + key;
        if (searchResultsIndex < model.searchResults.length) {
          const numbers = model.searchResults[searchResultsIndex];
          if (numberType === NUMTYPE_DID) {
            reservation = this.PstnService.reserveCarrierInventoryV2(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), numbers, this.PstnModel.isCustomerExists());
          } else if (numberType === NUMTYPE_TOLLFREE) {
            reservation = this.PstnService.reserveCarrierTollFreeInventory(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), numbers, this.PstnModel.isCustomerExists());
          }
          const promise = reservation
            .then(reservationData => {
              const order: IOrder = {
                data: {
                  numbers: numbers,
                },
                numberType: numberType,
                orderType: NUMBER_ORDER,
                reservationId: reservationData.uuid,
              };
              this.orderCart.push(order);
              // return the index to be used in the promise callback
              return {
                searchResultsIndex: searchResultsIndex,
                searchResultsModelIndex: key,
              };
            }).catch(response => this.Notification.errorResponse(response));
          promises.push(promise);
        }
      }
    });
    return this.$q.all(promises).then(results => {
      // sort our successful indexes and process from high to low
      _.forInRight(_.sortBy(results), indices => {
        if (_.isObject(indices) && _.isNumber(indices.searchResultsIndex) && _.isNumber(indices.searchResultsModelIndex)) {
          // clear the checkbox
          _.set(model.searchResultsModel, indices.searchResultsModelIndex, false);
          // remove from search result
          model.searchResults.splice(indices.searchResultsIndex, 1);
        }
      });
      return this.orderCart;
    });
  }

  private addAdvancedOrder(numberType: string, modelValue: INumbersModel): ng.IPromise<IOrder[]> {
    let model;
    if (numberType === NUMTYPE_DID) {
      model = modelValue.pstn;
    } else if (numberType === NUMTYPE_TOLLFREE) {
      model = modelValue.tollFree;
    }
    const advancedOrder = {
      data: {
        areaCode: model.areaCode.code,
        numbers: [],
        length: parseInt(model.quantity, 10),
        consecutive: model.consecutive,
      } as IOrderData,
      numberType: numberType,
      orderType: BLOCK_ORDER,
    };
    const nxx = this.getNxxValue(modelValue);
    if (nxx !== null) {
      advancedOrder.data[NXX] = _.get(modelValue, 'pstn.nxx.code');
    }
    this.orderCart.push(advancedOrder);
    model.showAdvancedOrder = false;
    return this.$q.resolve(this.orderCart);
  }

  private addPortNumbersToOrder(): ng.IPromise<IOrder[]> {
    const portOrder: any = {
      data: {},
      orderType: PORT_ORDER,
    };
    const portNumbersPartition = _.partition(this.getTokens(), 'invalid');
    portOrder.data.numbers = _.map(portNumbersPartition[1], 'value');
    const existingPortOrder: any = _.find(this.orderCart, {
      orderType: PORT_ORDER,
    });
    if (existingPortOrder) {
      const newPortNumbers = _.difference(portOrder.data.numbers, existingPortOrder.data.numbers);
      Array.prototype.push.apply(existingPortOrder.data.numbers, newPortNumbers);
    } else {
      this.orderCart.push(portOrder);
    }
    return this.$q.resolve(this.orderCart);
  }

  private getTokens(): JQuery {
    return (angular.element('#' + this.tokenfieldId) as any).tokenfield('getTokens');
  }

  private getNxxValue(model): string | null {
    if (model.pstn.nxx !== null) {
      if (model.pstn.nxx.code !== NXX_EMPTY) {
        return model.pstn.nxx.code;
      }
    }
    return null;
  }

  public searchCarrierInventory(areaCode: string, block: boolean, quantity: number, consecutive: boolean, stateAbbreviation: string, model: INumbersModel, isTrial: boolean) {
    if (areaCode) {
      model.pstn.showNoResult = false;
      areaCode = '' + areaCode;
      model.pstn.areaCode = {
        code: areaCode.slice(0, MIN_VALID_CODE),
      };
      model.pstn.block = block;
      model.pstn.quantity = quantity;
      model.pstn.consecutive = consecutive;
      model.pstn.stateAbbreviation = stateAbbreviation;
      if (areaCode.length === MAX_VALID_CODE) {
        model.pstn.nxx = {
          code: areaCode.slice(MIN_VALID_CODE, areaCode.length),
        };
      } else {
        model.pstn.nxx = {
          code: null,
        };
      }
    }
    model.pstn.showAdvancedOrder = false;
    const params = {
      npa: _.get(model, 'pstn.areaCode.code'),
      count: this.getCount(model.pstn),
      sequential: model.pstn.consecutive,
      state: model.pstn.stateAbbreviation,
    };

    model.pstn.searchResults = [];
    model.pstn.searchResultsModel = [];
    model.pstn.paginateOptions.currentPage = 0;
    model.pstn.isSingleResult = this.isSingleResult(model);

    return this.PstnService.searchCarrierInventory(this.PstnModel.getProviderId(), params)
      .then(numberRanges => {
        if (numberRanges.length === 0) {
          if (isTrial) {
            model.pstn.showNoResult = true;
          } else {
            model.pstn.showAdvancedOrder = true;
          }

        } else if (model.pstn.isSingleResult) {
          if (areaCode && areaCode.length > MIN_VALID_CODE) {
            model.pstn.searchResults = _.flatten(numberRanges).filter((number: any) => {
              return number.includes(areaCode);
            });
            if (model.pstn.searchResults.length === 0) {
              if (isTrial) {
                model.pstn.showNoResult = true;
              } else {
                model.pstn.showAdvancedOrder = true;
              }
            }
          } else {
            model.pstn.searchResults = _.flatten(numberRanges);
          }
        } else {
          model.pstn.searchResults = numberRanges;
        }
      })
      .catch(response => this.Notification.errorResponse(response, 'pstnSetup.errors.inventory'));
  }

  public isSingleResult(model): boolean {
    if (!model.pstn.block) {
      return true;
    }
    if (model.pstn.quantity === 1 || model.pstn.quantity === null) {
      return true;
    }
    return false;
  }

  public getCount(model): number {
    if (!model.block) {
      return MAX_DID_QUANTITY;
    }
    return (model.quantity ? model.quantity : MAX_DID_QUANTITY);
  }

  public searchCarrierTollFreeInventory(areaCode: string, block: boolean, quantity: number, consecutive: boolean, model) {
    model.tollFree.showAdvancedOrder = false;
    if (angular.isString(areaCode)) {
      model.tollFree.block = block;
      model.tollFree.quantity = quantity;
      model.tollFree.consecutive = consecutive;
      if (areaCode) {
        areaCode = '' + areaCode;
        model.tollFree.areaCode = {
          code: areaCode.slice(0, MIN_VALID_CODE),
        };
      }
      model.tollFree.isSingleResult = !block;
    }
    const params = {
      npa: _.get(model, 'tollFree.areaCode.code'),
      count: this.getCount(model.tollFree),
      sequential: model.tollFree.consecutive,
    };
    model.tollFree.searchResults = [];
    model.tollFree.searchResultsModel = [];
    model.tollFree.paginateOptions.currentPage = 0;
    if (!angular.isString(areaCode)) {
      model.tollFree.isSingleResult = model.tollFree.quantity === 1;
    }

    return this.PstnService.searchCarrierTollFreeInventory(this.PstnModel.getProviderId(), params)
      .then(numberRanges => {
        if (numberRanges.length === 0) {
          model.tollFree.showAdvancedOrder = true;
        } else if (model.tollFree.isSingleResult) {
          model.tollFree.searchResults = _.flatten(numberRanges);
        } else {
          model.tollFree.searchResults = numberRanges;
        }
      })
      .catch(response => this.Notification.errorResponse(response, 'pstnSetup.errors.tollfree.inventory'));
  }

  public hasTollFreeCapability(): ng.IPromise<boolean> {
    return this.PstnService.getCarrierCapabilities(this.PstnModel.getProviderId())
        .then(response => {
          const supportedCapabilities: string[] = [];
          Object.keys(response)
            .filter(x => response[x].capability)
            .map(x => supportedCapabilities.push(response[x].capability));
          return supportedCapabilities.indexOf(TOLLFREE_ORDERING_CAPABILITY) !== -1;
        });
  }

  public removeOrder(order: IOrder): ng.IPromise<any> {
    if (this.isPortOrder(order) || this.isAdvancedOrder(order)) {
      return this.$q.resolve(true);
    } else if (order.orderType === NUMBER_ORDER && order.numberType === NUMTYPE_TOLLFREE) {
      return this.PstnService.releaseCarrierTollFreeInventory(this.PstnModel.getCustomerId(), this.PstnModel.getProviderId(), order.data.numbers, order.reservationId, this.PstnModel.isCustomerExists());
    } else {
      return this.PstnService.releaseCarrierInventoryV2(this.PstnModel.getCustomerId(), order.reservationId, order.data.numbers, this.PstnModel.isCustomerExists());
    }
  }

  public blockByopNumberAddForPartnerAdmin(): boolean {
    if (!this.Authinfo.isCustomerLaunchedFromPartner() && !this.Authinfo.isPartner()) {
      return false;
    }
    return this.blockByopNumberAddForAllAdmin();
  }

  public blockByopNumberAddForAllAdmin(): boolean {
    return (this.isSwivel() && !this.PstnModel.isEsaSigned());
  }

  public isPartnerPortal(): boolean {
    return this.Authinfo.isPartner();
  }

  public isLoggedInAsPartner(): boolean {
    return (this.Authinfo.isCustomerLaunchedFromPartner() || this.Authinfo.isPartner());
  }

  public isTrialCallOrRoom(licenses: IAuthLicense[]): boolean {
    const paidLicense: IAuthLicense = _.find(licenses, (license: IAuthLicense) => {
      return (license.licenseType === 'COMMUNICATION' && !license.isTrial) || (license.licenseType === 'SHARED_DEVICES' && !license.isTrial);
    });
    //if no paid licenses then it's a trial
    return _.isUndefined(paidLicense);
  }
}
