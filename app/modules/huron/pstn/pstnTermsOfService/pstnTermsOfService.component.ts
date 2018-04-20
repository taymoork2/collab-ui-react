import { PSTN_TOS_ACCEPT } from './pstnTermsOfService.const';
import {
  PstnCarrier,
  PstnProvidersService,
} from '../pstnProviders';
import { PstnModel } from '../pstn.model';
import { PstnService } from '../pstn.service';
import { Notification } from 'modules/core/notifications/notification.service';


const CC_CANADA = 'CA';
const THINKTEL = 'THINKTEL';
const SUCCESS = 200;

interface IOrganization {
  id: string; //UUID
  countryCode: string;
}

export class PstnTermsOfServiceComponent implements ng.IComponentOptions {
  public controller = PstnTermsOfServiceCtrl;
  public template = require('modules/huron/pstn/pstnTermsOfService/pstnTermsOfService.html');
  public bindings = {
    onDismiss: '&',
  };
}

export class PstnTermsOfServiceCtrl implements ng.IComponentController {
  public firstName: string = '';
  public lastName: string = '';
  public email: string = '';
  public tosAccepted: boolean = true;
  public pstnCarriers: PstnCarrier[] = [];
  public carrier: PstnCarrier = new PstnCarrier();
  public isTrial: boolean = false;
  public loading: boolean = false;
  public initComplete: boolean = false;
  public tosUrl: string = '';
  public showCanadaThinkTelLegal: boolean = false;
  public orgData: IOrganization;

  private onDismiss: Function;

  /* @ngInject */
  constructor(
    public PstnModel: PstnModel,
    private Orgservice,
    private PstnService: PstnService,
    private PstnProvidersService: PstnProvidersService,
    private $rootScope: ng.IRootScopeService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    const params = {
      basicInfo: true,
    };
    this.PstnProvidersService.getCarriersStatic().then((carriers: PstnCarrier[]) => {
      this.pstnCarriers = carriers;
      this.Orgservice.getOrg(
        (data, status) => {
          if (status === SUCCESS) {
            this.orgData = data;
            this.getToSInfo();
          }
        }, null, params);
    });
  }

  public onAgreeClick(): void {
    this.loading = true;
    this.PstnService.setCustomerTrialV2(this.orgData.id, this.firstName, this.lastName, this.email)
      .then(() => {
        this.$rootScope.$broadcast(PSTN_TOS_ACCEPT);
        this.onDismiss();
      }).catch(response => this.Notification.errorResponse(response))
      .finally(() => this.loading = false);
  }

  public onDismissClick(): void {
    this.onDismiss();
  }

  private getToSInfo(): void {
    this.PstnService.getCustomerV2(this.orgData.id).then((customer) => {
      if (customer.trial) {
        const carriers = [{ uuid: customer.pstnCarrierId }];
        this.isTrial = true;
        this.PstnService.getCarrierDetails(carriers).then((carrier) => {
          this.loadCarrier(carrier[0]);
          this.initComplete = true;
        });
        this.PstnService.getCustomerTrialV2(this.orgData.id).then((trial) => {
          if (_.has(trial, 'termsOfServiceUrl')) {
            this.tosUrl = <string>_.get(trial, 'termsOfServiceUrl');
          }
        });
      }
    });
  }

  private loadCarrier(carrier): void {
    for (let i = 0; i < this.pstnCarriers.length; i++) {
      if (this.pstnCarriers[i].name === carrier.vendor) {
        this.carrier = this.pstnCarriers[i];
        if (this.carrier.name === THINKTEL) {
          if (this.orgData.countryCode && this.orgData.countryCode === CC_CANADA) {
            this.showCanadaThinkTelLegal = true;
          }
        }
        break;
      }
    }
  }

}
