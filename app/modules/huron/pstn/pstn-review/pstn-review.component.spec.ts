import pstnReviewModule from './index';

import { IOrder, PstnModel } from '../pstn.model';
import {
  NUMBER_ORDER, PORT_ORDER,
  NUMTYPE_DID, NUMTYPE_TOLLFREE,
} from '../pstn.const';
import { PstnCarrier } from '../pstnProviders';

let gPstnModel: PstnModel;

describe('Component: PstnReviewComponant', () => {
  beforeEach(function() {
    this.initModules(pstnReviewModule);
    this.injectDependencies(
      'PstnModel',
    );
    this.compileComponent('ucPstnReview', {});
    gPstnModel = this.PstnModel as PstnModel;
  });

  it('should create controller', function () {
    expect(this.controller).toExist();
  });

  function addTestNumbers(base: string, start: number, cnt: number): string[] {
    const numbers: string[] = [];
    for (let i: number = 0; i < cnt; i++) {
      numbers.push(`${base}${start++}`);
    }
    return numbers;
  }

  function loadModelWithNumbers(): void {
    //create test orders
    let tOrder: IOrder;
    const orders: IOrder[] = [];
    const order: IOrder = {
      orderType: PORT_ORDER,
      data: {
        numbers: '+19725551000',
      },
      numberType: undefined,
      reservationId: undefined,
    };

    tOrder = _.cloneDeep(order);
    orders.push(tOrder);

    tOrder = _.cloneDeep(order);
    tOrder.data.numbers = addTestNumbers('+1972555', 1001, 99);
    orders.push(tOrder);

    order.orderType = NUMBER_ORDER;
    order.numberType = NUMTYPE_DID;
    tOrder = _.cloneDeep(order);
    tOrder.data.numbers = '+19725552000';
    orders.push(tOrder);

    tOrder = _.cloneDeep(order);
    tOrder.data.numbers = addTestNumbers('+1972555', 2001, 100);
    orders.push(tOrder);

    order.numberType = NUMTYPE_TOLLFREE;
    tOrder = _.cloneDeep(order);
    tOrder.data.numbers = '+18005553000';
    orders.push(tOrder);

    tOrder = _.cloneDeep(order);
    tOrder.data.numbers = addTestNumbers('+1800555', 3001, 101);
    orders.push(tOrder);

    gPstnModel.setOrders(orders);
  }

  it('should create number arrays', function () {
    loadModelWithNumbers();
    this.controller.$onInit();
    expect(this.controller.numbersPort.length).toEqual(100);
    expect(this.controller.numbersDID.length).toEqual(101);
    expect(this.controller.numbersToll.length).toEqual(102);
  });

  it('should have correct names and paragraphs', function () {
    let pstnCarrier: PstnCarrier = gPstnModel.getProvider();
    if (_.isEmpty(pstnCarrier)) {
      pstnCarrier = new PstnCarrier();
      gPstnModel.setProvider(pstnCarrier);
    }
    pstnCarrier.logoAlt = 'IntelePeer';
    pstnCarrier.logoSrc = 'images/carriers/logo_intelepeer.svg';
    pstnCarrier.displayName = 'Voice Services Bundle';
    pstnCarrier.vendor = 'INTELEPEER';

    this.controller.$onInit();
    expect(this.controller.logoSrc).toEqual(pstnCarrier.logoSrc);
    expect(this.controller.logoAlt).toEqual(pstnCarrier.logoAlt);
    expect(this.controller.carrierName).toEqual(pstnCarrier.vendor);
    expect(this.controller.packageName).toEqual(pstnCarrier.displayName);
  });

  it('should get proper port dates', function () {
    const date: Date = new Date(2017, 11, 13, 14);  //Wed Dec 13, 2017 14:00:00
    let postDate: Date = new Date(2018, 0, 4);
    expect(this.controller.getPortDate(date)).toEqual(postDate.toLocaleDateString());

    date.setDate(date.getDate() + 1); //Thu Dec 14 2017 14:00:00
    postDate = new Date(2018, 0, 9);
    expect(this.controller.getPortDate(date)).toEqual(postDate.toLocaleDateString());

    date.setDate(date.getDate() + 1); //Fri Dec 15 2017 14:00:00
    expect(this.controller.getPortDate(date)).toEqual(postDate.toLocaleDateString());
  });

});
