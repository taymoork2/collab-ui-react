var getUserInfoXMLRequest = "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
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
  "</serv:message>";

var getSiteInfoXMLRequest = "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
  "    <header>\n" +
  "        <securityContext>\n" +
  "            <webExID>{{webexAdminID}}</webExID>" +
  "            <password>{{webexAdminPswd}}</password>" +
  "            <siteID>{{siteID}}</siteID>" +
  "            <partnerID>{{partnerID}}</partnerID>" +
  "        </securityContext>\n" +
  "    </header>\n" +
  "    <body>\n" +
  "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSite\" />\n" +
  "    </body>\n" +
  "</serv:message>";

var getMeetingTypeInfoXMLRequest = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n" +
  "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
  "    <header>\n" +
  "        <securityContext>\n" +
  "            <webExID>{{webexAdminID}}</webExID>" +
  "            <password>{{webexAdminPswd}}</password>" +
  "            <siteID>{{siteID}}</siteID>" +
  "            <partnerID>{{partnerID}}</partnerID>" +
  "        </securityContext>\n" +
  "    </header>\n" +
  "    <body>\n" +
  "<bodyContent " +
  "    xsi:type=\"java:com.webex.service.binding.meetingtype.LstMeetingType\">\r\n" +
  "</bodyContent>" +
  "    </body>\n" +
  "</serv:message>";
