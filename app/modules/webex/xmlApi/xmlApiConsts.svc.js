(function() {
  'use strict';

  angular.module('WebExApp').service(
    'WebExXmlApiConstsSvc', WebExXmlApiConstsSvc);

  function WebExXmlApiConstsSvc() {
    return {
      siteVersionRequest: "" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.ep.GetAPIVersion\">" + "\n" +
        "          <returnTrainReleaseVersion>true</returnTrainReleaseVersion>" + "\n" +
        "        </bodyContent>" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      siteInfoRequest: "" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSite\" />" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      userInfoRequest: "" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.GetUser\">" + "\n" +
        "            <webExId>{{webexUserId}}</webExId>" + "\n" +
        "        </bodyContent>" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      meetingTypeInfoRequest: "" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.meetingtype.LstMeetingType\" />" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      settingPagesInfoRequest: "" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSiteAdminNavUrl\">" + "\n" +
        "          <type>siteConfig</type>" + "\n" +
        "        </bodyContent>" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      reportPagesInfoRequest: "" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSiteAdminNavUrl\">" + "\n" +
        "          <type>report</type>" + "\n" +
        "        </bodyContent>" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      enableT30UnifiedAdminInfoRequest: "" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSiteAdminNavUrl\">" + "\n" +
        "          <type>getEnableT30UnifiedAdmin</type>" + "\n" +
        "        </bodyContent>" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      updateUserSettings_1: "" +
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "\n" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" + "\n" +
        "    xmlns:serv=\"http://www.webex.com/schemas/2002/06/service\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.SetUser\">" + "\n" +
        "            <webExId>{{webexUserId}}</webExId>" + "\n" +
        "            <use:meetingTypes>" + "\n",

      updateUserSettings_2: "" +
        "                <use:meetingType>{{meetingType}}</use:meetingType>" + "\n",

      updateUserSettings_3: "" +
        "            </use:meetingTypes>" + "\n" +
        "            <use:supportedServices>" + "\n" +
        "                <use:meetingCenter>{{meetingCenter}}</use:meetingCenter>" + "\n" +
        "                <use:trainingCenter>{{trainingCenter}}</use:trainingCenter>" + "\n" +
        "                <use:supportCenter>{{supportCenter}}</use:supportCenter>" + "\n" +
        "                <use:eventCenter>{{eventCenter}}</use:eventCenter>" + "\n" +
        "                <use:salesCenter>{{salesCenter}}</use:salesCenter>" + "\n" +
        "            </use:supportedServices>" + "\n" +
        "        </bodyContent>" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      sessionTicketRequest: "" +
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
        "    <header>" + "\n" +
        "        <securityContext>" + "\n" +
        "            <siteName>{{wbxSiteName}}</siteName> " + "\n" +
        "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
        "        </securityContext>" + "\n" +
        "    </header>" + "\n" +
        "    <body>" + "\n" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.AuthenticateUser\">" + "\n" +
        "            <accessToken>{{accessToken}}</accessToken>" + "\n" +
        "        </bodyContent>" + "\n" +
        "    </body>" + "\n" +
        "</serv:message>" + "\n",

      flushWafCacheRequest: "" +
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
        "<serv:message xmlns:serv=\"http://www.webex.com/schemas/2002/06/service\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.webex.com/schemas/2002/06/service   http://www.webex.com/schemas/2002/06/service/service.xsd\">" +
        "   <header>" +
        "      <securityContext>" +
        "         <webExID>{{webexAdminID}}</webExID>" +
        "         <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" +
        "         <siteName>{{webexSiteName}}</siteName>" +
        "      </securityContext>" +
        "   </header>" +
        "   <body>" +
        "      <bodyContent xsi:type=\"java:com.webex.service.binding.ep.FlushWebCache\" />" +
        "   </body>" +
        "</serv:message>",

      replaceSets: [{
          replaceThis: /<ep:/g,
          withThis: "<ep_"
        }, {
          replaceThis: /<\/ep:/g,
          withThis: "</ep_"
        }, {
          replaceThis: /<ns1:/g,
          withThis: "<ns1_"
        }, {
          replaceThis: /<\/ns1:/g,
          withThis: "</ns1_"
        }, {
          replaceThis: /<serv:/g,
          withThis: "<serv_"
        }, {
          replaceThis: /<\/serv:/g,
          withThis: "</serv_"
        }, {
          replaceThis: /<use:/g,
          withThis: "<use_"
        }, {
          replaceThis: /<\/use:/g,
          withThis: "</use_"
        }, {
          replaceThis: /<com:/g,
          withThis: "<com_"
        }, {
          replaceThis: /<\/com:/g,
          withThis: "</com_"
        }, {
          replaceThis: /<mtgtype:/g,
          withThis: "<mtgtype_"
        }, {
          replaceThis: /<\/mtgtype:/g,
          withThis: "</mtgtype_"
        }] // replaceSets[]
    }; // return
  } // XmlApiConstants
})();