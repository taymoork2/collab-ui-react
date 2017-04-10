import { TelephonyDomainService } from '../telephonyDomain.service';
import { Notification } from '../../../core/notifications/notification.service';

class GmTdModalRequestCtrl implements ng.IComponentController {

  public data: any = {};
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
    this.data.region = this.selected;
    this.gemService.setStorage('currentTelephonyDomain', this.data); // TODO, in next state , get the currentTelephonyDomain
    // TODO, go to next state -- do next
  }
}

export class GmTdModalRequestComponent implements ng.IComponentOptions {
  public bindings = { dismiss: '&' };
  public controller = GmTdModalRequestCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdModalRequest.html';
}
