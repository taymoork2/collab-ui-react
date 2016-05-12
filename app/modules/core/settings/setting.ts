namespace globalsettings {

  export interface SettingsController {
    authinfo:any,
    translate:any
  }

  export class Setting {

    public title:string;
    public template:string;
    public subsectionLabel:string;
    public subsectionDescription:string;
    public isPartner:boolean;
    public isManaged:boolean;
    public isCiscoSupport:boolean;
    public isCiscoHelp:boolean;
    public translate:any;

    settingKey:string;

    constructor(settingKey:string, ctrl:SettingsController) {
      this.settingKey = settingKey;

      this.title = 'globalSettings.' + settingKey + '.title';
      this.subsectionLabel = 'globalSettings.' + settingKey + '.subsectionLabel';
      this.subsectionDescription = 'globalSettings.' + settingKey + '.subsectionDescription';
      this.template = 'modules/core/settings/setting-' + settingKey + '.tpl.html';

      this.isPartner = ctrl.authinfo.isPartner();
      //this.isManaged = false;
      //this.isCiscoSupport = ctrl.authinfo.isCiscoSupport();
     // this.isCiscoHelp = ctrl.authinfo.isCiscoHelp();
      this.translate = ctrl.translate;
    }

    getSettingString(settingName:string):string{
      return this.translate.instant('globalSettings.' + this.settingKey + "." + settingName)
    }
  }
}
