import { CTService } from 'modules/sunlight/features/customerSupportTemplate/services/CTService';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { SunlightConstantsService } from 'modules/sunlight/services/SunlightConstantsService';

export class MediaSpecificConfiguration {
  public useOrgProfile: boolean = true;
  public displayText: string;
  public orgLogoUrl: string;
  public useAgentRealName: boolean = false;

  constructor( authinfo: Authinfo, private ctService: CTService) {
    this.useOrgProfile = true;
    this.useAgentRealName = false;
    this.displayText  = authinfo.getOrgName();
    this.getOrgLogo();
  }

  private getOrgLogo() {
    this.ctService.getLogoUrl().then(function (url) {
      this.orgLogoUrl = url;
    });
  }
}

export class IdNameConfig {
  public id: string;
  public name: string;

  constructor() {
    this.id = '';
    this.name = '';
  }
}

export class Attribute {
  public name: string;
  public value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

export class ProActiveFields {
  public promptTime: string;
  public promptTitle: any;
  public promptMessage: any = {
    message: this.$translate.instant('careChatTpl.defaultPromptMessage'),
  };
  constructor (
    private $translate: ng.translate.ITranslateService,
  ) {}
}

export class ProactivePrompt {
  public enabled: boolean;
  public fields: any;

  constructor(authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.enabled =  false;
    this.fields = {
      promptTime: ctService.getPromptTime(null).value,
      promptTitle: {
        displayText: authinfo.getOrgName(),
      },
      promptMessage: {
        message: $translate.instant('careChatTpl.defaultPromptMessage'),
      },
    };
  }
}

export class VirtualAssistantConfig {
  public enabled: boolean;
  public config: IdNameConfig;
  public welcomeMessage: string;

  constructor (
    $translate: ng.translate.ITranslateService,
  ) {
    this.enabled = false;
    this.config = new IdNameConfig();
    this.welcomeMessage = $translate.instant('careChatTpl.virtualAssistantWelcomeMessage');
  }
}

export class AttributeList {
  public attributes: Attribute[];
}

export class CustomerInformationFields {
  public welcomeHeader: AttributeList;
  public field1: AttributeList;
  public field2: AttributeList;
  public field3: AttributeList;
  public field4: AttributeList;
}

export class CustomerInformation {
  public enabled: boolean;
  public fields: any;
  constructor(authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.enabled = true;
    this.fields = {
      welcomeHeader: {
        attributes: [{
          name: 'header',
          value: $translate.instant('careChatTpl.defaultWelcomeText'),
        }, {
          name: 'organization',
          value: authinfo.getOrgName(),
        }],
      },
      field1: {
        attributes: [{
          name: 'required',
          value: 'required',
        }, {
          name: 'category',
          value: ctService.getCategoryTypeObject('customerInfo'),
        }, {
          name: 'label',
          value: $translate.instant('careChatTpl.defaultNameText'),
        }, {
          name: 'hintText',
          value: $translate.instant('careChatTpl.defaultNameHint'),
        }, {
          name: 'type',
          value: ctService.getTypeObject('name'),
          categoryOptions: '',
        }],
      },

      field2: {
        attributes: [{
          name: 'required',
          value: 'required',
        }, {
          name: 'category',
          value: ctService.getCategoryTypeObject('customerInfo'),
        }, {
          name: 'label',
          value: $translate.instant('careChatTpl.defaultEmailText'),
        }, {
          name: 'hintText',
          value: $translate.instant('careChatTpl.defaultEmail'),
        }, {
          name: 'type',
          value: ctService.getTypeObject('email'),
          categoryOptions: '',
        }],
      },

      field3: {
        attributes: [{
          name: 'required',
          value: 'optional',
        }, {
          name: 'category',
          value: ctService.getCategoryTypeObject('requestInfo'),
        }, {
          name: 'label',
          value: $translate.instant('careChatTpl.defaultQuestionText'),
        }, {
          name: 'hintText',
          value: $translate.instant('careChatTpl.field3HintText'),
        }, {
          name: 'type',
          value: ctService.getTypeObject('category'),
          categoryOptions: '',
        }],
      },

      field4: {
        attributes: [{
          name: 'required',
          value: 'optional',
        }, {
          name: 'category',
          value: ctService.getCategoryTypeObject('requestInfo'),
        }, {
          name: 'label',
          value: $translate.instant('careChatTpl.additionalDetails'),
        }, {
          name: 'hintText',
          value: $translate.instant('careChatTpl.additionalDetailsAbtIssue'),
        }, {
          name: 'type',
          value: ctService.getTypeObject('reason'),
          categoryOptions: '',
        }],
      },
    };
  }
}

export class AgentUnavailable {
  public enabled: boolean;
  public fields: any;

  constructor (
    $translate: ng.translate.ITranslateService,
  ) {
    this.enabled = true;
    this.fields = {
      agentUnavailableMessage: {
        displayText: $translate.instant('careChatTpl.agentUnavailableMessage'),
      },
    };
  }
}

export class OffHours {
  public enabled: boolean;
  public message: string;
  public schedule: any;
  constructor(ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.enabled = true;
    this.message = $translate.instant('careChatTpl.offHoursDefaultMessage');
    this.schedule = {
      businessDays: _.map(_.filter(ctService.getDays(), 'isSelected'), 'label'),
      open24Hours: true,
      timings: {
        startTime: ctService.getDefaultTimes().startTime.label,
        endTime: ctService.getDefaultTimes().endTime.label,
      },
      timezone: ctService.getDefaultTimeZone().value,
    };
  }
}

export class Feedback {
  public enabled: boolean;
  public fields: any;
  constructor(
    $translate: ng.translate.ITranslateService,
  ) {
    this.enabled = true;
    this.fields = {
      feedbackQuery: {
        displayText: $translate.instant('careChatTpl.feedbackQueryCall'),
      },
      comment: {
        displayText: $translate.instant('careChatTpl.ratingComment'),
        dictionaryType: {
          fieldSet: 'cisco.base.rating',
          fieldName: 'cccRatingComments',
        },
      },
    };
  }
}

export class CallbackConfirmation {
  public enabled: boolean;
  public fields: any;

  constructor($translate: ng.translate.ITranslateService) {
    this.enabled = true;
    this.fields = {
      callbackConfirmationMessage: {
        displayText: $translate.instant('careChatTpl.callbackConfirmationMsg'),
      },
    };
  }
}

export interface IPages {
  agentUnavailable: AgentUnavailable;
  offHours: OffHours;
}

export class ChatPages implements IPages {
  public customerInformation: CustomerInformation;
  public agentUnavailable: AgentUnavailable;
  public offHours: OffHours;
  public feedback: Feedback;

  constructor( authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.customerInformation = new CustomerInformation(authinfo, ctService, $translate);
    this.agentUnavailable = new AgentUnavailable($translate);
    this.offHours = new OffHours(ctService, $translate);
    this.feedback = new Feedback($translate);
  }
}

export class CallbackPages implements IPages {
  public customerInformation: CustomerInformation;
  public agentUnavailable: AgentUnavailable;
  public offHours: OffHours;
  public feedbackCallback: Feedback;
  public callbackConfirmation: CallbackConfirmation;

  constructor(authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.customerInformation = new CustomerInformation(authinfo, ctService, $translate);
    this.agentUnavailable = new AgentUnavailable($translate);
    this.offHours = new OffHours(ctService, $translate);
    this.feedbackCallback = new Feedback($translate);
    this.callbackConfirmation = new CallbackConfirmation($translate);
  }
}

export class CBPages implements IPages {
  public customerInformationChat: CustomerInformation;
  public customerInformationCallback: CustomerInformation;
  public agentUnavailable: AgentUnavailable;
  public offHours: OffHours;
  public feeback: Feedback;
  public callbackConfirmation: CallbackConfirmation;
  public feedbackCallback: Feedback;

  constructor( authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.customerInformationChat = new CustomerInformation(authinfo, ctService, $translate);
    this.customerInformationCallback = new CustomerInformation(authinfo, ctService, $translate);
    this.agentUnavailable = new AgentUnavailable($translate);
    this.offHours = new OffHours(ctService, $translate);
    this.feedbackCallback = new Feedback($translate);
    this.feeback = new Feedback($translate);
    this.callbackConfirmation = new CallbackConfirmation($translate);
  }
}

export class ChatStatusMessages {
  public messages: any ;

  constructor(
    $translate: ng.translate.ITranslateService,
  ) {
    this.messages = {
      bubbleTitleMessage: {
        displayText: $translate.instant('careChatTpl.bubbleTitleMessage'),
      },
      connectingMessage: {
        displayText: $translate.instant('careChatTpl.connectingMessage'),
      },
      waitingMessage: {
        displayText: $translate.instant('careChatTpl.waitingMessage'),
      },
      enterRoomMessage: {
        displayText: $translate.instant('careChatTpl.enterRoomMessage'),
      },
      leaveRoomMessage: {
        displayText: $translate.instant('careChatTpl.leaveRoomMessage'),
      },
      chattingMessage: {
        displayText: $translate.instant('careChatTpl.chattingMessage'),
      },
    };
  }

}

export interface IConfiguration {
  mediaType: string;
  mediaSpecificConfiguration: MediaSpecificConfiguration;
}

export class ChatConfiguration implements IConfiguration {
  public mediaType: string;
  public mediaSpecificConfiguration: MediaSpecificConfiguration;
  public proactivePrompt: ProactivePrompt;
  public routingLabel: string;
  public expertVirtualAssistant: IdNameConfig;
  public virtualAssistant: VirtualAssistantConfig;
  public pages: ChatPages;
  public chatStatusMessages: ChatStatusMessages;

  /* @ngInject*/
  constructor(mediaType: string,
              authinfo: Authinfo,
              ctService: CTService,
              $translate: ng.translate.ITranslateService,
              sunlightConstantsService: SunlightConstantsService) {
    this.mediaType = mediaType;
    this.pages = new ChatPages(authinfo, ctService, $translate);
    this.mediaSpecificConfiguration = new MediaSpecificConfiguration(authinfo, ctService);
    this.proactivePrompt = new ProactivePrompt(authinfo, ctService, $translate);
    this.routingLabel = sunlightConstantsService.routingLabels.AGENT;
    this.expertVirtualAssistant = new IdNameConfig();
    this.virtualAssistant = new VirtualAssistantConfig($translate);
    this.chatStatusMessages = new ChatStatusMessages($translate);
  }
}

export class CallbackConfiguration implements IConfiguration {
  public mediaType: string;
  public mediaSpecificConfiguration: MediaSpecificConfiguration;
  public pages: CallbackPages;

  /* @ngInject*/
  constructor(mediaType: string,
              authinfo: Authinfo,
              ctService: CTService,
              $translate: ng.translate.ITranslateService) {
    this.mediaType = mediaType;
    this.pages = new CallbackPages(authinfo, ctService, $translate);
    this.mediaSpecificConfiguration = new MediaSpecificConfiguration(authinfo, ctService);
  }
}

export class ChatPlusCallbackbackConfiguration implements IConfiguration {
  public mediaType: string;
  public mediaSpecificConfiguration: MediaSpecificConfiguration;
  public proactivePrompt: ProactivePrompt;
  public routingLabel: string;
  public expertVirtualAssistant: IdNameConfig;
  public virtualAssistant: VirtualAssistantConfig;
  public pages: CBPages;
  public chatStatusMessages: ChatStatusMessages;

  /* @ngInject*/
  constructor(mediaType: string,
              authinfo: Authinfo,
              ctService: CTService,
              $translate: ng.translate.ITranslateService,
              sunlightConstantsService: SunlightConstantsService) {
    this.mediaType = mediaType;
    this.pages = new CBPages(authinfo, ctService, $translate);
    this.mediaSpecificConfiguration = new MediaSpecificConfiguration(authinfo, ctService);
    this.proactivePrompt = new ProactivePrompt(authinfo, ctService, $translate);
    this.routingLabel = sunlightConstantsService.routingLabels.AGENT;
    this.expertVirtualAssistant = new IdNameConfig();
    this.virtualAssistant = new VirtualAssistantConfig($translate);
    this.chatStatusMessages = new ChatStatusMessages($translate);
  }
}
