import { TelephonyDomainService } from '../telephonyDomain.service';
import { Notification } from '../../../core/notifications/notification.service';

class GmtdDetails implements ng.IComponentController {

  public model;
  public remedyTicket;
  public customerId: string;
  public ccaDomainId: string;
  public domainName: string;
  public notes: any[] = [];
  public allHistories: any[] = [];
  public histories: any[] = [];
  public hisLoading: boolean = true;
  public isShowAllHistories: boolean = false;
  public showHistoriesNum: number = 5;
  public loading: boolean = true;
  public remedyTicketLoading: boolean = true;
  /* @ngInject */
  public constructor(
    private gemService,
    private $scope: ng.IScope,
    private $rootScope: ng.IRootScopeService,
    private Notification: Notification,
    private $window: ng.IWindowService,
    private $state: ng.ui.IStateService,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.customerId = _.get(this.$stateParams, 'info.customerId', '');
    this.ccaDomainId = _.get(this.$stateParams, 'info.ccaDomainId', '');
    this.domainName = _.get(this.$stateParams, 'info.domainName', '');
  }

  public $onInit(): void {
    let deregister = this.$rootScope.$on('refreshNotes', (event, data) => {
      this.notes = data || event;
    });
    this.$scope.$on('$destroy', deregister);

    this.getDetails();
    this.getNotes();
    this.getHistories();
    this.getRemedyTicket();
    this.$state.current.data.displayName = this.$translate.instant('gemini.cbgs.overview');
  }

  private getDetails() {
    this.TelephonyDomainService.getTelephonyDomain(this.customerId, this.ccaDomainId)
      .then((res) => {
        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error('error'); //TODO Wording
          return;
        }

        this.model = _.get(res, 'content.data.body');
        this.model.totalSites = this.model.telephonyDomainSites.length;
        this.model.status_ = (this.model.status ? this.$translate.instant('gemini.cbgs.field.status.' + this.model.status) : '');
        _.forEach(this.model.telephonyNumberList, (item) => {
          this.getToll(item);
        });

        this.loading = false;
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  private getRemedyTicket() {
    let type = 7;
    this.gemService.getRemedyTicket(this.customerId, type)
      .then((res) => {
        let resArr: any = _.filter(_.get(res, 'content.data'), (item: any) => {
          return item.description === this.ccaDomainId;
        });
        let remedyTicket: any = _.first(resArr);
        remedyTicket.createTime = moment(remedyTicket.createTime).toDate().toString();

        this.remedyTicket = remedyTicket;
        this.remedyTicketLoading = false;
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  public onOpenRemedyTicket() {
    this.$window.open(this.remedyTicket.ticketUrl, '_blank');
  }

  public onShowAllHistories(): void {
    this.histories = this.allHistories;
    this.isShowAllHistories = false;
  }

  private getNotes() {
    this.TelephonyDomainService.getNotes(this.customerId, this.ccaDomainId)
      .then((res) => {
        this.loading = false;

        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error('error'); //TODO Wording
          return;
        }
        this.notes = _.get(res, 'content.data.body', []);
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  private getHistories() {
    this.TelephonyDomainService.getHistories(this.customerId, this.ccaDomainId, this.domainName)
      .then((res) => {
        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error('error'); //TODO Wording
          return;
        }
        this.hisLoading = false;
        this.allHistories = _.get(res, 'content.data.body', []);
        _.forEach(this.allHistories, (item) => {
          item.action = _.upperFirst(item.action);

          if (item.action === 'Submit_td_move_site') {
            let moveSiteMsg = item.siteID + ' ' + this.$translate.instant('gemini.cbgs.moveFrom') + ' ' + item.objectName + ' to ' + item.objectID;
            item.objectName = '';
            item.moveSiteMsg = moveSiteMsg;
            item.action = this.$translate.instant('gemini.cbgs.siteMoved');
          }
        });
        this.histories = (_.size(this.allHistories) <= this.showHistoriesNum ? this.allHistories : _.slice(this.allHistories, 0, this.showHistoriesNum));
        this.isShowAllHistories = (_.size(this.allHistories) > this.showHistoriesNum);
      }).catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  private getToll(item) {
    if (item.defaultNumber === '1' && item.tollType === 'CCA Toll') {
      this.model.defaultToll = {
        phone: item.phone,
        label: item.label,
      };
    }

    if (item.defaultNumber === '1' && item.tollType === 'CCA Toll Free') {
      this.model.defaultTollFree = {
        phone: item.phone,
        label: item.label,
      };
    }
  }
}

export class GmTdDetailsComponent implements ng.IComponentOptions {
  public controller = GmtdDetails;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdDetails.html';
}
