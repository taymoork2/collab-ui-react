import { ProvisioningService } from './../provisioning.service';
import { Status } from './../provisioning.service';
import { DATE_FORMAT } from './../provisioning.service';

export interface IDetailItem {
  itemType: string;
  title: string;
  serviceTypeItems: any[];
}

export class ProvisioningDetailsController {

  public order: any;
  public selectedSite: any;
  public dateInfo: string = '';
  public isLoading: boolean = false;

  public items: {
    audio?: IDetailItem,
    conferencing?: IDetailItem,
    storage?: IDetailItem,
    cmr?: IDetailItem,

  };

  private serviceItems: any;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $stateParams,
    private ProvisioningService: ProvisioningService) {
    this.order = this.$stateParams.order;
    this.items = {};
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

  private init(): void {
    this.isLoading = true;
    const date = (this.order.status !== Status.completed) ? moment(this.order.orderReceived).format(DATE_FORMAT) :
      moment(this.order.lastModified).format(DATE_FORMAT);
    if (this.order.status === Status.pending || this.order.status === Status.completed) {
      this.dateInfo = this.$translate.instant('provisioningConsole.details.pending', {
        orderDate: date,
      });
    } else if (this.order.status === Status.completed) {
      this.dateInfo = this.$translate.instant('provisioningConsole.details.completed', {
        orderDate: date,
      });
    }

    this.ProvisioningService.getOrder(this.order.orderUUID).then((orderDetail) => {
      const orderContent = JSON.parse(orderDetail.orderContent || '');
      this.selectedSite = _.find(orderContent.collabServiceInfoCommon.site, (site) => {
        return site.siteUrl === this.order.siteUrl;
      });

      this.serviceItems = this.getServiceItemsForSite(orderContent.serviceItems);
      if (this.serviceItems) {
        this.items.audio = this.makeItem('audio');
        this.items.conferencing = this.makeItem('conferencing');
        this.items.storage = this.makeItem('storage');
        this.items.cmr = this.makeItem('cmr');
      }
    })
    .finally( () => {
      this.isLoading = false;
    });
  }

  private getServiceItemsForType(serviceItems: any): any {
    if (serviceItems) {
      return _.filter(serviceItems, (item: any) => {
        return !item.siteUrl || item.siteUrl === this.order.siteUrl;
      });
    } else {
      return [];
    }
  }

  /*
   * Group service items by category and site.
   */
  public getServiceItemsForSite(serviceItems) {
    const result = {
      audio: [],
      conferencing: [],
      storage: [],
      cmr: [],
    };
    //If there are service items, group them.
    if (serviceItems) {
      result.audio = this.getServiceItemsForType(serviceItems.audio);
      result.conferencing = this.getServiceItemsForType(serviceItems.conferencing);
      result.storage = this.getServiceItemsForType(serviceItems.storage);
      result.cmr = this.getServiceItemsForType(serviceItems.cmr);
    }
    return result;
  }
}

