import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

const HISTORY_ACTION: string = 'add_notes_td';
const HISTORY_ACTION_MOVE_SITE: string = 'Edit_td_move_site';

class GmTdHistories implements ng.IComponentController {
  private _model;
  private _displayCount: number = 5;
  private _getDataFromHttp: boolean = true;

  public model;
  public domainName: string;
  public customerId: string;
  public ccaDomainId: string;
  public isLoaded: boolean = false;
  public isLoading: boolean = false;
  public isCollapsed: boolean = true;
  public needToShowAll: boolean = false;

  /* @ngInject */
  public constructor(
    private gemService,
    private $stateParams,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    let currentTD = this.gemService.getStorage('currentTelephonyDomain');
    this.domainName = currentTD.domainName;
    this.customerId = currentTD.customerId;
    this.ccaDomainId = currentTD.ccaDomainId;

    if (_.has(this.$stateParams, 'info.histories')) {
      this._model = _.get(this.$stateParams, 'info.histories', []);
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
    if (this.needToShowAll) {
      this.model = this._model;
      this.needToShowAll = false;
    }
  }

  public setModel(): void {
    this.model = _.size(this._model) <= this._displayCount
      ? this._model
      : _.slice(this._model, 0, this._displayCount);
    this.needToShowAll = (_.size(this._model) > this._displayCount);
  }

  private getHistories() {
    if (!this._getDataFromHttp) {
      this.setModel();
      return;
    }

    this.isLoading = true;
    this.TelephonyDomainService.getHistories(this.customerId, this.ccaDomainId, this.domainName)
      .then((res) => {
        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error('error'); //TODO Wording
          return;
        }
        this._model = _.get(res, 'content.data.body', []);

        this._model = _.filter(this._model, (item: any) : boolean => {
          return item.action !== HISTORY_ACTION;
        });
        _.forEach(this._model, (item) => {
          item.action = _.upperFirst(item.action);

          if (item.action === HISTORY_ACTION_MOVE_SITE) {
            let moveSiteMsg = item.siteID + ' ' + this.$translate.instant('gemini.cbgs.moveFrom') + ' ' + item.objectID + ' to ' + item.objectName;
            item.objectName = '';
            item.moveSiteMsg = moveSiteMsg;
            item.action = this.$translate.instant('gemini.cbgs.siteMoved');
          }
        });
        this.setModel();
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
