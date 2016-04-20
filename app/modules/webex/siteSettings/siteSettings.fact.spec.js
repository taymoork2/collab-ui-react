'use strict';

describe('WebExSiteSettingsFact Test', function () {
  var locale = "es_LA";
  var locale2 = "es-LA";
  var siteUrl = 'go.webex.com';
  var siteName = "go";
  var WebExXmlApiFact;

  beforeEach(module('WebExApp'));

  beforeEach(module(function ($provide) {
    var $stateParams = {
      'siteUrl': siteUrl
    };
    $provide.value('$stateParams', $stateParams);
  }));

  beforeEach(inject(function (
    _$q_,
    _$rootScope_,
    _WebExXmlApiFact_
  ) {

    var deferred = _$q_.defer();
    deferred.resolve();
    _$rootScope_.$apply();
    WebExXmlApiFact = _WebExXmlApiFact_;

    spyOn(WebExXmlApiFact, 'validateToken').and.returnValue(deferred.promise);

  }));

  it('can initialize the site settings', inject(function (WebExSiteSettingsFact) {
    var siteSettingsObj = WebExSiteSettingsFact.initSiteSettingsObj();

    expect(siteSettingsObj.viewReady).toBeDefined();
    expect(siteSettingsObj.viewReady).toEqual(false);

    expect(siteSettingsObj.hasLoadError).toBeDefined();
    expect(siteSettingsObj.hasLoadError).toEqual(false);

    expect(siteSettingsObj.sessionTicketError).toBeDefined();
    expect(siteSettingsObj.sessionTicketError).toEqual(false);

    expect(siteSettingsObj.viewReady).toBeDefined();
    expect(siteSettingsObj.viewReady).toEqual(false);

    expect(siteSettingsObj.viewReady).toBeDefined();
    expect(siteSettingsObj.viewReady).toEqual(false);

    expect(siteSettingsObj.errMsg).toBeDefined();
    expect(siteSettingsObj.errMsg).toEqual("");

    expect(siteSettingsObj.settingPagesInfo).toBeDefined();
    expect(siteSettingsObj.settingPagesInfo).toEqual(null);

    expect(siteSettingsObj.emailAllHostsBtnObj).toBeDefined();
    expect(siteSettingsObj.emailAllHostsBtnObj.id).toBeDefined();
    expect(siteSettingsObj.emailAllHostsBtnObj.pageObj).toBeDefined();
    expect(siteSettingsObj.emailAllHostsBtnObj.id).toEqual("emailAllHostsBtn");
    expect(siteSettingsObj.emailAllHostsBtnObj.pageObj).toEqual(null);

    expect(siteSettingsObj.siteInfoCardObj).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.id).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.label).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.id).toEqual("SiteInfo");
    expect(siteSettingsObj.siteInfoCardObj.label).toEqual(siteUrl);

    expect(siteSettingsObj.siteInfoCardObj.licensesTotal).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesTotal.id).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesTotal.count).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesTotal.id).toEqual("licensesTotal");
    expect(siteSettingsObj.siteInfoCardObj.licensesTotal.count).toEqual('---');

    expect(siteSettingsObj.siteInfoCardObj.licensesUsage).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesUsage.id).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesUsage.count).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesUsage.id).toEqual("licensesUsage");
    expect(siteSettingsObj.siteInfoCardObj.licensesUsage.count).toEqual('---');

    expect(siteSettingsObj.siteInfoCardObj.licensesAvailable).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesAvailable.id).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesAvailable.count).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.licensesAvailable.id).toEqual("licensesAvailable");
    expect(siteSettingsObj.siteInfoCardObj.licensesAvailable.count).toEqual('---');

    expect(siteSettingsObj.siteInfoCardObj.iframeLinkObj1).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.iframeLinkObj1.iconClass).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.iframeLinkObj1.iframePageObj).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.iframeLinkObj1.iframePageObj).toEqual(null);

    expect(siteSettingsObj.siteInfoCardObj.iframeLinkObj2).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.iframeLinkObj2.iconClass).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.iframeLinkObj2.iframePageObj).toBeDefined();
    expect(siteSettingsObj.siteInfoCardObj.iframeLinkObj2.iframePageObj).toEqual(null);

    expect(siteSettingsObj.siteSettingCardObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[0]).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[0].id).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[0].label).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[0].comment).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[0].pageObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[0].subSectionObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[0].id).toEqual("CommonSettings");
    expect(siteSettingsObj.siteSettingCardObjs[0].label).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[0].comment).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[0].pageObjs).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[0].subSectionObjs).toEqual([]);

    expect(siteSettingsObj.siteSettingCardObjs[1]).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[1].id).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[1].label).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[1].comment).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[1].pageObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[1].subSectionObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[1].id).toEqual("MC");
    expect(siteSettingsObj.siteSettingCardObjs[1].label).toEqual("Meeting Center");
    expect(siteSettingsObj.siteSettingCardObjs[1].comment).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[1].pageObjs).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[1].subSectionObjs).toEqual([]);

    expect(siteSettingsObj.siteSettingCardObjs[2]).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[2].id).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[2].label).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[2].comment).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[2].pageObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[2].subSectionObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[2].id).toEqual("TC");
    expect(siteSettingsObj.siteSettingCardObjs[2].label).toEqual("Training Center");
    expect(siteSettingsObj.siteSettingCardObjs[2].comment).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[2].pageObjs).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[2].subSectionObjs).toEqual([]);

    expect(siteSettingsObj.siteSettingCardObjs[3]).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].id).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].label).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].comment).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].pageObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].id).toEqual("SC");
    expect(siteSettingsObj.siteSettingCardObjs[3].label).toEqual("Support Center");
    expect(siteSettingsObj.siteSettingCardObjs[3].comment).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[3].pageObjs).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[0]).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[0].id).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[0].label).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[0].pageObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[0].id).toEqual("WebACD");
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[0].label).toEqual("WebACD");
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[0].pageObjs).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[1]).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[1].id).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[1].label).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[1].pageObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[1].id).toEqual("RA");
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[1].label).toEqual("Remote Access");
    expect(siteSettingsObj.siteSettingCardObjs[3].subSectionObjs[1].pageObjs).toEqual(null);

    expect(siteSettingsObj.siteSettingCardObjs[4]).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[4].id).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[4].label).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[4].comment).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[4].pageObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[4].subSectionObjs).toBeDefined();
    expect(siteSettingsObj.siteSettingCardObjs[4].id).toEqual("EC");
    expect(siteSettingsObj.siteSettingCardObjs[4].label).toEqual("Event Center");
    expect(siteSettingsObj.siteSettingCardObjs[4].comment).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[4].pageObjs).toEqual(null);
    expect(siteSettingsObj.siteSettingCardObjs[4].subSectionObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[0]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[0].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[0].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[0].id).toEqual("EMAIL");
    expect(siteSettingsObj.categoryObjs[0].pageObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs[1]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[1].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[1].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[1].id).toEqual("SiteInfo");
    expect(siteSettingsObj.categoryObjs[1].pageObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs[2]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[2].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[2].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[2].id).toEqual("CommonSettings");
    expect(siteSettingsObj.categoryObjs[2].pageObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs[3]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[3].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[3].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[3].id).toEqual("MC");
    expect(siteSettingsObj.categoryObjs[3].pageObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs[4]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[4].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[4].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[4].id).toEqual("EC");
    expect(siteSettingsObj.categoryObjs[4].pageObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs[5]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[5].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[5].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[5].id).toEqual("SC");
    expect(siteSettingsObj.categoryObjs[5].pageObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs[6]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[6].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[6].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[6].id).toEqual("TC");
    expect(siteSettingsObj.categoryObjs[6].pageObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs[7]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[7].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[7].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[7].id).toEqual("RA");
    expect(siteSettingsObj.categoryObjs[7].pageObjs).toEqual([]);

    expect(siteSettingsObj.categoryObjs[8]).toBeDefined();
    expect(siteSettingsObj.categoryObjs[8].id).toBeDefined();
    expect(siteSettingsObj.categoryObjs[8].pageObjs).toBeDefined();
    expect(siteSettingsObj.categoryObjs[8].id).toEqual("WebACD");
    expect(siteSettingsObj.categoryObjs[8].pageObjs).toEqual([]);

    expect(siteSettingsObj.siteUrl).toBeDefined();
    expect(siteSettingsObj.siteUrl).toEqual(siteUrl);

    expect(siteSettingsObj.siteName).toBeDefined();
    expect(siteSettingsObj.siteName).toEqual(siteName);
  }));

  it('can get a category', inject(function (WebExSiteSettingsFact) {
    WebExSiteSettingsFact.initSiteSettingsObj();
    var obj = WebExSiteSettingsFact.getCategoryObj("SiteInfo");
    expect(obj.id).toEqual("SiteInfo");
  }));

  xit('can update display information', inject(function (WebExSiteSettingsFact) {
    WebExSiteSettingsFact.initSiteSettingsObj();
    WebExSiteSettingsFact.updateDisplayInfo();

    //TODO: write this test
  }));
});
