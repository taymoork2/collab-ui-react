'use strict';

angular.module('WebExUserSettings')
  .service('XmlApiSvc', [
    function XmlApiConstants() {
      return {
        siteInfoRequest: "" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
          "    <header>" + "\n" +
          "        <securityContext>" + "\n" +
          "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
          "            <password>{{webexAdminPswd}}</password>" + "\n" +
          "            <siteID>{{siteID}}</siteID>" + "\n" +
          "        </securityContext>" + "\n" +
          "    </header>" + "\n" +
          "    <body>" + "\n" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSite\" />" + "\n" +
          "    </body>" + "\n" +
          "</serv:message>",

        userInfoRequest: "" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
          "    <header>" + "\n" +
          "        <securityContext>" + "\n" +
          "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
          "            <password>{{webexAdminPswd}}</password>" + "\n" +
          "            <siteID>{{siteID}}</siteID>" + "\n" +
          "        </securityContext>" + "\n" +
          "    </header>" + "\n" +
          "    <body>" + "\n" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.GetUser\">" + "\n" +
          "            <webExId>{{webexUserId}}</webExId>" + "\n" +
          "        </bodyContent>" + "\n" +
          "    </body>" + "\n" +
          "</serv:message>",

        meetingTypeInfoRequest: "" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
          "    <header>" + "\n" +
          "        <securityContext>" + "\n" +
          "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
          "            <password>{{webexAdminPswd}}</password>" + "\n" +
          "            <siteID>{{siteID}}</siteID>" + "\n" +
          "        </securityContext>" + "\n" +
          "    </header>" + "\n" +
          "    <body>" + "\n" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.meetingtype.LstMeetingType\" />" + "\n" +
          "    </body>" + "\n" +
          "</serv:message>",

        updateUserSettings1: "" +
          "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "\n" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" + "\n" +
          "    xmlns:serv=\"http://www.webex.com/schemas/2002/06/service\">" + "\n" +
          "    <header>" + "\n" +
          "        <securityContext>" + "\n" +
          "            <siteID>{{siteID}}</siteID>" + "\n" +
          "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
          "            <password>{{webexAdminPswd}}</password>" + "\n" +
          "        </securityContext>" + "\n" +
          "    </header>" + "\n",

        updateUserSettings2: "" +
          "    <body>" + "\n" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.SetUser\">" + "\n" +
          "            <webExId>{{webexUserId}}</webExId>",

        updateUserSettings3_1: "" +
          "            <use:meetingTypes>" + "\n",
        updateUserSettings3_2: "" +
          "                <use:meetingType>{{meetingType}}</use:meetingType>" + "\n",
        updateUserSettings3_3: "" +
          "            </use:meetingTypes>" + "\n",

        updateUserSettings4: "" +
          "            <use:supportedServices>" + "\n" +
          "                <use:meetingCenter>{{meetingCenter}}</use:meetingCenter>" + "\n" +
          "                <use:trainingCenter>{{trainingCenter}}</use:trainingCenter>" + "\n" +
          "                <use:supportCenter>{{supportCenter}}</use:supportCenter>" + "\n" +
          "                <use:eventCenter>{{eventCenter}}</use:eventCenter>" + "\n" +
          "                <use:salesCenter>{{salesCenter}}</use:salesCenter>" + "\n" +
          "            </use:supportedServices>" + "\n" +
          "        </bodyContent>" + "\n" +
          "    </body>" + "\n" +
          "</serv:message>",

        sessionTicketRequest: "" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "\n" +
          "    <header>" + "\n" +
          "        <securityContext>" + "\n" +
          "				<siteName>{{wbxSiteName}}</siteName> " + "\n" +
          "            	<webExID>{{webexAdminID}}</webExID>" + "\n" +
          "        </securityContext>" + "\n" +
          "    </header>" + "\n" +
          "    <body>" + "\n" +
          "			<bodyContent xsi:type=\"java:com.webex.service.binding.user.AuthenticateUser\">" + "\n" +
          "				<accessToken>{{accessToken}}</accessToken>" + "\n" +
          "			</bodyContent>" + "\n" +
          "    </body>" + "\n" +
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
      }; // return
    } // XmlApiConstants
  ]); // service
