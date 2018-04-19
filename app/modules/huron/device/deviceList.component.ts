import { IActionItem } from '../../core/components/sectionTitle/sectionTitle.component';

class DeviceList implements ng.IComponentController {
  private static CISCO_SPARK_VOICE = 'Cisco Spark Voice';
  private static CISCO_SPARK_SHARE = 'Cisco Spark Share';
  private static CISCO_WEBEX_VOICE = 'Cisco Webex Voice';
  private static CISCO_WEBEX_SHARE = 'Cisco Webex Share';

  public ownerType: string;
  public deviceList: any;
  public devicesLoaded: ng.IPromise<any>;
  public placeType: string;
  public onGenerateFn: Function;
  public onShowDeviceDetailFn: Function;
  public actionList: IActionItem[];
  public showActions: boolean = false;
  public showGenerateButton: boolean = false;
  public showMultipleDeviceWarning: boolean = false;
  private csdmMultipleDevicesPerPlaceFeature: boolean = false;
  public generateCodeText: string;
  public generateCodeIsDisabled: boolean = true;

  /* @ngInject */
  constructor(private $translate: ng.translate.ITranslateService,
              private FeatureToggleService,
              private $modal) {}

  public $onInit(): void {
    if (this.ownerType === 'place') {
      this.generateCodeText = this.$translate.instant('usersPreview.generateActivationCodeTextPlace');
    } else {
      this.generateCodeText = this.$translate.instant('usersPreview.generateActivationCodeText');
    }
    this.FeatureToggleService.csdmMultipleDevicesPerPlaceGetStatus().then(feature => {
      this.csdmMultipleDevicesPerPlaceFeature = feature;
    }).finally(() => {
      this.generateCodeIsDisabled = false;
    });

    this.initActions();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { deviceList } = changes;
    if (this.devicesLoaded) {
      this.devicesLoaded.then(() => {
        this.showCorrectElements(deviceList.currentValue);
      });
    } else {
      this.showCorrectElements(deviceList.currentValue);
    }
  }

  public showCorrectElements(deviceList): void {
    this.showGenerateButton = _.size(deviceList) === 0;
    this.showActions = (this.ownerType === 'user'
      || this.placeType === 'huron'
      || this.csdmMultipleDevicesPerPlaceFeature)
      && !this.showGenerateButton;
    this.showMultipleDeviceWarning = this.ownerType === 'place'
      && _.size(deviceList) > 1
      && this.placeType === 'cloudberry'
      && !DeviceList.listHasExactlyOneSparkVoiceAndOneSparkShare(deviceList);
  }

  private static listHasExactlyOneSparkVoiceAndOneSparkShare(deviceList): boolean {
    return _.size(deviceList) === 2
      && _
        .chain(deviceList)
        .map('product')
        .map(product => {
          if (product === DeviceList.CISCO_SPARK_VOICE) {
            return DeviceList.CISCO_WEBEX_VOICE;
          }
          if (product === DeviceList.CISCO_SPARK_SHARE) {
            return DeviceList.CISCO_WEBEX_SHARE;
          }
          return product;
        })
        .intersection([DeviceList.CISCO_WEBEX_VOICE, DeviceList.CISCO_WEBEX_SHARE])
        .size()
        .value() === 2;
  }

  public onGenerateCode(): void {
    if (this.placeType === 'cloudberry' && this.csdmMultipleDevicesPerPlaceFeature) {
      this.$modal.open({
        type: 'dialog',
        template: require('modules/huron/device/multipleDevicesConfirm.tpl.html'),
      }).result.then(() => {
        this.onGenerateFn();
      });
    } else {
      this.onGenerateFn();
    }
  }

  public onShowDeviceDetail(device): void {
    this.onShowDeviceDetailFn({
      device: device,
    });
  }

  private initActions(): void {
    this.actionList = [{
      actionKey: 'usersPreview.generateActivationCode',
      actionFunction: () => {
        this.onGenerateCode();
      },
    }];
  }
}

export class DeviceListComponent implements ng.IComponentOptions {
  public controller = DeviceList;
  public template = require('modules/huron/device/deviceList.html');
  public bindings = <{ [binding: string]: string }>{
    ownerType: '@',
    deviceList: '<',
    devicesLoaded: '<',
    placeType: '<',
    onGenerateFn: '&',
    onShowDeviceDetailFn: '&',
  };
}
