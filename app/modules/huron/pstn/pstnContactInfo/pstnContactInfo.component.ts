export class PstnContactInfoComponent implements ng.IComponentOptions {
  public controller = PstnProvidersCtrl;
  public templateUrl = 'modules/huron/pstn/pstnContactInfo/pstnContactInfo.html';
  public bindings = {
    // contact should be an object with properties companyName, firstName, lastName and emailAddress
    contact: '<',
  };
}

export class PstnProvidersCtrl implements ng.IComponentController {

}
