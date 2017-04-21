import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

const DISPLAY_NUM = 5;
class GmTdHistories implements ng.IComponentController {
  private static readonly EDIT_TD_MOVE_SITE = 'Edit_td_move_site';

  public model;
  public customerId: string;
  public displayNum: number;
  public ccaDomainId: string;
  public domainName: string;
  public isCollapsed: boolean = true;
  public isLoading: boolean;
  public needToShowAll: boolean = false;

  /* @ngInject */
  public constructor(
    private gemService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    let currentTD = this.gemService.getStorage('currentTelephonyDomain');
    this.customerId = currentTD.customerId;
    this.ccaDomainId = currentTD.ccaDomainId;
    this.domainName = currentTD.domainName;
  }

  public $onInit(): void {
    this.getHistories();
  }

  public onCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  public isShowAll() {
    return this.displayNum > DISPLAY_NUM;
  }

  public onShowAll() {
    this.displayNum = _.size(this.model);
  }

  private getHistories() {
    this.TelephonyDomainService.getHistories(this.customerId, this.ccaDomainId, this.domainName)
      .then((res) => {
        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error('error'); //TODO Wording
          return;
        }
        this.isLoading = false;
        const data = _.get(res, 'content.data.body', []);
        this.model = _.map(data, (item: any) => {
          let newItem = _.assignIn({}, item, { action: _.upperFirst(item.action) });
          if (item.action === GmTdHistories.EDIT_TD_MOVE_SITE) {
            const moveSiteMsg = item.siteID + ' ' + this.$translate.instant('gemini.cbgs.moveFrom') + ' ' + item.objectID + ' to ' + item.objectName;
            newItem.objectName = '';
            newItem.moveSiteMsg = moveSiteMsg;
            newItem.action = this.$translate.instant('gemini.cbgs.siteMoved');
          }
          return newItem;
        });
        this.displayNum = _.size(this.model) <= DISPLAY_NUM ? _.size(this.model) : DISPLAY_NUM;
      }).catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }
}

export class GmTdHistoriesComponent implements ng.IComponentOptions {
  public controller = GmTdHistories;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdHistories.tpl.html';
}
