namespace globalsettings {
  export class DataPolicySettingController {

    public dataLoaded = false;

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

    /* @ngInject */
    constructor(private $translate) {

      //fake get retentionTime
      setTimeout( this.retentionModeLoaded.bind(this), 400, 2);
    }

    public retentionModeLoaded(mode:number) {

      //Fake mock data this is:
      if (this.retentionTimeOptions && mode >= 0 && mode < this.retentionTimeOptions.length) {
        this.retentionTimeSelected = this.retentionTimeOptions[mode];
      }

      this.dataLoaded = true;
    }

    private getSettingString(key:string):string{
      return  this.$translate.instant('globalSettings.dataPolicy.' + key);
    }

    retentionTimeUpdate() {
      if (this.dataLoaded && this.retentionTimeSelected) {
           alert('update:' + this.retentionTimeSelected.label);
      }
    }
  }
  angular.module('Core')
    .controller('DataPolicySettingController', DataPolicySettingController);
}
