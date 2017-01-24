require('./_voicemail-settings.scss');

class HybridVoicemailCtrl implements ng.IComponentController {
  public isCallServiceConnectEnabled: boolean;
  public voicemailSection = {
    title: 'hercules.settings.voicemail.heading',
    };

 private voicemail: boolean;
 private OrgId: string;

  /* @ngInject */
  constructor(
    private Notification,
    private UCCService,
    private Authinfo,
) {}

  public $onInit() {
    this.OrgId=this.Authinfo.getOrgId();
    this.UCCService.getOrgVoicemailConfiguration(this.OrgId).then((data)=>{
      switch(data.orgVoicemailStatus) {
        case 'ENABLED':
          this.voicemail=true;
        case 'DISABLED':
          this.voicemail=false;
        default:
          this.voicemail=true;
      }
        }).catch((data)=>{
        console.log(data)
        })
  }

  public $onChanges() {

  }

public change = () => {
  console.log('change');
  this.Notification.success('hercules.settings.voicemail.successDescription');
  }

public deactivateVoicemail =  _.debounce(value => {
  if (value === false) {
    this.UCCService.setOrgVoicemailConfiguration(true, this.OrgId).then(() => {
      this.Notification.success('hercules.settings.voicemail.enableDescription');
    });
    } else {
    this.UCCService.setOrgVoicemailConfiguration(false, this.OrgId).then(() => {
      this.Notification.success('hercules.settings.voicemail.disableDescription');
      })
        }
   }, 2000, {
      leading: true,
     trailing: false,
  });
}

class HybridVoicemailSectionComponent implements ng.IComponentOptions {
  public controller = HybridVoicemailCtrl;
  public templateUrl = 'modules/hercules/service-settings/voicemail-settings-section/voicemail-settings.html';
  public bindings = {
    isCallServiceConnectEnabled: '<',
  };
}

export default angular
  .module('Hercules')
  .component('hybridVoicemailSettings', new HybridVoicemailSectionComponent())
  .name;
