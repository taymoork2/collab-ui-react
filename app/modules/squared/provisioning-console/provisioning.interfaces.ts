export interface IOrder {
  webOrderID: string;
  orderUUID: string;
  siteUrl: string;
  manualCode: string;
  status: string;
  orderReceived: string;
  lastModified: string;
  adminEmail: string;
  queueReceived: string;
  queueCompleted: string;
  assignedTo: string;
  completedBy: string;

}

export interface IOrders {
  completed: IOrder[];
  pending: IOrder[];

}

export interface IOrderDetail {
  serviceProvisioningId: string;
  orderingTool: string;
  externalOrderId: string;
  productProvisionStatus: any;
  orderReceived: string;
  serviceId: string;
  orderContent: any;
  lastModified: string;
  orderUUID: string;
  subscriptionUuid: string;

}
