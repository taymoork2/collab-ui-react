import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmtdDetails implements ng.IComponentController {
  private static readonly NOTE_ACTION: string = 'add_notes_td';
  private static readonly HISTORY_ACTION_FOR: string = 'Telephony Domain';

  public model;
  public remedyTicket;
  public customerId: string;
  public ccaDomainId: string;
  public domainName: string;
  public totalSites: number;
  public tds: any[] = [];
  public notes: any[] = [];
  public isEdit: boolean = false;
  public allHistories: any[] = [];
  public histories: any[] = [];
  public hisLoading: boolean = true;
  public isShowAllHistories: boolean = false;
  public showHistoriesNum: number = 5;
  public loading: boolean = true;
  public remedyTicketLoading: boolean = true;
  public telephonyNumberList: any [] = [];

  /* @ngInject */
  public constructor(
    private $state,
    private $modal,
    private gemService,
    private $scope: ng.IScope,
    private Notification: Notification,
    private $window: ng.IWindowService,
    private $rootScope: ng.IRootScopeService,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.tds = _.get(this.$stateParams, 'info.tds', []);
    this.customerId = _.get(this.$stateParams, 'info.customerId', '');
    this.ccaDomainId = _.get(this.$stateParams, 'info.ccaDomainId', '');
    this.domainName = _.get(this.$stateParams, 'info.domainName', '');
  }

  public $onInit(): void {
    this.getDetails();
    this.getHistories();
    this.getRemedyTicket();
    const deregister = this.$scope.$on('detailWatch', (_event, data) => {
      this.isEdit = data.isEdit;
      this.notes  = data.notes || this.notes;
      this.domainName = data.domainName || this.domainName;
      this.totalSites = data.sitesLength || this.totalSites;
      if (data.isLoadingHistories) {
        this.getHistories();
      }
    });
    this.$scope.$on('$destroy', deregister);
    this.$state.current.data.displayName = this.$translate.instant('gemini.cbgs.overview');
  }

  public onEditTD() {
    const region = this.gemService.getStorage('currentTelephonyDomain').region;

    this.$modal.open({
      type: 'full',
      template: '<gm-td-modal-request dismiss="$dismiss()" close="$close()" class="new-field-modal"></gm-td-modal-request>',
    }).result.then(() => {
      const currentTD = this.gemService.getStorage('currentTelephonyDomain');
      this.domainName = currentTD.domainName || '';

      if (!_.isEqual(region, currentTD.region)) {
        this.$scope.$broadcast('regionUpdated');
      }
    });
  }

  private getDetails() {
    this.TelephonyDomainService.getTelephonyDomain(this.customerId, this.ccaDomainId)
      .then((res) => {
        const DATA_STATUS = this.gemService.getNumberStatus();

        this.model = res;
        this.model.domainName = this.model.telephonyDomainName || this.model.domainName;
        this.domainName = this.model.domainName;
        this.totalSites = this.model.telephonyDomainSites.length;
        this.model.status_ = (this.model.status ? this.$translate.instant('gemini.cbgs.field.status.' + this.model.status) : '');

        this.telephonyNumberList = _.filter(this.model.telephonyNumberList, (item: any) => { return _.toNumber(item.compareToSuperadminPhoneNumberStatus) !== DATA_STATUS.DELETED; });
        _.forEach(this.telephonyNumberList, (item) => {
          this.getToll(item);
        });

        const status = this.model.status;
        const TD_STATUS = this.gemService.getTdStatus();
        this.model.isShowReject = (status === TD_STATUS.REJECTED);
        this.model.isShowCancelSubmission = (this.gemService.isServicePartner() && (status === TD_STATUS.SUBMITTED));
        this.model.isEdit = !(status === TD_STATUS.SUBMITTED || status === TD_STATUS.APPROVED || status === TD_STATUS.FAILED);

        this.loading = false;
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  private getRemedyTicket() {
    const type = 7;
    this.gemService.getRemedyTicket(this.customerId, this.ccaDomainId, type)
      .then((res) => {
        const resArr: any = _.filter(res, (item: any) => {
          return item.description === this.ccaDomainId;
        });
        const remedyTicket: any = _.first(resArr);
        if (remedyTicket) {
          remedyTicket.createTime = moment(remedyTicket.createTime).toDate().toString();
          remedyTicket.status = _.replace(remedyTicket.status, /Cancelled/, 'Canceled');

          this.remedyTicket = remedyTicket;
        }
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      }).finally(() => {
        this.remedyTicketLoading = false;
      });
  }

  public onOpenRemedyTicket() {
    this.$window.open(this.remedyTicket.ticketUrl, '_blank');
  }

  public onShowAllHistories(): void {
    this.histories = this.allHistories;
    this.isShowAllHistories = false;
  }

  private getHistories() {
    const data = {
      siteId: this.ccaDomainId,
      objectId: this.domainName,
      customerId: this.customerId,
      actionFor: GmtdDetails.HISTORY_ACTION_FOR,
    };
    this.TelephonyDomainService.getHistories(data)
      .then((res: any[]) => {
        this.hisLoading = false;
        this.allHistories = res;
        this.notes = _.remove(this.allHistories, (item: any): boolean => {
          return item.action === GmtdDetails.NOTE_ACTION;
        });
        _.forEach(this.allHistories, (item) => {
          if (_.includes(item.action, 'site')) {
            const moveSiteMsg = item.siteID + ' ' + this.$translate.instant('gemini.cbgs.moveFrom') + ' ' + item.objectID + ' to ' + item.objectName;
            item.objectName = '';
            item.moveSiteMsg = moveSiteMsg;
            item.action = this.$translate.instant('gemini.cbgs.siteMoved');
          }
          item.action = _.upperFirst(item.action);
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

  public setButtonStatus(name) {
    this.model['btn' + name + 'Loading'] = !this.model['btn' + name + 'Loading'];
    this.model['btn' + name + 'Disable'] = !this.model['btn' + name + 'Disable'];
  }

  public cancelTDSubmission() {
    this.TelephonyDomainService.cancelTDSubmission(this.customerId, this.ccaDomainId)
      .then(() => {
        this.$state.go('gmTdDetails', { info: {
          customerId: this.customerId,
          ccaDomainId: this.ccaDomainId,
          domainName: this.domainName,
        }});
        this.$rootScope.$emit('tdUpdated');
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        this.setButtonStatus('CancelSubmission');
      });
  }

  public onCancelSubmission() {
    this.$modal.open({
      type: 'dialog',
      template: require('modules/gemini/telephonyDomain/details/cancelSubmissionConfirm.tpl.html'),
    }).result.then(() => {
      this.setButtonStatus('CancelSubmission');
      this.cancelTDSubmission();
    });
  }

  public onSeeAllPhoneNumbers() {
    const data = this.model;
    data.customerId = this.customerId;
    data.ccaDomainId = this.ccaDomainId;
    data.region = data.regionId;
    this.gemService.setStorage('currentTelephonyDomain', data);

    this.gemService.setStorage('remedyTicket', this.remedyTicket);
    this.gemService.setStorage('currentTdNotes', this.notes);
    this.gemService.setStorage('currentTdHistories', this.allHistories);
    this.$state.go('gmTdDetails.gmTdNumbers');
  }
}

export class GmTdDetailsComponent implements ng.IComponentOptions {
  public controller = GmtdDetails;
  public template = require('modules/gemini/telephonyDomain/details/gmTdDetails.html');
}
