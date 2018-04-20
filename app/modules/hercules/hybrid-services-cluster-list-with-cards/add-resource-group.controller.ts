import './add-resource-group-modal.scss';

import { Notification } from 'modules/core/notifications';
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';
import { KeyCodes } from 'modules/core/accessibility';

export class AddResourceGroupController {
  public creating = false;
  public name = '';
  public releaseChannel = 'stable';
  public _translation = {
    name: {
      placeholder: this.$translate.instant('hercules.fusion.add-resource-group.name.placeholder'),
    },
    releaseChannel: {
      stable: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
      stableHelpText: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.stableHelpText'),
      beta: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.beta'),
      betaHelpText: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.betaHelpText'),
      alpha: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.alpha'),
      alphaHelpText: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.alphaHelpText'),
      latest: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.latest'),
      latestHelpText: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.latestHelpText'),
    },
  };
  public minlength = 1;
  public validationMessages = {
    required: this.$translate.instant('common.invalidRequired'),
    minlength: this.$translate.instant('common.invalidMinLength', {
      min: this.minlength,
    }),
  };
  public allowedChannels: string[] = [];

  /* @ngInject */
  constructor(
    private $modalInstance: ng.ui.bootstrap.IModalInstanceService,
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private ResourceGroupService: ResourceGroupService,
  ) {
    this.getAvailableReleaseChannels();
  }

  public createResourceGroup() {
    this.creating = true;
    this.ResourceGroupService.create(this.name, this.releaseChannel)
      .then(() => {
        this.$modalInstance.close();
      })
      .catch((response) => {
        if (response.status === 409) {
          this.Notification.errorWithTrackingId(response, 'hercules.resourceGroupSettings.duplicateName');
        } else {
          this.Notification.errorWithTrackingId(response, 'hercules.genericFailure');
        }
      })
      .finally(() => {
        this.creating = false;
      });
  }

  public canCreate(): boolean {
    return this.name.length >= this.minlength;
  }

  public handleKeypress(event): void {
    if (event.keyCode === KeyCodes.ENTER && this.canCreate()) {
      this.createResourceGroup();
    }
  }

  public getAvailableReleaseChannels(): void {
    this.ResourceGroupService.getAllowedChannels()
      .then((channels) => {
        this.allowedChannels = channels;
      });
  }

  public showChannelOption(channel: string): boolean {
    return _.includes(this.allowedChannels, channel);
  }
}
