/// <reference path="Setting.ts"/>
namespace globalsettings {

  export class DataPolicySetting extends Setting {

    public dataLoaded = false;

    constructor(ctrl:SettingsController) {
      super('dataPolicy', ctrl);

      //get retentionTime
      setTimeout( this.retentionModeLoaded.bind(this), 400, 2);
    }

    retentionModeLoaded(mode:number) {

      if (this.retentionTimeOptions && mode >= 0 && mode < this.retentionTimeOptions.length) {
        this.retentionTimeSelected = this.retentionTimeOptions[mode];
      }
      this.dataLoaded = true;
    }

    retentionTimeSelected:{
      value:number,
      label:string,
      description:string
    };

    retentionTimeOptions = [{
      value: 0,
      label: this.getSettingString('retentionOption1'),
      description: this.getSettingString('retentionOption1')
    }, {
      value: 1,
      label: this.getSettingString('retentionOption2'),
      description: this.getSettingString('retentionOption2')
    }, {
      value: 2,
      label: this.getSettingString('retentionOption3'),
      description: this.getSettingString('retentionOption3')
    }];


    retentionTimeUpdate() {
      if (this.dataLoaded && this.retentionTimeSelected) {
     //   alert('update:' + this.retentionTimeSelected.label);
      }
    }
  }
}
