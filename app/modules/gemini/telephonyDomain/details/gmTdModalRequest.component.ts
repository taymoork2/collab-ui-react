import { TelephonyDomainService } from '../telephonyDomain.service';
import { Notification } from 'modules/core/notifications';

class GmTdModalRequestCtrl implements ng.IComponentController {

  private close;
  public data: any = {};
  public messages: Object;
  public selectPlaceholder: string;
  public options: Object[] = [];
  public selected = { label: '', value: '' };

  /* @ngInject */
  public constructor(
    private gemService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.selectPlaceholder = this.$translate.instant('gemini.tds.request.selectPlaceholder');
    this.data = this.gemService.getStorage('currentTelephonyDomain');
    const region = this.data.region || this.data.regionName || this.data.regionId || '';
    this.selected = { label: region, value: region };
  }

  public $onInit() {
    this.getRegions();
    this.messages = {
      customerName: {
        required: this.$translate.instant('common.invalidRequired'),
        maxlength: this.$translate.instant('gemini.inputLengthError', { length: 60, field: 'customer name' }),
      },
      partnerName: { maxlength: this.$translate.instant('gemini.inputLengthError', { length: 50, field: 'partner name' }) },
      noteToCiscoTeam: { maxlength: this.$translate.instant('gemini.inputLengthError', { length: 50, field: 'note' }) },
    };
  }

  public getRegions() {
    this.TelephonyDomainService.getRegions()
      .then((res) => {
        this.options = _.map(res, (item: any) => {
          return { value: item.regionId, label: item.regionName };
        });
      })
      .catch((res) => {
        this.Notification.errorResponse(res, 'gemini.errorCode.genericError');
      });
  }

  public onNext() {
    this.data.customerId = this.gemService.getStorage('gmCustomerId');
    this.data.region = this.selected.value;
    this.data.isEdit = true;
    this.gemService.setStorage('currentTelephonyDomain', this.data);

    this.close();
  }
}

export class GmTdModalRequestComponent implements ng.IComponentOptions {
  public bindings = { dismiss: '&', close: '&' };
  public controller = GmTdModalRequestCtrl;
  public template = require('modules/gemini/telephonyDomain/details/gmTdModalRequest.html');
}
