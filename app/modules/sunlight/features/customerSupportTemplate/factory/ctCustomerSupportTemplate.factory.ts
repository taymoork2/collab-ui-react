import { ChatConfiguration, CallbackConfiguration, ChatPlusCallbackbackConfiguration, IConfiguration } from './ctCustomerSupportClasses';
import { CTService } from '../services/CTService';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { SunlightConstantsService } from '../../../services/SunlightConstantsService';

interface ITemplate {
  name: string;
  configuration: IConfiguration;
}

export default class TemplateFactory {
  constructor(private authinfo: Authinfo,
              private ctService: CTService,
              private $translate: ng.translate.ITranslateService,
              private sunlightConstantsService: SunlightConstantsService) {
  }

  public getDefaultChatTemplate(mediaType) {
    return new DefaultChatTemplate(mediaType, this.authinfo, this.ctService, this.$translate, this.sunlightConstantsService);
  }

  public getDefaultCallbackTemplate(mediaType) {
    return new DefaultCallbackTemplate(mediaType, this.authinfo, this.ctService, this.$translate);
  }

  public getDefaultChatPlusCallbackTemplate(mediaType) {
    return new DefaultChatPlusCallTemplate(mediaType, this.authinfo, this.ctService, this.$translate, this.sunlightConstantsService);
  }
}
export class DefaultChatTemplate implements ITemplate {
  public name: string;
  public configuration: ChatConfiguration;
  constructor(mediaType: string, authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService, sunlightConstantsService: SunlightConstantsService) {
    this.name = '';
    this.configuration = new ChatConfiguration(mediaType, authinfo, ctService, $translate, sunlightConstantsService);
  }
}

export class DefaultCallbackTemplate implements ITemplate {
  public name: string;
  public configuration: CallbackConfiguration;

  constructor(mediaType: string, authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService) {
    this.name = '';
    this.configuration = new CallbackConfiguration(mediaType, authinfo, ctService, $translate);
  }
}

export class DefaultChatPlusCallTemplate implements ITemplate {
  public name: string;
  public configuration: ChatPlusCallbackbackConfiguration;

  constructor(mediaType: string, authinfo: Authinfo, ctService: CTService, $translate: ng.translate.ITranslateService, sunlightConstantsService: SunlightConstantsService) {
    this.name = '';
    this.configuration = new ChatPlusCallbackbackConfiguration(mediaType, authinfo, ctService, $translate, sunlightConstantsService);
  }
}
