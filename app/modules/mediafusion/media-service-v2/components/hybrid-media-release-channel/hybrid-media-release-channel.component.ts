import { Notification } from 'modules/core/notifications';

interface ISelectOption {
  label: string;
  value: string;
}

class HybridMediaReleaseChannelController implements ng.IComponentController {

  private onReleaseChannelUpdate: Function;
  public static restrictedChannels: string[] = ['beta', 'alpha', 'latest'];
  public releaseChannelSelected: ISelectOption;
  public releaseChannelOptions: ISelectOption[] = [{
    label: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
    value: 'stable',
  }];
  public releaseChannelTexts: any = {
    title: 'hercules.releaseChannelSection.releaseChannelHeader',
  };

  /* @ngInject */
  constructor(
    //private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private ResourceGroupService,
  ) {}

  public onInit() {
    this.populateReleaseChannelOptions()
    .then(() => {
      this.releaseChannelSelected = this.releaseChannelOptions[0];
    });
    /*this.$scope.$watch(() => {
      return this.releaseChannelSelected;
    }, (newValue, oldValue) => {
      if (_.isEmpty(oldValue) || newValue === oldValue) {
        return;
      }
    if (_.isFunction(this.onReleaseChannelUpdate)) {
      this.onReleaseChannelUpdate({ someData: { releaseChannel: this.releaseChannelSelected } });
    } else {
      this.onReleaseChannelUpdate({ someData: { releaseChannel: this.releaseChannelSelected } });
    }*/
    //}, true);
  }

  private populateReleaseChannelOptions() {
    this.releaseChannelOptions = [{
      label: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
      value: 'stable',
    }];
    return this.ResourceGroupService.getAllowedChannels()
      .then(channels => {
        _.forEach(HybridMediaReleaseChannelController.restrictedChannels, restrictedChannel => {
          if (_.includes(channels, restrictedChannel)) {
            this.releaseChannelOptions.push({
              label: this.$translate.instant(`hercules.fusion.add-resource-group.release-channel.${restrictedChannel}`),
              value: restrictedChannel,
            });
          }
        });
      })
      .catch(error => this.Notification.errorWithTrackingId(error, 'hercules.genericFailure'));
  }

  public releaseChannelChanged() {
    //send this this.releaseChannelSelected to the controller
    if (_.isFunction(this.onReleaseChannelUpdate)) {
      this.onReleaseChannelUpdate({ someData: { releaseChannel: this.releaseChannelSelected } });
    } else {
      this.onReleaseChannelUpdate({ someData: { releaseChannel: this.releaseChannelSelected } });
    }
    //return this.releaseChannelSelected;
  }
}

export class HybridMediaReleaseChannelComponent implements ng.IComponentOptions {
  public controller = HybridMediaReleaseChannelController;
  public template = require('modules/mediafusion/media-service-v2/components/hybrid-media-release-channel/hybrid-media-release-channel.tpl.html');
  public bindings = {
    onReleaseChannelUpdate: '&?',
  };
}
