import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmTdHistories implements ng.IComponentController {
  private _getDataFromHttp: boolean = true;
  private static readonly NOTE_ACTION: string = 'add_notes_td';
  private static readonly HISTORY_ACTION_FOR: string = 'Telephony Domain';

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
      objectId: this.domainName,
      customerId: this.customerId,
      actionFor: GmTdHistories.HISTORY_ACTION_FOR,
    };

    this.isLoading = true;
    this.TelephonyDomainService.getHistories(data)
      .then((res: any[]) => {
        _.remove(res, (item: any): boolean => {
          return item.action === GmTdHistories.NOTE_ACTION;
        });

        this.model = _.map(res, (item) => {
          if (_.includes(item.action, 'site')) {
            const moveSiteMsg = item.siteID + ' ' + this.$translate.instant('gemini.cbgs.moveFrom') + ' ' + item.objectID + ' to ' + item.objectName;
            item.objectName = '';
            item.moveSiteMsg = moveSiteMsg;
            item.action = this.$translate.instant('gemini.cbgs.siteMoved');
          }
          item.action = _.upperFirst(item.action);
          return item;
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
  public template = require('modules/gemini/telephonyDomain/details/gmTdHistories.tpl.html');
}
