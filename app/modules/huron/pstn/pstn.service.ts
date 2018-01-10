import {
  PSTN, NUMTYPE_DID, NXX, NPA, GROUP_BY, NUMTYPE_TOLLFREE, TATA, BLOCK_ORDER, NUMBER_ORDER,
  PORT_ORDER, AUDIT, UPDATE, DELETE, ADD, PROVISIONED, CANCELLED, PENDING, QUEUED, TYPE_PORT,
  ORDER, ADMINTYPE_PARTNER, ADMINTYPE_CUSTOMER, PSTN_CARRIER_ID, E911_SIGNEE, SWIVEL,
  ContractStatus,
} from './pstn.const';
import {
  PstnModel,
  IOrder,
 } from './pstn.model';
import {
  TerminusService,
  INumberOrder,
} from './terminus.service';
import { IRAddress } from './shared/pstn-address';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { PhoneNumberType } from 'google-libphonenumber';
import { Notification } from 'modules/core/notifications/notification.service';

export interface IRTerminusLocation {
  uuid?: string;
  name: string;
  addresses?: IRAddress[];
  default?: boolean;
  voiceLocationRef?: string;
}

export class TerminusLocation implements IRTerminusLocation {
  public uuid?: string;
  public name: string;
  public addresses?: IRAddress[];
  public default?: boolean;
  public voiceLocationRef?: string;

  constructor(terminusLocation: IRTerminusLocation = {
    name: '',
  }) {
    this.uuid = terminusLocation.uuid;
    this.name = terminusLocation.name;
    this.addresses = terminusLocation.addresses;
    this.default = terminusLocation.default;
    this.voiceLocationRef = terminusLocation.voiceLocationRef;
  }
}

export class PstnService {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private PstnModel: PstnModel,
    private TerminusService: TerminusService,
    private Notification: Notification,
    private PhoneNumberService: PhoneNumberService,
    private Authinfo,
  ) { }

  public createCustomerV2(uuid: string, name: string, firstName: string, lastName: string, email: string, pstnCarrierId: string, trial: boolean): ng.IPromise<any> {
    const payload = {
      uuid: uuid,
      name: name,
      firstName: firstName,
      lastName: lastName,
      email: email,
      pstnCarrierId: pstnCarrierId,
      trial: trial,
    };

    if (this.PstnModel.isResellerExists()) {
      payload['resellerId'] = this.Authinfo.getCallPartnerOrgId();
    }
    return this.TerminusService.customerV2().save({}, payload).$promise;
  }

  public getResellerV2(): ng.IPromise<any> {
    return this.TerminusService.resellerV2().get({
      resellerId: this.Authinfo.getCallPartnerOrgId(),
    }).$promise;
  }

  public createResellerV2(): ng.IPromise<any> {
    const payload = {
      uuid: this.Authinfo.getCallPartnerOrgId(),
      email: this.Authinfo.getPrimaryEmail(),
    };
    if (this.Authinfo.isPartner()) {
      _.extend(payload, { name: this.Authinfo.getOrgName() });
    }
    return this.TerminusService.resellerV2().save({}, payload).$promise;
  }

  public updateCustomerCarrier(customerId: string, pstnCarrierId: string): ng.IPromise<any> {
    const payload = {
      pstnCarrierId: pstnCarrierId,
    };
    return this.TerminusService.customer().update({
      customerId: customerId,
    }, payload).$promise;
  }

  public updateCustomerE911Signee(customerId: string): ng.IPromise<any> {
    const payload = {
      e911Signee: this.Authinfo.getUserId(),
    };
    return this.TerminusService.customer().update({
      customerId: customerId,
    }, payload).$promise;
  }

  public getCustomer(customerId: string): ng.IPromise<any> {
    return this.TerminusService.customer().get({
      customerId: customerId,
    }).$promise;
  }

  public getCustomerV2(customerId: string, params: any = {}): ng.IPromise<any> {
    params['customerId'] = customerId;
    return this.TerminusService.customerV2().get(params).$promise.then(result => {
      result['contractStatus'] = ContractStatus.UnKnown;
      if (_.get(params, 'deep') === true) {
        const isContractSigned: boolean | undefined = _.get(result, 'isContractSigned');
        if (isContractSigned !== undefined) {
          result.contractStatus = isContractSigned ? ContractStatus.Signed : ContractStatus.UnSigned;
        } else {
          result.contractStatus = ContractStatus.NotImplemented;
        }
      }
      return result;
    });
  }

  public getCustomerTrialV2(customerId: string): ng.IPromise<any> {
    return this.TerminusService.customerTrialsV2().get({
      customerId: customerId,
    }).$promise;
  }

  public setCustomerTrialV2(customerId: string, fname: string, lname: string, email: string): ng.IPromise<any> {
    return this.TerminusService.customerTrialsV2().save({
      customerId: customerId,
    }, {
      acceptedFirstName: fname,
      acceptedLastName: lname,
      acceptedEmail: email,
    }).$promise;
  }

  public listDefaultCarriers(): ng.IPromise<any[]> {
    return this.TerminusService.carrier().query({
      service: PSTN,
      defaultOffer: true,
    }).$promise.then((response) => this.getCarrierDetails(response));
  }

  public listDefaultCarriersV2(): ng.IPromise<any[]> {
    return this.TerminusService.carriersV2().query({
      service: PSTN,
      defaultOffer: true,
      country: this.PstnModel.getCountryCode(),
    }).$promise.then((response) => this.getCarrierDetails(response));
  }

  public listResellerCarriers(): ng.IPromise<any[]> {
    return this.TerminusService.resellerCarrierV2().query({
      resellerId: this.Authinfo.getCallPartnerOrgId(),
    }).$promise.then((response) => this.getCarrierDetails(response));
  }

  public listResellerCarriersV2(): ng.IPromise<any[]> {
    return this.TerminusService.resellerCarrierV2().query({
      resellerId: this.Authinfo.getCallPartnerOrgId(),
      country: this.PstnModel.getCountryCode(),
    }).$promise.then((response) => this.getCarrierDetails(response));
  }

  public listCustomerCarriers(customerId): ng.IPromise<any[]> {
    return this.TerminusService.customerCarriers().query({
      customerId: customerId,
    }).$promise.then((response) => this.getCarrierDetails(response));
  }

  public getCarrierDetails(carriers): ng.IPromise<any> {
    const promises: any = [];
    _.forEach(carriers, (carrier) => {
      const promise = this.TerminusService.carrier().get({
        carrierId: carrier.uuid,
      }).$promise;
      promises.push(promise);
    });
    return this.$q.all(promises);
  }

  public getCarrierInventory(carrierId: string, state: string, npa?: string): ng.IPromise<any> {
    const config: any = {
      carrierId: carrierId,
      numberType: NUMTYPE_DID,
    };
    if (_.isString(npa)) {
      if (npa.length > 0) {
        config[NPA] = npa;
        config[GROUP_BY] = NXX;
      }
    } else {
      config.state = state;
    }
    return this.TerminusService.carrierNumbersCountV2().get(config).$promise;
  }

  public getCarrierTollFreeInventory(carrierId: string): ng.IPromise<any> {
    return this.TerminusService.carrierNumbersCountV2().get({
      carrierId: carrierId,
      numberType: NUMTYPE_TOLLFREE,
    }).$promise;
  }

  public getCarrierCapabilities(carrierId: string): ng.IPromise<any> {
    return this.TerminusService.carrierCapabilitiesV2().query({
      carrierId: carrierId,
    }).$promise;
  }

  public searchCarrierInventory(carrierId: string, params: any): ng.IPromise<any> {
    const paramObj = params || {};
    paramObj.carrierId = carrierId;
    paramObj.numberType = NUMTYPE_DID;
    return this.TerminusService.carrierNumberV2().get(paramObj).$promise
        .then(response => _.get(response, 'numbers', []));
  }

  public searchCarrierTollFreeInventory(carrierId: string, params: any): ng.IPromise<any> {
    const paramObj = params || {};
    paramObj.carrierId = carrierId;
    paramObj.numberType = NUMTYPE_TOLLFREE;
    return this.TerminusService.carrierNumberV2().get(paramObj).$promise
        .then(response => _.get(response, 'numbers', []));
  }

  public reserveCarrierInventoryV2(customerId: string, carrierId: string, numbers: string[], isCustomerExists: boolean): ng.IPromise<any> {
    if (!_.isArray(numbers)) {
      numbers = [numbers];
    }

    if (isCustomerExists) {
        // If a customer exists, reserve with the customer
      return this.TerminusService.customerNumberReservationV2().save({
        customerId: customerId,
      }, {
        numberType: NUMTYPE_DID,
        numbers: numbers,
      }, (data, headers) => {
        data.uuid = headers('location').split('/').pop();
        return data;
      }).$promise;
    } else {
        // Otherwise reserve with carrier
      return this.TerminusService.resellerCarrierNumbersReservationV2().save({
        resellerId: this.Authinfo.getCallPartnerOrgId(),
        carrierId: carrierId,
      }, {
        numberType: NUMTYPE_DID,
        numbers: numbers,
      }, (data, headers) => {
        data.uuid = headers('location').split('/').pop();
        return data;
      }).$promise;
    }
  }

  public releaseCarrierInventoryV2(customerId: string, reservationId: string | undefined, numbers: string | string[], isCustomerExists: boolean): ng.IPromise<any> {
    if (!_.isArray(numbers)) {
      numbers = [numbers];
    }
    if (isCustomerExists) {
        // If a customer exists, release with the customer
      return this.TerminusService.customerNumberReservationV2().delete({
        customerId: customerId,
        reservationId: reservationId,
      }, {
        numbers: numbers,
      }).$promise;
    } else {
        // Otherwise release with carrier
      return this.TerminusService.resellerNumberReservationV2().delete({
        resellerId: this.Authinfo.getCallPartnerOrgId(),
        reservationId: reservationId,
      }, {
        numbers: numbers,
      }).$promise;
    }
  }

  public releaseCarrierTollFreeInventory(customerId: string, _carrierId: string, numbers: string | string[], reservationId: string | undefined, isCustomerExists: boolean): ng.IPromise<any> {
    if (!_.isArray(numbers)) {
      numbers = [numbers];
    }
    if (isCustomerExists) {
        // If a customer exists, release with the customer
      return this.TerminusService.customerNumberReservationV2().delete({
        customerId: customerId,
        reservationId: reservationId,
      }, {
        numbers: numbers,
      }).$promise;
    } else {
        // Otherwise release with carrier resellerNumberReservationV2
      return this.TerminusService.resellerNumberReservationV2().delete({
        resellerId: this.Authinfo.getCallPartnerOrgId(),
        reservationId: reservationId,
      }, {
        numbers: numbers,
      }).$promise;
    }
  }

  public reserveCarrierTollFreeInventory(customerId: string, carrierId: string, numbers: string | string[], isCustomerExists: boolean): ng.IPromise<any> {
    if (!_.isArray(numbers)) {
      numbers = [numbers];
    }

    if (isCustomerExists) {
        // If a customer exists, reserve with the customer
      return this.TerminusService.customerNumberReservationV2().save({
        customerId: customerId,
      }, {
        numberType: NUMTYPE_TOLLFREE,
        numbers: numbers,
      }, (data, headers) => {
        data.uuid = headers('location').split('/').pop();
        return data;
      }).$promise;
    } else {
        // Otherwise reserve with carrier
      return this.TerminusService.resellerCarrierNumbersReservationV2().save({
        resellerId: this.Authinfo.getCallPartnerOrgId(),
        carrierId: carrierId,
      }, {
        numberType: NUMTYPE_TOLLFREE,
        numbers: numbers,
      }, (data, headers) => {
        data.uuid = headers('location').split('/').pop();
        return data;
      }).$promise;
    }
  }

  public isCarrierSwivel(customerId: string): ng.IPromise<boolean> {
    return this.listCustomerCarriers(customerId).then(carriers => {
      if (_.isArray(carriers)) {
        const carrier = _.find(carriers, {
          name: TATA,
        });
        if (carrier) {
          return true;
        }
      }
      return false;
    });
  }

  public orderBlock(
    customerId: string,  _carrierId: string, npa: undefined | string,
    quantity: number, isSequential: undefined | boolean,  nxx: undefined | string): ng.IPromise<any> {
    const payload = {
      npa: npa,
      quantity: quantity,
      numberType: NUMTYPE_DID,
      sequential: isSequential,
      createdBy: this.setCreatedBy(),
    };
    if (_.isString(nxx)) {
      payload['nxx'] = nxx;
    }

    return this.TerminusService.customerNumbersOrderBlockV2().save({
      customerId: customerId,
    }, payload).$promise;
  }

  public orderTollFreeBlock(
    customerId: string, _carrierId: string, npa: undefined | string,
    quantity: number): ng.IPromise<any> {
    const payload = {
      npa: npa,
      quantity: quantity,
      numberType: NUMTYPE_TOLLFREE,
      createdBy: this.setCreatedBy(),
    };

    return this.TerminusService.customerNumbersOrderBlockV2().save({
      customerId: customerId,
    }, payload).$promise;
  }

  public orderNumbers(customerId: string, carrierId: string, numbers: string[]): ng.IPromise<any> {
    const promises: any = [];
    const payload = {
      pstn: {
        numbers: [] as string[],
      },
      tollFree: {
        numberType: NUMTYPE_TOLLFREE,
        numbers: [] as string[],
      },
    };
    _.forEach(numbers, number => {
      const phoneNumberType: PhoneNumberType = this.PhoneNumberService.getPhoneNumberType(number);
      if (phoneNumberType === PhoneNumberType.TOLL_FREE) {
        payload.tollFree.numbers.push(number);
      } else if (phoneNumberType === PhoneNumberType.UNKNOWN) {
        this.Notification.error('pstnSetup.errors.unsupportedNumberType', {
          type: phoneNumberType,
          number: number,
        });
      } else {
        payload.pstn.numbers.push(number);
      }
    });
    if (payload.pstn.numbers.length > 0) {
      const pstnPromise = this.TerminusService.customerCarrierDid().save({
          customerId: customerId,
          carrierId: carrierId,
          type: ORDER,
        }, payload.pstn).$promise;
      promises.push(pstnPromise);
    }
    return this.$q.all(promises);
  }

  public orderNumbersV2(customerId: string, newNumberOrders: IOrder[]): ng.IPromise<any> {
    const promises: any = [];
    _.forEach(newNumberOrders, order => {
      if (order.numberType === NUMTYPE_DID) {
        const didOrderPromise = this.TerminusService.customerNumbersOrderV2().save({
            customerId: customerId,
          }, {
            reservationIds: [_.get(order, 'reservationId', '')],
            numberType: order.numberType,
            createdBy: this.setCreatedBy(),
          }).$promise;
        promises.push(didOrderPromise);
      } else if (order.numberType === NUMTYPE_TOLLFREE) {
        const tollFreeOrderPromise = this.TerminusService.customerNumbersOrderV2().save({
          customerId: customerId,
        }, {
          reservationIds: [_.get(order, 'reservationId', '')],
          numberType: order.numberType,
          createdBy: this.setCreatedBy(),
        }).$promise;
        promises.push(tollFreeOrderPromise);
      } else {
        this.Notification.error('pstnSetup.errors.unsupportedOrderType', order.numberType);
      }
    });
    return this.$q.all(promises);
  }

  public orderNumbersV2Swivel(customerId: string, numbers: string[]): ng.IPromise<any[]> {
    const promises: ng.IPromise<any>[] = [];
    let tfnNumbers: string[] = [];

    tfnNumbers = _.remove(numbers, number => {
      return this.PhoneNumberService.getPhoneNumberType(number) === PhoneNumberType.TOLL_FREE;
    });

    const tfnPayload = {
      numbers: tfnNumbers,
      numberType: NUMTYPE_TOLLFREE,
      createdBy: this.setCreatedBy(),
    };

    const didPayload = {
      numbers: numbers,
      numberType: NUMTYPE_DID,
      createdBy: this.setCreatedBy(),
    };

    if (numbers.length > 0) {
      const pstnPromise = this.TerminusService.customerNumbersOrderV2().save({
          customerId: customerId,
      }, didPayload).$promise;
      promises.push(pstnPromise);
    }

    if (tfnNumbers.length > 0) {
      const tollFreePromise = this.TerminusService.customerNumbersOrderV2().save({
          customerId: customerId,
      }, tfnPayload).$promise;
      promises.push(tollFreePromise);
    }
    return this.$q.all(promises);
  }

  public portNumbers(customerId: string, _carrierId: string, numbers: string[]): ng.IPromise<any> {
    const promises: any = [];
    let tfnNumbers: any = [];

    tfnNumbers = _.remove(numbers, number => {
      return this.PhoneNumberService.getPhoneNumberType(number) === PhoneNumberType.TOLL_FREE;
    });

    const tfnPayload = {
      numbers: tfnNumbers,
      numberType: NUMTYPE_TOLLFREE,
      createdBy: this.setCreatedBy(),
    };

    const didPayload = {
      numbers: numbers,
      numberType: NUMTYPE_DID,
      createdBy: this.setCreatedBy(),
    };

    if (numbers.length > 0) {
      promises.push(this.TerminusService.customerPortV2().save({
        customerId: customerId,
      }, didPayload).$promise);
    }
    if (tfnNumbers.length > 0) {
      promises.push(this.TerminusService.customerPortV2().save({
        customerId: customerId,
      }, tfnPayload).$promise);
    }

    return this.$q.all(promises);
  }

  public listPendingOrders(customerId: string): ng.IPromise<any> {
    const pendingOrders: any = [];
    pendingOrders.push(
        this.queryPendingOrders(customerId, PSTN),
      );
    pendingOrders.push(
        this.queryPendingOrders(customerId, TYPE_PORT),
      );
    return this.$q.all(pendingOrders)
        .then(_.flatten);
  }

    // TODO (jlowery): Remove this function when Terminus implements
    // a 'wide' parameter for the list orders API that will return the
    // numbers with the order list so we don't have to make another
    // backend call to get the details for each order.
  public listPendingOrdersWithDetail(customerId: string): ng.IPromise<any> {
    const pendingOrdersWithDetail: any = [];
    pendingOrdersWithDetail.push(
        this.queryPendingOrders(customerId, PSTN)
          .then(orders => {
            const orderDetailPromises: any = [];
            _.forEach(orders, (order) => {
              orderDetailPromises.push(
                this.getOrder(customerId, order.uuid).then(orderDetail => {
                  return orderDetail;
                }));
            });
            return this.$q.all(orderDetailPromises);
          }),
      );
    pendingOrdersWithDetail.push(
        this.queryPendingOrders(customerId, TYPE_PORT)
          .then(orders => {
            const orderDetailPromises: any = [];
            _.forEach(orders, (order) => {
              orderDetailPromises.push(
                this.getOrder(customerId, order.uuid).then(orderDetail => {
                  return orderDetail;
                }));
            });
            return this.$q.all(orderDetailPromises);
          }),
      );
    return this.$q.all(pendingOrdersWithDetail).then(_.flatten);
  }

  public queryPendingOrders(customerId: string, orderType: string): ng.IPromise<any> {
    return this.TerminusService.customerNumbersOrderV2().query({
      customerId: customerId,
      type: orderType,
      status: PENDING,
    }).$promise;
  }

  public getOrder(customerId: string, orderId: string): ng.IPromise<any> {
    return this.TerminusService.customerNumbersOrderV2().get({
      customerId: customerId,
      orderId: orderId,
    }).$promise;
  }

  public getFormattedNumberOrders(customerId: string): ng.IPromise<any> {
    return this.TerminusService.customerNumbersOrderV2().query({
      customerId: customerId,
    }).$promise.then((orders) => {
      const promises: any = [];
        // Lookup each order and add the numbers to original response
      _.forEach(orders, order => {
        if (order.operation !== UPDATE && order.operation !== DELETE && order.operation !== ADD && order.operation !== AUDIT) {
          const promise = this.getOrder(customerId, order.uuid).then(orderResponse => {
            order.numbers = orderResponse.numbers;
            if (!_.isUndefined(orderResponse.attributes.npa) || !_.isUndefined(orderResponse.attributes.createdBy)) {
              order.attributes = orderResponse.attributes;
            }
            return order;
          });
          promises.push(promise);
        }
      });
      return this.$q.all(promises);
    })
      .then(response => {
        return _.chain(response)
          .map((order: INumberOrder) => {
            if (order.operation !== UPDATE && order.operation !== DELETE && order.operation !== ADD && order.operation !== AUDIT) {
              const newOrder: any = {
                carrierOrderId: _.get(order, 'carrierOrderId'),
                //not all orders have batches
                carrierBatchId: _.get(order, 'carrierBatchId', null),
                operation: _.get(order, 'operation'),
                statusMessage: _.get(order, 'statusMessage') === 'None' ? null : _.get(order, 'statusMessage'),
                tooltip: this.translateStatusMessage(order),
                uuid: _.get(order, 'uuid'),
                numbers: _.get(order, 'numbers'),
              };

              //translate order status
              if (order.status === PROVISIONED) {
                newOrder.status = this.$translate.instant('pstnOrderOverview.successful');
              } else if (order.status === CANCELLED) {
                newOrder.status = this.$translate.instant('pstnOrderOverview.cancelled');
              } else if (order.status === PENDING) {
                newOrder.status = this.$translate.instant('pstnOrderOverview.inProgress');
              } else if (order.status === QUEUED) {
                newOrder.status = this.$translate.instant('pstnOrderOverview.inProgress');
              }

              //translate order type
              if (order.operation === BLOCK_ORDER && _.get(order, 'numberType', NUMTYPE_DID) === NUMTYPE_DID) {
                newOrder.type = this.$translate.instant('pstnOrderOverview.advanceOrder');
              } else if (order.operation === NUMBER_ORDER && _.get(order, 'numberType', NUMTYPE_DID) === NUMTYPE_DID) {
                newOrder.type = this.$translate.instant('pstnOrderOverview.newNumberOrder');
              } else if (order.operation === BLOCK_ORDER && _.get(order, 'numberType') === NUMTYPE_TOLLFREE) {
                newOrder.type = this.$translate.instant('pstnOrderOverview.advanceOrder');
              } else if (order.operation === NUMBER_ORDER && _.get(order, 'numberType') === NUMTYPE_TOLLFREE) {
                newOrder.type = this.$translate.instant('pstnOrderOverview.newNumberOrder');
              } else if (order.operation === PORT_ORDER) {
                newOrder.type = this.$translate.instant('pstnOrderOverview.portNumberOrder');
              } else if (order.operation === BLOCK_ORDER && order.numberType === NUMTYPE_TOLLFREE) {
                newOrder.type = this.$translate.instant('pstnOrderOverview.tollFreeNumberAdvanceOrder');
              }

              if (order.operation === BLOCK_ORDER) {
                if (!_.isUndefined(order.attributes)) {
                  newOrder.areaCode = order.attributes.npa;
                  newOrder.quantity = order.attributes.quantity;
                } else {
                  newOrder.areaCode = this.getAreaCode(order);
                  newOrder.quantity = order.numbers.length;
                }
              }

              //create sort date and translate creation date
              const orderDate = new Date(order.created);
              newOrder.sortDate = orderDate.getTime();
              newOrder.created = (orderDate.getMonth() + 1) + '/' + orderDate.getDate() + '/' + orderDate.getFullYear();
              const utcOrderDate  = orderDate.toUTCString().split(' ');
              newOrder.formattedDate = utcOrderDate[2] + ' ' + utcOrderDate[1] + ', ' + utcOrderDate[3];
              //update order status and tooltip at number level since we combine same order with different batches
              _.forEach(newOrder.numbers, number => {
                number.status = newOrder.status;
                number.tooltip = newOrder.tooltip;
              });

              if (!_.isUndefined(order.attributes) && !_.isUndefined(order.attributes.createdBy)) {
                newOrder.createdBy = order.attributes.createdBy;
              }
              return newOrder;
            }
            return undefined;
          })
          .compact()
          .value();
      });
  }

  public translateStatusMessage(order): string | undefined {
    const translations = {
      'Account Number and PIN Required': this.$translate.instant('pstnSetup.orderStatus.pinRequired'),
      'Address Mismatch': this.$translate.instant('pstnSetup.orderStatus.addressMismatch'),
      'BTN Mismatch': this.$translate.instant('pstnSetup.orderStatus.btnMismatch'),
      'Customer has Trial Status': this.$translate.instant('pstnSetup.orderStatus.tosNotSigned'),
      'FOC Received': this.$translate.instant('pstnSetup.orderStatus.focReceived'),
      'Invalid Authorization Signature': this.$translate.instant('pstnSetup.orderStatus.invalidSig'),
      'LOA Not Signed': this.$translate.instant('pstnSetup.orderStatus.loaNotSigned'),
      'Master Service Agreement not signed': this.$translate.instant('pstnSetup.orderStatus.msaNotSigned'),
      'Pending FOC from Vendor': this.$translate.instant('pstnSetup.orderStatus.pendingVendor'),
      Rejected: this.$translate.instant('pstnSetup.orderStatus.rejected'),
    };

    if (!_.isUndefined(translations[order.statusMessage])) {
      return translations[order.statusMessage];
    } else if (order.statusMessage && order.statusMessage !== 'None') {
      return this.displayBatchIdOnly(order.statusMessage);
    }
  }

  public displayBatchIdOnly(statusMessage): string {
    if (statusMessage.indexOf('Batch') >= 0) {
      if (statusMessage.indexOf(',') >= 0) {
        const batchStatus = statusMessage.split(',');
        const batchIdOnlyStatusMessage: any = [];
        _.forEach(batchStatus, batchOnly => {
          const batchId = (batchOnly.replace(/\D+/g, ''));
          batchIdOnlyStatusMessage.push(batchId);
        });
        return batchIdOnlyStatusMessage.toString();
      }
      return statusMessage.replace(/\D+/g, '');
    }
    return statusMessage;
  }

  public listPendingNumbers(customerId: string): ng.IPromise<any> {
    const pendingNumbers: any = [];

    return this.listPendingOrders(customerId).then(orders => {
      const promises: any = [];
      _.forEach(orders, carrierOrder => {
        if (_.get(carrierOrder, 'operation') === AUDIT) {
          // noop. Don't get details of pending audit orders.
        } else if (_.get(carrierOrder, 'operation') === BLOCK_ORDER) {
          let areaCode, orderQuantity;
          const promise = this.getOrder(customerId, carrierOrder.uuid).then(response => {
            if (!_.isUndefined(response.attributes.npa)) {
              areaCode = response.attributes.npa;
              orderQuantity = _.parseInt(response.attributes.quantity);
            } else {
              areaCode = this.getAreaCode(response);
              orderQuantity = response.numbers.length;
            }
            pendingNumbers.push({
              pattern: '(' + areaCode + ') XXX-XXXX',
              quantity: orderQuantity,
            });
          });
          promises.push(promise);
        } else {
          const promise = this.getOrder(customerId, carrierOrder.uuid).then(response => {
            const orderNumbers = response.numbers;
            _.forEach(orderNumbers, orderNumber => {
              if (orderNumber && orderNumber.number && (orderNumber.network === PENDING || orderNumber.network === QUEUED)) {
                pendingNumbers.push({
                  pattern: _.get(orderNumber, 'number', this.$translate.instant('pstnSetup.errors.orders.missingNumber', {
                    orderNumber: _.get(response, 'carrierOrderId'),
                  })),
                });
              }
            });
          });
          promises.push(promise);
        }
      });

      return this.$q.all(promises).then(() => {
        return pendingNumbers;
      });
    });
  }

  public deleteNumber(customerId: string, number: string): ng.IPromise<any> {
    return this.TerminusService.customerNumberV2().delete({
      customerId: customerId,
      number: number,
    }).$promise;
  }

  public getAreaCode(order) {
    const desc = _.get<string>(order, 'description', '');
    return desc.slice(-3);
  }

  public setCountryCode(countryCode): void {
    this.PstnModel.setCountryCode(countryCode);
      //reset carriers
    this.PstnModel.setCarriers([]);
  }

  public getCountryCode(): string {
    return this.PstnModel.getCountryCode();
  }

  public getProvider(): any {
    return this.PstnModel.getProvider();
  }

  public isSwivelCustomerAndEsaUnsigned(customerId: string): ng.IPromise<boolean> {
    return this.getCustomerV2(customerId).then((result) => {
      if (_.has(result, PSTN_CARRIER_ID) && (!_.has(result, E911_SIGNEE) || _.get(result, E911_SIGNEE) === null)) {
        const carriers = [{ uuid: result.pstnCarrierId }];
        return this.getCarrierDetails(carriers).then((carrierDetails) => {
          return (carrierDetails.length === 1 && carrierDetails[0].apiImplementation === SWIVEL);
        });
      }
      return false;
    });
  }

  private setCreatedBy(): string {
    // Need who is creating the order
    return (this.Authinfo.isCustomerLaunchedFromPartner() || this.Authinfo.isPartner()) ? ADMINTYPE_PARTNER : ADMINTYPE_CUSTOMER;
  }

  public createLocation(terminusLocation: TerminusLocation): ng.IPromise<string> {
    let uuid: string;
    return this.TerminusService.customerLocations<IRTerminusLocation>()
    .save({
      customerId: this.PstnModel.getCustomerId(),
    },
    terminusLocation,
    (_response, headers) => {
      uuid = headers('location').split('/').pop();
    })
    .$promise
    .then(() => uuid);
  }

}

import pstnModelModule from './pstn.model';
import terminusServiceModule from './terminus.service';

export default angular
  .module('huron.pstn.pstn-service', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/notifications').default,
    require('modules/core/featureToggle').default,
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/phoneNumber').default,
    pstnModelModule,
    terminusServiceModule,
  ])
  .service('PstnService', PstnService)
  .name;
