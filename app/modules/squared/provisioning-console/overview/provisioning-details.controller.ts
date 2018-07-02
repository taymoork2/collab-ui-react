import { ProvisioningService, Status , STATUS_UPDATE_EVENT_NAME } from 'modules/squared/provisioning-console/provisioning.service';
import { Notification } from 'modules/core/notifications';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { IOrder } from 'modules/squared/provisioning-console/provisioning.interfaces';

export interface IServiceItem {
  siteUrl: string;
}

export interface IDetailItem {
  itemType: string;
  title: string;
  serviceTypeItems: IServiceItem[];
}

export interface IServiceItemsSet {
  audio?: IServiceItem[];
  conferencing?: IServiceItem[];
  storage?: IServiceItem[];
  cmr?: IServiceItem[];
}

export class ProvisioningDetailsController {

  public order: IOrder;
  public selectedSite: any;
  public dateInfo: string = '';
  public isLoading: boolean = false;
  public status = Status;
  public isShowRaw = false;
  public orderContent;
  public maxLength = 500;
  public form: ng.IFormController;
  private featureToggleFlag: boolean;
  public customerInfo = {
    customerName: '-',
    customerEmail: '-',
    partnerName: '-',
    partnerEmail: '-',
  };

  public items: {
    audio?: IDetailItem,
    conferencing?: IDetailItem,
    storage?: IDetailItem,
    cmr?: IDetailItem,

  };

  public notes: string;
  private serviceItems: IServiceItemsSet;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private $q: ng.IQService,
    private Notification: Notification,
    private ProvisioningService: ProvisioningService,
    private FeatureToggleService: FeatureToggleService ) {
    this.order = this.$stateParams.order;
    this.items = {};
    this.notes = _.get(this.order, 'note');
    this.init();
  }

  private makeItem(itemType: string): IDetailItem | undefined {
    if (!this.serviceItems[itemType]) {
      return undefined;
    }
    return {
      itemType: itemType,
      title: 'provisioningConsole.details.' + itemType + '.general',
      serviceTypeItems: this.serviceItems[itemType],
    };
  }

  private populateCustomer(orderContent) {
    this.customerInfo.customerName = _.get(orderContent, 'common.customerInfo.endCustomerInfo.name', '-');
    this.customerInfo.customerEmail = _.get(orderContent, 'common.customerInfo.endCustomerInfo.adminDetails.emailId', '-');
    this.customerInfo.partnerName = _.get(orderContent, 'common.customerInfo.partnerInfo.name', '-');
    this.customerInfo.partnerEmail = _.get(orderContent, 'common.customerInfo.partnerInfo.adminDetails.emailId', '-');
  }

  private init(): void {
    this.isLoading = true;
    this.dateInfo  = (this.order.status !== Status.COMPLETED) ? this.order.orderReceived : this.order.lastModified;
    this.ProvisioningService.getOrder(this.order.orderUUID).then((orderDetail) => {
      this.isLoading = false;
      const orderContent = JSON.parse(orderDetail.orderContent || '{}');
      this.orderContent = orderContent;
      this.populateCustomer(orderContent);
      if (_.has(orderContent , 'collabServiceInfoCommon.site')) {
        this.selectedSite = _.find(orderContent.collabServiceInfoCommon.site, (site) => {
          return site.siteUrl === this.order.siteUrl;
        });
      }

      this.serviceItems = this.getServiceItemsForSite(orderContent.serviceItems);
      if (this.serviceItems) {
        this.items.audio = this.makeItem('audio');
        this.items.conferencing = this.makeItem('conferencing');
        this.items.storage = this.makeItem('storage');
        this.items.cmr = this.makeItem('cmr');
      }
    })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private getServiceItemsForType<T extends IServiceItem>(serviceItems: T[]): T[] {
    if (serviceItems) {
      return _.filter(serviceItems, (item) => {
        return !item.siteUrl || item.siteUrl === this.order.siteUrl;
      });
    } else {
      return [];
    }
  }

  public getManualCode(code) {
    return this.$translate.instant('provisioningConsole.manualCodes.' + code);
  }

  /*
   * Group service items by category and site.
   */
  public getServiceItemsForSite(serviceItems): IServiceItemsSet {
    const result: IServiceItemsSet = {};
    //If there are service items, group them.
    if (serviceItems) {
      result.audio = this.getServiceItemsForType(serviceItems.audio);
      result.conferencing = this.getServiceItemsForType(serviceItems.conferencing);
      result.storage = this.getServiceItemsForType(serviceItems.storage);
      result.cmr = this.getServiceItemsForType(serviceItems.cmr);
    }
    return result;
  }

   /*
  * Move an order between pending, in progress and completed.
  */
  public moveTo(order, newStatus: Status): void {
    this.isLoading = true;
    const userName = this.Authinfo.getUserName();
    this.$q.all (
      {updateOrderPromise: this.ProvisioningService.updateOrderStatus<{status: string}>(order, newStatus, userName ),
        featureTogglePromise: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasWebexProvisioningConsole) })
      .then( promises => {
        this.featureToggleFlag = promises.featureTogglePromise;
        const result: any = promises.updateOrderPromise;
        if (result) {
          this.order.status = newStatus;
          if (this.featureToggleFlag) {
            if (newStatus === Status.PENDING || newStatus === Status.PROGRESS) {
              this.order.assignedTo = result.assignedTo;
            } else if ( newStatus === Status.COMPLETED ) {
              this.order.completedBy = result.assignedTo;
              this.order.queueCompleted = result.queueCompleted;
            }
          }
        }
        this.$rootScope.$broadcast(STATUS_UPDATE_EVENT_NAME, order);
      })
      .catch((error) => {
        this.Notification.errorResponse(error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  //US30084 - Changes For Notes/Comments
  public onSave(note: string): void {
    this.ProvisioningService.saveNote(this.order.postProvisioningUUID, note).then((response) => {
      if (response.status === 200) {
        this.Notification.success('provisioningConsole.details.notes.noteSaved', response.data);
      } else {
        this.Notification.errorResponse(response, 'provisioningConsole.details.notes.failedSaving');
      }
    },
);
    this.$stateParams.order.note = this.notes;
    this.form.$setPristine();
  }

  public reset() {
    this.notes = this.$stateParams.order.note;
    this.form.$setPristine();
  }

}
