import { IToolkitModalService } from 'modules/core/modal';
import uuid = require('uuid');


export class CTService {
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
    private $modal: IToolkitModalService,
    private Authinfo,
    private BrandService,
    private TimezoneService,
    private UrlConfig,
  ) {
  }

  public typeOptions = [{
    id: 'email',
    text: this.$translate.instant('careChatTpl.typeEmail'),
    dictionaryType: {
      fieldSet: 'cisco.base.customer',
      fieldName: 'Context_Work_Email',
    },
  }, {
    id: 'name',
    text: this.$translate.instant('careChatTpl.typeName'),
    dictionaryType: {
      fieldSet: 'cisco.base.customer',
      fieldName: 'Context_First_Name',
    },
  }, {
    id: 'category',
    text: this.$translate.instant('careChatTpl.typeCategory'),
    dictionaryType: {
      fieldSet: 'cisco.base.ccc.pod',
      fieldName: 'category',
    },
  }, {
    id: 'phone',
    text: this.$translate.instant('careChatTpl.typePhone'),
    dictionaryType: {
      fieldSet: 'cisco.base.customer',
      fieldName: 'Context_Mobile_Phone',
    },
  }, {
    id: 'id',
    text: this.$translate.instant('careChatTpl.typeId'),
    dictionaryType: {
      fieldSet: 'cisco.base.customer',
      fieldName: 'Context_Customer_External_ID',
    },
  }, {
    id: 'custom',
    text: this.$translate.instant('careChatTpl.typeCustom'),
    dictionaryType: {
      fieldSet: 'cisco.base.ccc.pod',
      fieldName: 'cccCustom',
    },
  }, {
    id: 'reason',
    text: this.$translate.instant('careChatTpl.typeReason'),
    dictionaryType: {
      fieldSet: 'cisco.base.ccc.pod',
      fieldName: 'cccChatReason',
    },
  }];

  public categoryTypeOptions = [{
    text: this.$translate.instant('careChatTpl.categoryTextCustomer'),
    id: 'customerInfo',

  }, {
    text: this.$translate.instant('careChatTpl.categoryTextRequest'),
    id: 'requestInfo',
  }];

  public requiredOptions = [{
    text: this.$translate.instant('careChatTpl.requiredField'),
    id: 'required',
  }, {
    text: this.$translate.instant('careChatTpl.optionalField'),
    id: 'optional',
  }];

  public getCategoryTypeObject = function (typeId) {
    return _.find(this.categoryTypeOptions, {
      id: typeId,
    });
  };

  public getTypeObject = function (typeId) {
    return _.find(this.typeOptions, {
      id: typeId,
    });
  };

  public getPromptTimeOptions() {
    return [
      { label: this.$translate.instant('careChatTpl.promptTimeOption1'), value: 30 },
      { label: this.$translate.instant('careChatTpl.promptTimeOption2'), value: 60 },
      { label: this.$translate.instant('careChatTpl.promptTimeOption3'), value: 180 },
      { label: this.$translate.instant('careChatTpl.promptTimeOption4'), value: 300 },
    ];
  }

  public getDays() {
    return [{
      day: 'S',
      label: 'Sunday',
      isSelected: false,
    }, {
      day: 'M',
      label: 'Monday',
      isSelected: true,
    }, {
      day: 'T',
      label: 'Tuesday',
      isSelected: true,
    }, {
      day: 'W',
      label: 'Wednesday',
      isSelected: true,
    }, {
      day: 'T',
      label: 'Thursday',
      isSelected: true,
    }, {
      day: 'F',
      label: 'Friday',
      isSelected: true,
    }, {
      day: 'S',
      label: 'Saturday',
      isSelected: false,
    }];
  }

  public getPromptTime(time) {
    const timeOptions = this.getPromptTimeOptions();
    return _.find(timeOptions, {
      value: time || timeOptions[0].value,
    });
  }

  public getLengthValidationConstants() {
    return {
      singleLineMaxCharLimit25: 25,
      singleLineMaxCharLimit50: 50,
      multiLineMaxCharLimit: 250,
      multiLineMaxCharLimit100: 100,
      empty: 0,
    };
  }

  public getLogo() {
    return this.BrandService.getLogoUrl(this.Authinfo.getOrgId()).then((logoUrl) => {
      return this.$http.get(logoUrl, {
        responseType: 'arraybuffer',
      });
    });
  }

  public getLogoUrl() {
    return this.BrandService.getSettings(this.Authinfo.getOrgId()).then((settings) => {
      return settings.logoUrl;
    });
  }

  public generateCodeSnippet(templateId: uuid, templateName: String) {
    const appName = this.UrlConfig.getSunlightBubbleUrl();
    const orgId = this.Authinfo.getOrgId();
    const orgName = this.Authinfo.getOrgName();
    const templateNameHelpText = this.$translate.instant('careChatTpl.embedCodeSnippet.templateNameHelpText',
      { templateName: templateName });
    const orgNameHelpText = this.$translate.instant('careChatTpl.embedCodeSnippet.orgNameHelpText',
      { orgName: orgName });
    return '<script>\n' +
      '//' + templateNameHelpText + '\n' +
      '//' + orgNameHelpText + '\n' +
      '  (function(document, script) {\n' +
      '  var bubbleScript = document.createElement(script);\n' +
      '  e = document.getElementsByTagName(script)[0];\n' +
      '  bubbleScript.async = true;\n' +
      "  bubbleScript.CiscoAppId =  'cisco-chat-bubble-app';\n" +
      "  bubbleScript.DC = '" + appName.split('https://bubble.')[1] + "';\n" +
      "  bubbleScript.orgId = '" + orgId + "';\n" +
      "  bubbleScript.templateId = '" + templateId + "';\n" +
      "  bubbleScript.src = '" + appName + "/bubble.js';\n" +
      "  bubbleScript.type = 'text/javascript';\n" +
      "  bubbleScript.setAttribute('charset', 'utf-8');\n" +
      '  e.parentNode.insertBefore(bubbleScript, e);\n' +
      "  })(document, 'script');\n" +
      '</script>';
  }

  public labelForTime(time) {
    return moment(time, 'HH:mm').locale('en').format('hh:mm A');
  }

  public hoursWithSuffix(suffix: string) {
    return _.range(0, 24).map(function (time: number) {
      return _.padStart(time.toString(), 2, '0') + suffix;
    });
  }

  public getTimeOptions() {
    const values = _.flatten(_.zip(this.hoursWithSuffix(':00'), this.hoursWithSuffix(':30')));
    return _.map(values, (value) => {
      return {
        label: this.labelForTime(value),
        value: value,
      };
    });
  }

  public getEndTimeOptions(startTime) {
    const timeOptions = this.getTimeOptions();
    // Push 11:59 PM as end time to handle the scenario where start time is 11:30 PM.
    timeOptions.push({
      label: this.labelForTime('23:59'),
      value: '23:59',
    });
    const index = _.findIndex(timeOptions, {
      label: this.labelForTime(startTime.value),
      value: startTime.value,
    });
    return timeOptions.slice(index + 1, timeOptions.length);
  }

  public getDefaultTimes() {
    const timeOptions = this.getTimeOptions();
    return {
      startTime: _.find(timeOptions, {
        value: '08:00',
      }),
      endTime: _.find(timeOptions, {
        value: '16:00',
      }),
    };
  }

  public labelForTimezone(zone): string {
    const map = this.TimezoneService.getCountryMapping();
    return map[zone] + ': ' + zone;
  }

  public getTimezoneOptions() {
    const timezones = moment.tz.names()
      .filter((zone) => {
        const map = this.TimezoneService.getCountryMapping();
        return map[zone];
      })
      .map((zone) => {
        return {
          label: this.labelForTimezone(zone),
          value: zone,
        };
      })
      .sort(function (a, b) {
        return a['label'].localeCompare(b['label']);
      });
    return timezones;
  }

  public getDefaultTimeZone() {
    return _.find(this.getTimezoneOptions(), {
      value: 'America/New_York',
    });
  }

  public getTimeZone(zone) {
    return _.find(this.getTimezoneOptions(), {
      value: zone,
    });
  }

  public getPreviewDays(days, continuous, startIndex, endIndex) {
    if (startIndex === endIndex) {
      return days[startIndex].label;
    }

    if (continuous) {
      return days[startIndex].label + ' - ' + days[endIndex].label;
    }

    return _.map(_.filter(days, 'isSelected'), 'label').join(', ');
  }

  public openEmbedCodeModal(templateId, templateName) {
    const header = this.$translate.instant('careChatTpl.embedCodeFor');
    this.$modal.open({
      template: require('modules/sunlight/features/customerSupportTemplate/wizardPages/ctEmbedCodeModal.tpl.html'),
      type: 'small',
      controller: 'EmbedCodeCtrl',
      controllerAs: 'embedCodeCtrl',
      resolve: {
        templateId: function () {
          return templateId;
        },
        templateName: function () {
          return templateName;
        },
        templateHeader: function () {
          return header + templateName;
        },
      },
    });
  }

  public openEmbedCodeModalNew(templateId, templateName) {
    const header = this.$translate.instant('careChatTpl.embedCodeFor');
    const templateHeader = `${header}${templateName}`;
    this.$modal.open({
      template: `<ct-embed-code-modal-component dismiss="$dismiss()" template-id="${templateId}" template-name="${templateName}" template-header="${templateHeader}"></ct-embed-code-modal-component>`,
      type: 'small',
    });
  }

  public getValidationMessages(minLength, maxLength) {
    return {
      required: this.$translate.instant('common.invalidRequired'),
      minlength: this.$translate.instant('common.invalidMinLength', {
        min: minLength,
      }),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: maxLength,
      }),
      invalidInput: this.$translate.instant('careChatTpl.ctValidation.invalidCharacters'),
    };
  }

  public getOverviewPageCards(mediaType, isProactiveFlagEnabled, isVirtualChatAssistantEnabled) {
    const cards: Card[] = [];
    switch (mediaType) {
      case 'chat':
        if (isProactiveFlagEnabled) {
          cards.push(new Card('proactivePrompt'));
        }
        cards.push(new Card('customerInformation'));
        if (isVirtualChatAssistantEnabled) {
          cards.push(new Card('virtualAssistant'));
        }
        cards.push(new Card('agentUnavailable'));
        cards.push(new Card('offHours'));
        cards.push(new Card('feedback'));
        break;
      case 'callback':
        cards.push(new Card('customerInformation'));
        cards.push(new Card('offHours'));
        cards.push(new Card('feedbackCallback'));
        break;
      case 'chatPlusCallback':
        if (isProactiveFlagEnabled) {
          cards.push({ name: 'proactivePrompt', mediaIcons: ['icon-message'] });
        }
        cards.push({ name: 'customerInformationChat', mediaIcons: ['icon-message'] });
        if (isVirtualChatAssistantEnabled) {
          cards.push({ name: 'virtualAssistant', mediaIcons: ['icon-message'] });
        }
        cards.push({ name: 'agentUnavailable', mediaIcons: ['icon-message'] });
        cards.push({ name: 'feedback', mediaIcons: ['icon-message'] });
        cards.push({ name: 'customerInformationCallback', mediaIcons: ['icon-phone'] });
        cards.push({ name: 'feedbackCallback', mediaIcons: ['icon-phone'] });
        cards.push({ name: 'offHours', mediaIcons: ['icon-message', 'icon-phone'] });
        break;
      default:
        return cards;
    }
    return cards;
  }

  public getStatesBasedOnType(mediaType: string, featureFlags: any) {
    const states: string[] = [];
    switch (mediaType) {
      case 'chat':
        states.push('name');
        if (featureFlags.isEvaFlagEnabled) {
          states.push('chatEscalationBehavior');
        }
        states.push('overview');
        if (featureFlags.isProactiveFlagEnabled) {
          states.push('proactivePrompt');
        }
        states.push('customerInformation');
        states.push('virtualAssistant');
        states.push('agentUnavailable');
        states.push('offHours');
        states.push('feedback');
        states.push('profile');
        states.push('chatStatusMessages');
        states.push('summary');
        break;
      case 'callback':
        states.push('name');
        states.push('overview');
        states.push('customerInformation');
        states.push('offHours');
        states.push('feedbackCallback');
        states.push('summary');
        break;
      case 'chatPlusCallback':
        states.push('name');
        if (featureFlags.isEvaFlagEnabled) {
          states.push('chatEscalationBehavior');
        }
        states.push('overview');
        if (featureFlags.isProactiveFlagEnabled) {
          states.push('proactivePrompt');
        }
        states.push('customerInformationChat');
        states.push('virtualAssistant');
        states.push('agentUnavailable');
        states.push('feedback');
        states.push('profile');
        states.push('chatStatusMessages');
        states.push('customerInformationCallback');
        states.push('feedbackCallback');
        states.push('offHours');
        states.push('summary');
        break;
      default:
        return states;
    }
    return states;
  }

  public getEvaDataModel(evaConfig, routingLabels, $translate) {
    return [{
      label: $translate.instant('careChatTpl.chatEscalatioAgent'),
      value: routingLabels.AGENT,
      name: 'RadioEVA',
      id: 'agent',
      desc: $translate.instant('careChatTpl.chatEscalatioAgentDesc'),
      hasInfo: true,
      isDisabled: false,
      tooltipHtml: $translate.instant('careChatTpl.chatEscalatioAgentTooltip'),
    }, {
      label: $translate.instant('careChatTpl.chatEscalatioExpert'),
      value: routingLabels.EXPERT,
      name: 'RadioEVA',
      id: 'expert',
      desc: $translate.instant('careChatTpl.chatEscalatioExpertDesc'),
      hasInfo: false,
      isDisabled: !evaConfig.isEvaConfigured,
      tooltipHtml: $translate.instant('careChatTpl.chatEscalatioExpertTooltip'),
    }, {
      label: $translate.instant('careChatTpl.chatEscalatioAgentPlusExpert'),
      value: routingLabels.AGENTPLUSEXPERT,
      name: 'RadioEVA',
      id: 'agentplusexpert',
      desc: $translate.instant('careChatTpl.chatEscalatioAgentPlusExpertDesc'),
      hasInfo: false,
      isDisabled: !evaConfig.isEvaConfigured,
      tooltipHtml: $translate.instant('careChatTpl.chatEscalatioAgentPlusExpertTooltip'),
    }];
  }
}

export class Card {
  public name: string;
  public mediaIcons: string[];
  constructor(name: string, mediaIcons: string[] = []) {
    this.name = name;
    this.mediaIcons = mediaIcons;
  }
}

export default angular
  .module('Sunlight')
  .service('CTService', CTService)
  .name;
