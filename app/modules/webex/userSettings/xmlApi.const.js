'use strict';

angular.module('WebExUserSettings')
  .service('XmlApiConstants', [
    function XmlApiConstants() {
      return {
        siteInfoRequest: "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
          "    <header>" +
          "        <securityContext>" +
          "            <webExID>{{webexAdminID}}</webExID>" +
          "            <password>{{webexAdminPswd}}</password>" +
          "            <siteID>{{siteID}}</siteID>" +
          "        </securityContext>" +
          "    </header>" +
          "    <body>" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSite\" />" +
          "    </body>" +
          "</serv:message>",

        userInfoRequest: "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
          "    <header>" +
          "        <securityContext>" +
          "            <webExID>{{webexAdminID}}</webExID>" +
          "            <password>{{webexAdminPswd}}</password>" +
          "            <siteID>{{siteID}}</siteID>" +
          "        </securityContext>" +
          "    </header>" +
          "    <body>" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.GetUser\">" +
          "            <webExId>{{webexUserId}}</webExId>" +
          "        </bodyContent>" +
          "    </body>" +
          "</serv:message>",

        meetingTypeInfoRequest: "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
          "    <header>" +
          "        <securityContext>" +
          "            <webExID>{{webexAdminID}}</webExID>" +
          "            <password>{{webexAdminPswd}}</password>" +
          "            <siteID>{{siteID}}</siteID>" +
          "        </securityContext>" +
          "    </header>" +
          "    <body>" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.meetingtype.LstMeetingType\" />" +
          "    </body>" +
          "</serv:message>",

        updateUserPrivileges1: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" +
          "    xmlns:serv=\"http://www.webex.com/schemas/2002/06/service\">" +
          "    <header>" +
          "        <securityContext>" +
          "            <siteID>{{siteID}}</siteID>" +
          "            <webExID>{{webexAdminID}}</webExID>" +
          "            <password>{{webexAdminPswd}}</password>" +
          "        </securityContext>" +
          "    </header>",

        updateUserPrivileges2: "<body>" +
          "    <bodyContent xsi:type=\"java:com.webex.service.binding.user.SetUser\">" +
          "        <webExId>{{webexUserId}}</webExId>",

        updateUserPrivileges3_1: "            <use:meetingTypes>",
        updateUserPrivileges3_2: "                <use:meetingType>{{meetingType}}</use:meetingType>",
        updateUserPrivileges3_3: "            </use:meetingTypes>",

        updateUserPrivileges4: "            <use:supportedServices>" +
          "                <use:meetingCenter>{{meetingCenter}}</use:meetingCenter>" +
          "                <use:trainingCenter>{{trainingCenter}}</use:trainingCenter>" +
          "                <use:supportCenter>{{supportCenter}}</use:supportCenter>" +
          "                <use:eventCenter>{{eventCenter}}</use:eventCenter>" +
          "                <use:salesCenter>{{salesCenter}}</use:salesCenter>" +
          "            </use:supportedServices>" +
          "    </bodyContent>" +
          "</body>" +
          "</serv:message>",

        sessionTicketRequest: "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
          "    <header>" +
          "        <securityContext>" +
          "				<siteName>{{wbxSiteName}}</siteName> " +
          "            	<webExID>{{webexAdminID}}</webExID>" +
          "        </securityContext>" +
          "    </header>" +
          "    <body>" +
          "			<bodyContent xsi:type=\"java:com.webex.service.binding.user.AuthenticateUser\">" +
          "				<accessToken>{{accessToken}}</accessToken>" +
          "			</bodyContent>" +
          "    </body>" +
          "</serv:message>",

        replaceSets: [{
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
      }; // constants
    }
  ]);
