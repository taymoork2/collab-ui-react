import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmTdHistories implements ng.IComponentController {
  private _getDataFromHttp: boolean = true;
  private static readonly HISTORY_ACTION: string = 'add_notes_td';
  private static readonly HISTORY_ACTION_MOVE_SITE: string = 'Edit_td_move_site';

  public model: any[] = [];
  public domainName: string;
  public customerId: string;
  public ccaDomainId: string;
  public displayCount: number = 5;
  public isLoaded: boolean = false;
  public isLoading: boolean = false;
  public isCollapsed: boolean = true;

  /* @ngInject */
  public constructor(
    private gemService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    const currentTD = this.gemService.getStorage('currentTelephonyDomain');
    this.domainName = currentTD.domainName;
    this.customerId = currentTD.customerId;
    this.ccaDomainId = currentTD.ccaDomainId;

    this.model = this.gemService.getStorage('currentTdHistories');
    if (this.model && this.model.length) {
      this._getDataFromHttp = false;
    }
  }

  public onCollapse(): void {
    this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed && !this.isLoaded) {
      this.getHistories();
    }
  }

  public onShowAll(): void {
    this.displayCount = this.model.length;
  }

  private getHistories() {
    if (!this._getDataFromHttp) {
      return;
    }

    const data = {
      siteId: this.ccaDomainId,
      objectID: this.domainName,
      customerId: this.customerId,
      actionFor: 'Telephony Domain',
    };

    this.isLoading = true;
    this.TelephonyDomainService.getHistories(data)
      .then((res) => {
        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error('gemini.errorCode.loadError');
          return;
        }

        let data: any[] = _.get(res, 'content.data.body', []);

        data = _.filter(data, (item: any): boolean => {
          return item.action !== GmTdHistories.HISTORY_ACTION;
        });

        this.model = _.map(data, (item) => {
          const formattedItem = _.assignIn({}, item, {
            action: _.upperFirst(item.action),
          });

          if (item.action === GmTdHistories.HISTORY_ACTION_MOVE_SITE) {
            const moveSiteMsg = item.siteID + ' ' + this.$translate.instant('gemini.cbgs.moveFrom') + ' ' + item.objectID
              + ' to ' + item.objectName;
            formattedItem.objectName = '';
            formattedItem.moveSiteMsg = moveSiteMsg;
            formattedItem.action = this.$translate.instant('gemini.cbgs.siteMoved');
          }
          return formattedItem;
        });

        this.isLoaded = true;
        this.isLoading = false;
      }).catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }
}

export class GmTdHistoriesComponent implements ng.IComponentOptions {
  public controller = GmTdHistories;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdHistories.tpl.html';
}
