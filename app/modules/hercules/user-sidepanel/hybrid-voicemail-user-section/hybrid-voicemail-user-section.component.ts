class HybridVoicemailUserSectionCtrl implements ng.IComponentController {

  public callServiceConnectEnabledForUser: boolean;
  private isEnabledOrgWide: boolean;

  /* @ngInject */
  constructor( ) {
    console.log('component: ', this.callServiceConnectEnabledForUser);
  }

  public $onInit() {
    this.isEnabledOrgWide = this.checkEnabledOrgWide();
  }

  public checkEnabledOrgWide(): boolean {
    return true;
  }


}


export class HybridVoicemailUserSectionComponent implements ng.IComponentOptions {
  public controller = HybridVoicemailUserSectionCtrl;
  public templateUrl = 'modules/hercules/user-sidepanel/hybrid-voicemail-user-section/hybrid-voicemail-user-section.html';
  public bindings = {
    callServiceConnectEnabledForUser: '<',
  };
}
