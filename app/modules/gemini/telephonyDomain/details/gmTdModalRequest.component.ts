import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmTdModalRequestCtrl implements ng.IComponentController {

  private close;
  public data: any = {};
  public messages: Object;
  public selectPlaceholder: string;
  public options: Array<Object> = [];
  public selected = { label: '', value: '' };

  /* @ngInject */
  public constructor(
    private gemService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.selectPlaceholder = this.$translate.instant('gemini.tds.request.selectPlaceholder');
  }

  public $onInit() {
    this.getRegions();
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
      maxlength: this.$translate.instant('gemini.tds.request.customerNameLengthError'),
    };
  }

  public getRegions() {
    this.TelephonyDomainService.getRegions()
      .then((res) => {
        let optionsSource: any = _.get(res, 'content.data.body');
        this.options = _.map(optionsSource, (item: any) => {
          return { value: item.regionId, label: item.regionName };
        });
      })
      .catch((res) => {
        this.Notification.errorResponse(res, 'error'); // TODO, wording
      });
  }

  public onNext() {
    this.data.action = 'newAdd';
    this.data.customerId = this.gemService.getStorage('gmCustomerId');
    this.data.region = { regionId: this.selected.value, regionName: this.selected.label };

    this.gemService.setStorage('currentTelephonyDomain', this.data);
    this.gemService.setStorage('panelTitle', this.data.customerName);

    this.close();
  }
}

export class GmTdModalRequestComponent implements ng.IComponentOptions {
  public bindings = { dismiss: '&', close: '&' };
  public controller = GmTdModalRequestCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdModalRequest.html';
}
