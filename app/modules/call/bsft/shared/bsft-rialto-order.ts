import { IPortingNumber, IPortedNumber } from './bsft-order';

export enum OrderType {
  NEW = 'NEW',
  ADD = 'ADD',
}

export interface IOrderItem {
  orderItemID: string;
  productId: string;
  quantity: string;
}

export interface IRialtoOrder {
  ccwSubscriptionId: string;
  ccwOrderId: string;
  orderType: string;
  requestedFOCDate: string;
  mainNumber?: IPortingNumber;
  orderItems?: IOrderItem[];
  portedNumbers?: IPortedNumber[];
}

export class RialtoOrder implements IRialtoOrder {
  public ccwSubscriptionId: string;
  public ccwOrderId: string;
  public orderType: string;
  public requestedFOCDate: string;
  public mainNumber?: IPortingNumber;
  public orderItems?: IOrderItem[];
  public portedNumbers?: IPortedNumber[];

  constructor (rialtoOrder: IRialtoOrder = {
    ccwSubscriptionId: '',
    ccwOrderId: '',
    orderType: '',
    requestedFOCDate: '',
    mainNumber: undefined,
    orderItems: undefined,
    portedNumbers: undefined,
  }) {
    this.ccwSubscriptionId = rialtoOrder.ccwSubscriptionId;
    this.ccwOrderId = rialtoOrder.ccwOrderId;
    this.orderType = rialtoOrder.orderType;
    this.requestedFOCDate = rialtoOrder.requestedFOCDate;
    this.mainNumber = rialtoOrder.mainNumber;
    this.orderItems = rialtoOrder.orderItems;
    this.portedNumbers = rialtoOrder.portedNumbers;
  }
}
