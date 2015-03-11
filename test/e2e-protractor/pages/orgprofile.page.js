'use strict';

var OrgProfilePage = function () {
  this.supportForm = element(by.name('supportForm'));
  this.orgProfilePageTitle = element(by.id('orgProfilePageTitle'));
  this.orgProfileSaveBtn = element(by.id('orgProfileSaveBtn'));
  this.orgProfileCancelBtn = element(by.id('orgProfileCancelBtn'));
  this.companyInfoPanel = element(by.id('companyInfoPanel'));
  this.ciscoRepPanel = element(by.id('ciscoRepPanel'));
  this.troubleReportingPanel = element(by.id('troubleReportingPanel'));
  this.troubleReportingCiscoPanel = element(by.id('troubleReportingCiscoPanel'));
  this.troubleReportingPartnerPanel = element(by.id('troubleReportingPartnerPanel'));
  this.helpPanel = element(by.id('helpPanel'));
  this.helpCiscoPanel = element(by.id('helpCiscoPanel'));
  this.helpPartnerPanel = element(by.id('helpPartnerPanel'));

  this.troubleReportingPartnerPanelRadio = element(by.id('troubleReportingPartnerPanelRadio'));
  this.partnerSupportUrl = element(by.id('partnerSupportUrl'));
  this.partnerSupportText = element(by.id('partnerSupportText'));
  this.helpPartnerPanelRadio = element(by.id('helpPartnerPanelRadio'));
  this.partnerHelpUrl = element(by.id('partnerHelpUrl'));
};

module.exports = OrgProfilePage;
