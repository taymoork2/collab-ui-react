import { Notification } from 'modules/core/notifications';

class GmTdHeaderCtrl implements ng.IComponentController {
  public model: any;
  public tdBaseInfo: any;
  public remedyTicket: any;
  public customerId: string;
  public ccaDomainId: string;
  public showRemedyTicket: boolean;
  public remedyTicketLoading: boolean = true;

  /* @ngInject */
  public constructor(
    private gemService,
    private $window: ng.IWindowService,
    private Notification: Notification,
  ) {
    this.model = this.tdBaseInfo;
    if (this.model) {
      this.customerId = this.model.customerId;
      this.ccaDomainId = this.model.ccaDomainId;
    }
  }

  public $onInit() {
    if (this.showRemedyTicket) {
      this.getRemedyTicket();
    }
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (changes.tdBaseInfo) {
      this.model = this.tdBaseInfo;
    }
  }

  private getRemedyTicket() {
    this.remedyTicket = this.gemService.getStorage('remedyTicket');
    if (this.remedyTicket) {
      this.remedyTicketLoading = false;
      return;
    }

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

}

export class GmTdHeaderComponent implements ng.IComponentOptions {
  public bindings = { showRemedyTicket: '<', tdBaseInfo: '<' };
  public controller = GmTdHeaderCtrl;
  public template = require('modules/gemini/telephonyDomain/details/gmTdHeader.tpl.html');
}
