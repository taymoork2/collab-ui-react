import { FtswConfigService, Site, RialtoService, RialtoCustomer, RialtoSite, BsftOrder, RialtoOrderService, IPortedNumber } from 'modules/call/bsft/shared';
import { Notification } from 'modules/core/notifications';
import { RialtoOrder } from 'modules/call/bsft/shared/bsft-rialto-order';

class BsftAssignNumberCtrl implements ng.IComponentController {
  public isFtsw: boolean;
  public mainNumber: string;
  public vmNumber: string;
  public onChangeFn: Function;
  public modalInvalid: Function;
  public site: Site;
  public messages: any = {};
  public numberOptions: string[] = [];
  public currentOptions: string[] = [];
  public ftsw: boolean;
  public form: ng.IFormController;
  public bsftOrder: BsftOrder;
  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private FtswConfigService: FtswConfigService,
    private RialtoService: RialtoService,
    private RialtoOrderService: RialtoOrderService,
    private Notification: Notification,
    private Authinfo,
  ) {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
  }

  public $onInit() {
    this.numberOptions = [];

    const currentSite = this.FtswConfigService.getCurentSite();
    if (currentSite !== undefined) {
      this.site = currentSite;
    }

    this.initComponentData();
    this.$scope.$watch(() => {
      return _.get(this.form, '$invalid');
    }, invalid => {
      if (this.ftsw) {
        this.$scope.$emit('wizardNextButtonDisable', !!invalid);
      } else {
        this.modalInvalid({
          invalid: !!invalid,
        });
      }
    });

    if (this.ftsw) {
      this.$scope.$emit('wizardNextText', 'saveLocation');
    } else {
      this.$scope.$on('bsftAssignNumberNext', () => this.assignNumberBsftNext());
    }
  }

  private initComponentData() {
    if (!_.isUndefined(this.site)) {
      this.bsftOrder = this.FtswConfigService.getOrder(this.site.uuid);
      const nums: IPortedNumber[] = _.get(this.bsftOrder, 'portedNumbers');
      if (!_.isEmpty(nums)) {
        //existing order
        this.numberOptions = _.map(nums, num => _.get(num.portingNumber.telephoneNumber, 'e164'));
      }
      this.mainNumber = _.get(this.bsftOrder, 'mainNumber');
      this.vmNumber = _.get(this.bsftOrder, 'vmNumber');
      this.currentOptions = _.clone(this.numberOptions);
    }
  }

  public onChangeNumber(number): void {
    if (!_.isUndefined(this.vmNumber)) {
      this.numberOptions = _.filter(this.currentOptions, opt => opt !== this.vmNumber);
    }
    this.mainNumber = number;
    this.numberOptions = _.filter(this.currentOptions, opt => opt !== this.mainNumber);
  }

  public onChangeVmNumber(number): void {
    if (!_.isUndefined(this.mainNumber)) {
      this.numberOptions = _.filter(this.currentOptions, opt => opt !== this.mainNumber);
    }
    this.vmNumber = number;
    this.numberOptions = _.filter(this.currentOptions, opt => opt !== this.vmNumber);
  }

  public assignNumberBsftNext() {
    this.FtswConfigService.addSite(this.site);
    this.FtswConfigService.assignNumbers(this.site.uuid, this.mainNumber, this.vmNumber);
    let customerRialtoId: string;
    let siteRialtoId: string;
    let order: RialtoOrder = this.RialtoOrderService.initRialtoOrder(this.site, this.bsftOrder);

    if (this.ftsw) {
      return this.RialtoService.saveCustomer(new RialtoCustomer(this.Authinfo.getOrgId(), this.Authinfo.getOrgName(), this.site))
        .then(response => {
          customerRialtoId = response.rialtoId;
          return this.RialtoService.saveSite(customerRialtoId, new RialtoSite(this.site));
        })
        .then(response => {
          if (response && response.status.type === 'success') {
            this.Notification.success(response.status.message);
            siteRialtoId = response.rialtoId;
            //Post First NEW Order with VM and Main Number
            return this.RialtoService.saveOrder(customerRialtoId, siteRialtoId, order);
          } else {
            this.Notification.error(response.status.message);
          }
        })
        .then(() => {
          //ADD Order for Licenses and Previously Ported Numbers
          const portedNumbers: IPortedNumber[] = this.RialtoOrderService.getOrderPortedNumbers(this.bsftOrder, true);
          order = this.RialtoOrderService.initAddRialtoOrder(this.site, portedNumbers);
          return this.RialtoService.saveOrder(customerRialtoId, siteRialtoId, order);
          // TO_DO Order BSFT Ported Numbers as btnumber is still pending
          //   portedNumbers = this.RialtoOrderService.getOrderPortedNumbers(this.bsftOrder, false);
          //   if (!_.isUndefined(portedNumbers) && portedNumbers && portedNumbers.length) {
          //     order = this.RialtoOrderService.initAddRialtoOrder(this.site, portedNumbers);
          //   }
          //   promises.push(this.RialtoService.saveOrder(customerRialtoId, siteRialtoId, order));
          //   return this.$q.all(promises)
          //     .then(() => this.Notification.success('Order successfully created'))
          //     .catch(() => this.Notification.error('failed creating order'));
          // });
        }).catch((response) => this.Notification.error(response.status.message));
    } else {
      this.FtswConfigService.setCurrentSite(this.site);
    }
  }
}

export class BsftAssignNumberComponent implements ng.IComponentOptions {
  public controller = BsftAssignNumberCtrl;
  public template = require('./bsft-assign-number.component.html');
  public bindings = {
    ftsw: '<',
    mainNumber: '<',
    vmNumber: '<',
    modalInvalid: '&?',
  };
}
