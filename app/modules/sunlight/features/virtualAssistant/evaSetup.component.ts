import { IToolkitModalService } from 'modules/core/modal';
import { UniqueEmailValidator } from './uniqueEmailValidator.directive';
import * as _ from 'lodash';
import { VaCommonSetupCtrl } from './vaCommonSetupCtrl';


// TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
// preserve the ng-include module paths
const requireContext = (require as any).context(`ngtemplate-loader?module=Sunlight&relativeTo=app/!modules/sunlight/features/virtualAssistant/wizardPages/`, false, /^\.\/.*\.tpl\.html$/);
requireContext.keys().map(key => requireContext(key));

/**
 * ExpertVirtualAssistantSetupCtrl
 */
class ExpertVirtualAssistantSetupCtrl extends VaCommonSetupCtrl {

  public maxEmailLength = 63;
  public validateEmailChars = /^([A-Za-z0-9-._~/|?%^&{}!#$'`*=]+)$/;
  public emailForm: ng.IFormController;

  public template = {
    templateId: '',
    name: '',
    configuration: {
      mediaType: this.EvaService.evaServiceCard.type,
      pages: {
        evaOverview: {
          enabled: true,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_OVERVIEW_PAGE,
        },
        vaName: {
          enabled: true,
          nameValue: '',
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_NAME_PAGE,
        },
        evaEmail: {
          enabled: true,
          value: '',
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_EMAIL_PAGE,
        },
        vaAvatar: {
          enabled: true,
          fileValue: '',
          avatarError: this.avatarErrorType.NO_ERROR,
          uploadCanceled: false,
          avatarImageSrc: '/images/evaAvatarDefaultIcon.png',
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_AVATAR_PAGE,
        },
        evaDefaultSpace: {
          selectedDefaultSpace: {
            title: '',
            id: '',
          },
          defaultSpaceOptions: [{}],
          enabled: true,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_DEFAULT_SPACE,
        },
        evaConfigurationSteps: {
          enabled: true,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_CONFIGURATION_STEPS_PAGE,
        },
        vaSummary: {
          enabled: true,
          visibleError: false,
          startTimeInMillis: 0,
          eventName: this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_SUMMARY_PAGE,
        },
      },
    },
  };

  /* @ngInject*/
  constructor(
    public $scope: ng.IScope,
    public $state: ng.ui.IStateService,
    public $stateParams: ng.ui.IStateParamsService,
    public $modal: IToolkitModalService,
    public $translate: ng.translate.ITranslateService,
    public $timeout: ng.ITimeoutService,
    private EvaService,
    private SparkService,
    public Authinfo,
    public Analytics,
    public Notification,
    public UrlConfig,
    public CTService,
    public $window,
  ) {
    super($scope, $state, $modal, $translate, $timeout, Authinfo, Analytics, Notification, UrlConfig, CTService, $window);
    this.service = this.EvaService;
    // states == pages in order as found in storage template
    this.states = Object.keys(this.template.configuration.pages);
    this.currentState = this.states[0];
  }

  /**
   * Initialize the controller
   */
  public $onInit() {
    this.template.configuration.pages.evaOverview.startTimeInMillis = Date.now();
    if (this.$stateParams.isEditFeature) {
      this.isEditFeature = true;
      this.template.templateId = this.$stateParams.template.id;

      if (this.$stateParams.template.icon) {
        this.avatarUploadState = this.avatarState.PREVIEW;
        this.template.configuration.pages.vaAvatar.fileValue = this.$stateParams.template.icon;
      }
    }
  }

  /**
   * should next button be rendered.
   * @returns {boolean}
   */
  public nextButton(): any {
    switch (this.currentState) {
      case 'evaOverview':
        return true;
      case 'vaName':
        return this.isNamePageValid();
      case 'evaEmail':
        return this.isEmailPageValid();
      case 'vaAvatar':
        return !this.isAvatarUploading();
      case 'evaDefaultSpace':
        return this.isDefaultSpaceSelected();
      case 'evaConfigurationSteps':
        return true;
      case 'vaSummary':
        return 'hidden';
    }
  }

  /**
   * called when page corresponding to newState is loaded event
   * @param {string} newState
   */
  public onPageLoaded(newState: string): void {
    this.template.configuration.pages[newState].startTimeInMillis = Date.now();

    if (newState === 'evaDefaultSpace') {
      // Load the default space options
      const controller = this;
      controller.SparkService.listRooms().then((response) => {
        const allSpaces = response.items;
        if (allSpaces && allSpaces.length > 0) {
          controller.SparkService.getPerson('me').then((meResponse) => {
            const meId = meResponse.id;
            const spacesCreatedByThisUser = _.filter(allSpaces, { creatorId: meId });
            // Find the left over spaces
            const otherSpaces = _.pullAll(allSpaces, spacesCreatedByThisUser);
            if (otherSpaces && otherSpaces.length > 0) {
              controller.SparkService.listMemberships().then((membershipResponse) => {
                const allMemberships = membershipResponse.items;
                // Find all moderatored spaces
                if (allMemberships && allMemberships.length > 0) {
                  // Find space Ids that is a moderator
                  const allModeratoredSpaceIds = allMemberships.map(function(item) {
                    if (item.isModerator) {
                      return item.rooomId;
                    }
                  });
                  // Find all spaces that matched the moderator space id
                  const moderatoredSpaces = otherSpaces.filter(function (item) {
                    return _.indexOf(allModeratoredSpaceIds, item.id) > 0;
                  });
                  // Combine the spaces created by this user and moderatored spaces
                  const defaultSpaces = _.concat(spacesCreatedByThisUser, moderatoredSpaces);
                  this.template.configuration.pages.evaDefaultSpace.defaultSpaceOptions = _.sortBy(defaultSpaces, 'title');
                }
              });
            } else {
              this.template.configuration.pages.evaDefaultSpace.defaultSpaceOptions = _.sortBy(spacesCreatedByThisUser, 'title');
            }
          });
        } // end of if there are any spaces
      });
    }
  }

  public isDefaultSpaceSelected(): boolean {
    return !_.isEmpty(this.template.configuration.pages.evaDefaultSpace.selectedDefaultSpace.id);
  }

  /**
   * Writing the metrics to the mixpanel for the last page and the overall wizard
   */
  private writeMetrics(): void {
    const currentTimeInMillis = Date.now();
    let durationInMillis = currentTimeInMillis - this.template.configuration.pages.vaSummary.startTimeInMillis;
    let analyticProps = { durationInMillis: durationInMillis };
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_SUMMARY_PAGE, analyticProps);
    durationInMillis = currentTimeInMillis - this.template.configuration.pages.evaOverview.startTimeInMillis;
    analyticProps = { durationInMillis: durationInMillis };
    this.Analytics.trackEvent(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_START_FINISH, analyticProps);
  }

  public submitFeature(): void {
    const name = this.template.configuration.pages.vaName.nameValue.trim();
    const emailPrefix = this.template.configuration.pages.evaEmail.value.trim();
    const email = `${emailPrefix}@sparkbot.io`;
    this.creatingTemplate = true;
    const avatarDataUrl = this.template.configuration.pages.vaAvatar.fileValue;
    const defaultSpaceId = this.template.configuration.pages.evaDefaultSpace.selectedDefaultSpace.id;
    if (this.isEditFeature) {
      this.updateFeature(this.template.templateId, name, this.orgId, email, defaultSpaceId, avatarDataUrl);
    } else {
      this.createFeature(name, this.orgId, email, defaultSpaceId, avatarDataUrl);
    }
  }

  /**
   * create and store the current feature
   * @param name
   * @param orgId
   * @param email
   * @param defaultSpaceId
   * @param avatarDataUrl optional
   */
  private createFeature(name: string, orgId: string, email: string, defaultSpaceId: string, avatarDataUrl?: string): void {
    const controller = this;
    controller.service.addExpertAssistant(name, orgId, email, defaultSpaceId, avatarDataUrl)
      .then(function () {
        controller.handleFeatureCreation();
        controller.writeMetrics();
      })
      .catch(function (response) {
        controller.handleFeatureError();
        controller.Notification.errorWithTrackingId(response, controller.getMessageKey('messages.createConfigFailureText'), {
          featureName: controller.$translate.instant('careChatTpl.virtualAssistant.eva.featureText.name'),
        });
      });
  }

  public isNameValid(): boolean {
    const name = (this.template.configuration.pages.vaName.nameValue || '').trim();
    const isLengthValid = (_.get(name, 'length', 0) <= this.maxNameLength);

    if (this.nameForm && name) {
      this.nameForm.nameInput.$setValidity(this.NameErrorMessages.ERROR_CHAR_50, isLengthValid);
    }

    return isLengthValid;
  }

  public isNamePageValid(): boolean {
    const name = (this.template.configuration.pages.vaName.nameValue || '').trim();
    return name !== '' && this.isNameValid();
  }

  public isEmailPageValid(): boolean {
    const emailPrefix = (this.template.configuration.pages.evaEmail.value || '').trim();
    return emailPrefix !== '' && _.get(this, 'emailForm.$valid', false);
  }

  /**
   * update and store the current feature
   * @param templateId
   * @param name
   * @param orgId
   * @param email
   * @param defaultSpaceId
   * @param avatarDataURl optional
   */
  private updateFeature(templateId: string, name: string, orgId: string, email: string, defaultSpaceId: string, avatarDataUrl?: string): void {
    const controller = this;
    controller.service.updateExpertAssistant(templateId, name, orgId, email, defaultSpaceId, avatarDataUrl)
      .then(function () {
        controller.handleFeatureUpdate();
        controller.writeMetrics();
      })
      .catch(function (response) {
        controller.handleFeatureError();
        controller.Notification.errorWithTrackingId(response, controller.getMessageKey('messages.updateConfigFailureText'));
      });
  }
}

/**
 * Expert Virtual Assistant Component used for Creating new Expert Virtual Assistant
 */
export class ExpertVirtualAssistantSetupComponent implements ng.IComponentOptions {
  public controller = ExpertVirtualAssistantSetupCtrl;
  public template = require('modules/sunlight/features/virtualAssistant/vaSetup.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('Sunlight')
  .directive('uniqueEmail', UniqueEmailValidator.factory)
  .component('evaSetup', new ExpertVirtualAssistantSetupComponent());
