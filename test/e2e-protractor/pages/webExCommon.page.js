var WebExCommon = function () {
  this.testInfo = {
    describeCount: 0,
    testType: null,
    describeText: null
  };

  //Webex BTS sites
  //1. T30 CI unified with MC 25, CMR licensed
  //2. T30 CI unified with MC200 licensed
  //3. T30 CI unified with EC, TC, SC licensed (Enterprise Edition)
  //4. T31 CI unified with MC200, CMR licensed
  //5. T31 CI unified with MC25, CMR licensed
  //6. T31 CI unified with EC, TC, SC licensed (Enterprise Edition)

  //BTS 1 (reports)
  this.BTS1 = {
    siteUrl: 't30test-mc25.webex.com',
    testAdminUsername: 'provteam+mc25@csgtrials.webex.com',
    testAdminPassword: 'Cisco!23'
  };

  this.BTS1.siteElement = element(by.id(this.BTS1.siteUrl));
  this.BTS1.licenseID = element(by.id(this.BTS1.siteUrl + '_MC25-CMR1-license'));
  this.BTS1.isCIID = element(by.id(this.BTS1.siteUrl + '_isCI'));
  this.BTS1.reportsCog = element(by.id(this.BTS1.siteUrl + "_webex-site-reports"));
  this.BTS1.configCog = element(by.id(this.BTS1.siteUrl + "_webex-site-settings"));
  this.BTS1.cardSectionId = element(by.id(this.BTS1.siteUrl + "-cardsSection"));
  this.BTS1.csvIcon = element(by.id(this.BTS1.siteUrl + "_csvIcon"));
  this.BTS1.csvCogDisabled = element(by.id(this.BTS1.siteUrl + "_csvDisabled"));
  this.BTS1.csvCogEnabled = element(by.id(this.BTS1.siteUrl + "_csvEnabled"));
  this.BTS1.csvSpinner = element(by.id(this.BTS1.siteUrl + "_csvSpinner"));
  this.BTS1.csvResult = element(by.id(this.BTS1.siteUrl + "_csvResult"));

  //BTS 2 (single license)
  this.BTS2 = {
    siteUrl: 't30test-mc200.webex.com',
    testAdminUsername: 'provteam+mc@csgtrials.webex.com',
    testAdminPassword: 'Cisco!23'
  };

  this.BTS2.siteElement = element(by.id(this.BTS2.siteUrl));
  this.BTS2.licenseID = element(by.id(this.BTS2.siteUrl + '_MC200-license'));
  this.BTS2.isCIID = element(by.id(this.BTS2.siteUrl + '_isCI'));
  this.BTS2.reportsCog = element(by.id(this.BTS2.siteUrl + "_webex-site-reports"));
  this.BTS2.configCog = element(by.id(this.BTS2.siteUrl + "_webex-site-settings"));
  this.BTS2.cardSectionId = element(by.id(this.BTS2.siteUrl + "-cardsSection"));
  this.BTS2.csvIcon = element(by.id(this.BTS2.siteUrl + "_csvIcon"));
  this.BTS2.csvCogDisabled = element(by.id(this.BTS2.siteUrl + "_csvDisabled"));
  this.BTS2.csvCogEnabled = element(by.id(this.BTS2.siteUrl + "_csvEnabled"));
  this.BTS2.csvSpinner = element(by.id(this.BTS2.siteUrl + "_csvSpinner"));
  this.BTS2.csvResult = element(by.id(this.BTS2.siteUrl + "_csvResult"));

  //BTS 3 (configure)
  this.BTS3 = {
    siteUrl: 't30test-ee.webex.com',
    testAdminUsername: 'provteam+ee@csgtrials.webex.com',
    testAdminPassword: 'Cisco!23'
  };

  this.BTS3.siteElement = element(by.id(this.BTS3.siteUrl));
  this.BTS3.licenseID = element(by.id(this.BTS3.siteUrl + '_EE200-CMR25-license'));
  this.BTS3.isCIID = element(by.id(this.BTS3.siteUrl + '_isCI'));
  this.BTS3.reportsCog = element(by.id(this.BTS3.siteUrl + "_webex-site-reports"));
  this.BTS3.configCog = element(by.id(this.BTS3.siteUrl + "_webex-site-settings"));
  this.BTS3.cardSectionId = element(by.id(this.BTS3.siteUrl + "-cardsSection"));
  this.BTS3.csvIcon = element(by.id(this.BTS3.siteUrl + "_csvIcon"));
  this.BTS3.csvCogDisabled = element(by.id(this.BTS3.siteUrl + "_csvDisabled"));
  this.BTS3.csvCogEnabled = element(by.id(this.BTS3.siteUrl + "_csvEnabled"));
  this.BTS3.csvSpinner = element(by.id(this.BTS3.siteUrl + "_csvSpinner"));
  this.BTS3.csvResult = element(by.id(this.BTS3.siteUrl + "_csvResult"));

  //BTS 4 (reports)
  this.BTS4 = {
    siteUrl: 't30test-mc200-cmr.webex.com', //The sitename is misleading; its actually a T31 site
    testAdminUsername: 'provteam+mc200@csgtrials.webex.com',
    testAdminPassword: 'Cisco!23'
  };

  this.BTS4.siteElement = element(by.id(this.BTS4.siteUrl));
  this.BTS4.licenseID = element(by.id(this.BTS4.siteUrl + '_EE200-CMR25-license'));
  this.BTS4.isCIID = element(by.id(this.BTS4.siteUrl + '_isCI'));
  this.BTS4.reportsCog = element(by.id(this.BTS4.siteUrl + "_webex-site-reports"));
  this.BTS4.configCog = element(by.id(this.BTS4.siteUrl + "_webex-site-settings"));
  this.BTS4.cardSectionId = element(by.id(this.BTS4.siteUrl + "-cardsSection"));
  this.BTS4.csvIcon = element(by.id(this.BTS4.siteUrl + "_csvIcon"));
  this.BTS4.csvCogDisabled = element(by.id(this.BTS4.siteUrl + "_csvDisabled"));
  this.BTS4.csvCogEnabled = element(by.id(this.BTS4.siteUrl + "_csvEnabled"));
  this.BTS4.csvSpinner = element(by.id(this.BTS4.siteUrl + "_csvSpinner"));
  this.BTS4.csvResult = element(by.id(this.BTS4.siteUrl + "_csvResult"));

  //BTS 6 (configure)
  this.BTS6 = {
    siteUrl: 't31test-ee.webex.com',
    testAdminUsername: 'provteam+t31ee@csgtrials.webex.com',
    testAdminPassword: 'Cisco!23'
  };

  this.BTS6.siteElement = element(by.id(this.BTS6.siteUrl));
  this.BTS6.licenseID = element(by.id(this.BTS6.siteUrl + '_EE200-CMR25-license'));
  this.BTS6.isCIID = element(by.id(this.BTS6.siteUrl + '_isCI'));
  this.BTS6.reportsCog = element(by.id(this.BTS6.siteUrl + "_webex-site-reports"));
  this.BTS6.configCog = element(by.id(this.BTS6.siteUrl + "_webex-site-settings"));
  this.BTS6.cardSectionId = element(by.id(this.BTS6.siteUrl + "-cardsSection"));
  this.BTS6.csvIcon = element(by.id(this.BTS6.siteUrl + "_csvIcon"));
  this.BTS6.csvCogDisabled = element(by.id(this.BTS6.siteUrl + "_csvDisabled"));
  this.BTS6.csvCogEnabled = element(by.id(this.BTS6.siteUrl + "_csvEnabled"));
  this.BTS6.csvSpinner = element(by.id(this.BTS6.siteUrl + "_csvSpinner"));
  this.BTS6.csvResult = element(by.id(this.BTS6.siteUrl + "_csvResult"));

  /**
   * ********************* IMPORTANT *********************
   * The following account is a Dev DMZ User - To be deleted once BTS is ready.
   * Keep these tests disabled
   * ********************* IMPORTANT *********************
   */
  this.devDmzInfo = {
    siteUrl: 'sjsite04.webex.com',
    testAdminUsername: 'dev-dmz-e2e@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.devDmzInfo.siteElement = element(by.id(this.devDmzInfo.siteUrl));
  this.devDmzInfo.licenseID = element(by.id(this.devDmzInfo.siteUrl + '_MC200-MC25-license'));
  this.devDmzInfo.isCIID = element(by.id(this.devDmzInfo.siteUrl + '_isCI'));
  this.devDmzInfo.reportsCog = element(by.id(this.devDmzInfo.siteUrl + "_webex-site-reports"));
  this.devDmzInfo.configCog = element(by.id(this.devDmzInfo.siteUrl + "_webex-site-settings"));
  this.devDmzInfo.cardSectionId = element(by.id(this.devDmzInfo.siteUrl + "-cardsSection"));
  this.devDmzInfo.checkingServicesSpinner = element(by.id(this.devDmzInfo.siteUrl + "_checkingServicesSpinner"));
  this.devDmzInfo.csvIcon = element(by.id(this.devDmzInfo.siteUrl + "_csvIcon"));
  this.devDmzInfo.csvCogDisabled = element(by.id(this.devDmzInfo.siteUrl + "_csvDisabled"));
  this.devDmzInfo.csvCogEnabled = element(by.id(this.devDmzInfo.siteUrl + "_csvEnabled"));
  this.devDmzInfo.csvSpinner = element(by.id(this.devDmzInfo.siteUrl + "_csvSpinner"));
  this.devDmzInfo.csvResult = element(by.id(this.devDmzInfo.siteUrl + "_csvResult"));
  this.devDmzInfo.csvModalHeader = element(by.id("webexCsv-modalHeader"));
  this.devDmzInfo.csvModalBody = element(by.id("webexCsv-modalBody"));
  this.devDmzInfo.csvModalCloseButton = element(by.id("webexCsv-closeModalButton"));
  this.devDmzInfo.csvModalExportCard = element(by.id("webexCsv-exportCard"));
  this.devDmzInfo.csvModalExportIcon = element(by.id("webexCsv-exportIcon"));
  this.devDmzInfo.csvModalImportCard = element(by.id("webexCsv-importCard"));
  this.devDmzInfo.csvModalImportIcon = element(by.id("webexCsv-importIcon"));
  this.devDmzSiteElement = element(by.id(this.devDmzInfo.siteUrl));
};

module.exports = WebExCommon;
