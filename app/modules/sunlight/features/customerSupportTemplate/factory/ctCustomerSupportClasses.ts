import { CTService } from 'modules/sunlight/features/customerSupportTemplate/services/CTService';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { SunlightConstantsService } from 'modules/sunlight/services/SunlightConstantsService';

export class MediaSpecificConfiguration {
  public useOrgProfile: boolean = true;
  public displayText: string;
  public orgLogoUrl: string;
  public useAgentRealName: boolean = true;

  constructor( authinfo: Authinfo, private ctService: CTService) {
    this.useOrgProfile = true;
    this.useAgentRealName = true;
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
  constructor (id = '', name = '') {
    this.id = id;
    this.name = name;
  }
}

export enum MediaTypes {
  CHAT = 'chat',
  CALLBACK = 'callback',
  CHATPLUSCALLBACK = 'chatPlusCallback',
}

export class IdNameIconConfig {
  public id: string;
  public name: string;
  public icon: string;

  constructor() {
    this.id = '';
    this.name = '';
    this.icon = '';
  }
}

export class Attribute {
  public name: string;
  public value: any;

  constructor(name: string, value: any) {
    this.name = name;
    this.value = value;
  }
}

export class CategoryAttribute extends Attribute {
  public categoryOptions: string[];
  constructor (name: string, value: any, options: string[]) {
    super(name, value);
    this.categoryOptions = options;
  }
}

export class ProActiveFields {
  public promptTime: string;
  public promptTitle: any;
  public promptMessage: any;
  constructor (promptTime, displayText, message) {
    this.promptTime = promptTime;
    this.promptTitle = { displayText };
    this.promptMessage = { message };
  }
}

export class ProactivePrompt {
  public enabled: boolean;
  public fields: any;

  constructor(authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.enabled = false;
    this.fields = new ProActiveFields(
      ctService.getPromptTime(null).value,
      (authinfo.getOrgName() || '').slice(0, 50),
      $translate.instant('careChatTpl.templateConfig.default.defaultPromptMessage'),
    );
  }
}

export class CVAConfig extends IdNameConfig {
  public icon: string = '';
  constructor (id = '', name = '', icon = '') {
    super(id, name);
    this.icon = icon;
  }
}

export class VirtualAssistantConfig {
  public enabled: boolean = false;
  public config: CVAConfig;
  public welcomeMessage: string;

  constructor (
    $translate: ng.translate.ITranslateService,
  ) {
    this.config = new CVAConfig();
    this.welcomeMessage = $translate.instant('careChatTpl.templateConfig.default.virtualAssistantWelcomeMessage');
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
        attributes: [
          new Attribute('header', $translate.instant('careChatTpl.templateConfig.default.defaultWelcomeText')),
          new Attribute('organization', authinfo.getOrgName()),
        ],
      },
      field1: {
        attributes: [
          new Attribute('required', 'required'),
          new Attribute('category', ctService.getCategoryTypeObject('customerInfo') as string),
          new Attribute('label', $translate.instant('careChatTpl.templateConfig.default.defaultNameText')),
          new Attribute('hintText', $translate.instant('careChatTpl.templateConfig.default.defaultNameHint')),
          new CategoryAttribute('type', ctService.getTypeObject('name'), ['']),
        ],
      },

      field2: {
        attributes: [
          new Attribute('required', 'required'),
          new Attribute('category', ctService.getCategoryTypeObject('customerInfo') as string),
          new Attribute('label', $translate.instant('careChatTpl.templateConfig.default.defaultEmailText')),
          new Attribute('hintText', $translate.instant('careChatTpl.templateConfig.default.defaultEmail')),
          new CategoryAttribute('type', ctService.getTypeObject('email'), ['']),
        ],
      },

      field3: {
        attributes: [
          new Attribute('required', 'optional'),
          new Attribute('category', ctService.getCategoryTypeObject('requestInfo') as string),
          new Attribute('label', $translate.instant('careChatTpl.templateConfig.default.defaultQuestionText')),
          new Attribute('hintText', $translate.instant('careChatTpl.templateConfig.default.field3HintText')),
          new CategoryAttribute('type', ctService.getTypeObject('category'), ['']),
        ],
      },

      field4: {
        attributes: [
          new Attribute('required', 'optional'),
          new Attribute('category', ctService.getCategoryTypeObject('requestInfo') as string),
          new Attribute('label', $translate.instant('careChatTpl.templateConfig.default.additionalDetails')),
          new Attribute('hintText', $translate.instant('careChatTpl.templateConfig.default.additionalDetailsAbtIssue')),
          new CategoryAttribute('type', ctService.getTypeObject('reason'), ['']),
        ],
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
        displayText: $translate.instant('careChatTpl.templateConfig.default.agentUnavailableMessage'),
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
    this.message = $translate.instant('careChatTpl.templateConfig.default.offHoursDefaultMessage');
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
        displayText: $translate.instant('careChatTpl.templateConfig.default.feedbackQuery'),
      },
      comment: {
        displayText: $translate.instant('careChatTpl.templateConfig.default.ratingComment'),
        dictionaryType: {
          fieldSet: 'cisco.base.rating',
          fieldName: 'cccRatingComments',
        },
      },
    };
  }
}

export class FeedbackCallback {
  public enabled: boolean;
  public fields: any;
  constructor(
    $translate: ng.translate.ITranslateService,
  ) {
    this.enabled = true;
    this.fields = {
      feedbackQuery: {
        displayText: $translate.instant('careChatTpl.templateConfig.default.feedbackQueryCall'),
      },
      comment: {
        displayText: $translate.instant('careChatTpl.templateConfig.default.ratingComment'),
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
        displayText: $translate.instant('careChatTpl.templateConfig.default.callbackConfirmationMsg'),
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
  public feedbackCallback: FeedbackCallback;
  public callbackConfirmation: CallbackConfirmation;

  constructor(authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.customerInformation = new CustomerInformation(authinfo, ctService, $translate);
    this.agentUnavailable = new AgentUnavailable($translate);
    this.offHours = new OffHours(ctService, $translate);
    this.feedbackCallback = new FeedbackCallback($translate);
    this.callbackConfirmation = new CallbackConfirmation($translate);
  }
}

export class CBPages implements IPages {
  public customerInformationChat: CustomerInformation;
  public customerInformationCallback: CustomerInformation;
  public agentUnavailable: AgentUnavailable;
  public offHours: OffHours;
  public feedback: Feedback;
  public callbackConfirmation: CallbackConfirmation;
  public feedbackCallback: FeedbackCallback;

  constructor( authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.customerInformationChat = new CustomerInformation(authinfo, ctService, $translate);
    this.customerInformationCallback = new CustomerInformation(authinfo, ctService, $translate);
    this.agentUnavailable = new AgentUnavailable($translate);
    this.offHours = new OffHours(ctService, $translate);
    this.feedbackCallback = new FeedbackCallback($translate);
    this.feedback = new Feedback($translate);
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
        displayText: $translate.instant('careChatTpl.templateConfig.default.bubbleTitleMessage'),
      },
      connectingMessage: {
        displayText: $translate.instant('careChatTpl.templateConfig.default.connectingMessage'),
      },
      waitingMessage: {
        displayText: $translate.instant('careChatTpl.templateConfig.default.waitingMessage'),
      },
      enterRoomMessage: {
        displayText: $translate.instant('careChatTpl.templateConfig.default.enterRoomMessage'),
      },
      leaveRoomMessage: {
        displayText: $translate.instant('careChatTpl.templateConfig.default.leaveRoomMessage'),
      },
      chattingMessage: {
        displayText: $translate.instant('careChatTpl.templateConfig.default.chattingMessage'),
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
