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
    this.closeModal = element.all(by.css('button.close')).first();
  }
};
