const constants = {
  siteInfoRequest: "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
    "    <header>" +
    "        <securityContext>" +
    "            <webExID>{{webexAdminID}}</webExID>" +
    "            <password>{{webexAdminPswd}}</password>" +
    "            <siteID>{{siteID}}</siteID>" +
    "            <partnerID>{{partnerID}}</partnerID>" +
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
    "            <partnerID>{{partnerID}}</partnerID>" +
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
    "            <partnerID>{{partnerID}}</partnerID>" +
    "        </securityContext>" +
    "    </header>" +
    "    <body>" +
    "        <bodyContent xsi:type=\"java:com.webex.service.binding.meetingtype.LstMeetingType\" />" +
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
