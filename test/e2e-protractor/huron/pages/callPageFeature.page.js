export class CallPagingPage {
  constructor() {
    this.nameCpGroup = element(by.css('input[name="pagingGroupName"]'));
    this.cpGroupNumber = element(by.css('input#numberInput'));
    this.cpAutofillDropdown = element(by.css('li[role="option"]'));
    this.cpAddMember = element(by.css('input#memberInput'));
    this.allMembersRadio = element(by.css('label[for="membersonly"]'));
    this.customRadio = element(by.css('label[for="custom"]'));
    this.pgInitiatorInput = element(by.css('input#paging-group-initiator'));
    this.deleteCard = element.all(by.css('i.icon-exit')).first();
    this.deleteSecondCard = element.all(by.css('i.icon-exit')).get(1);
    this.closeModal = element.all(by.css('button.close')).first();
    this.addMembers = element(by.css('input#callfeaturememberadd'));
    this.memberSearch = element(by.css('input#callfeaturemembersearch'));
    this.memberSearchResult1 = element.all(by.cssContainingText('p.title', 'Mustafar')).first();
    this.memberSearchResult2 = element.all(by.cssContainingText('p.title', 'Mustafar')).last();
    this.allUsersRadio = element(by.css('label[for="public"]'));
    this.allGroupRadio = element(by.css('label[for="membersonly"]'));
    this.customRadio = element(by.css('label[for="custom"]'));
    this.deleteLastCard = element.all(by.css('i.icon-exit')).last();
    this.searchInitiator = element(by.css('input#search-initiator-box'));
    this.cancelFeatureCreation = element(by.css('button.close#close-panel'));
  }
};
