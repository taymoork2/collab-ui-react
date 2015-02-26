(function() {
	'use strict';

	angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', ['$scope', '$http',
	function($scope, $http) {
		this.xml2JsonConvert = function(commentText, xmlDataText, startOfBodyStr, endOfBodyStr) {
			var funcName = "xml2JsonConvert()";
			var logMsg = "";

			logMsg = funcName + ": " + commentText + "\n" + "startOfBodyStr=" + startOfBodyStr + "\n" + "endOfBodyStr=" + endOfBodyStr;
			// alert(logMsg);
			console.log(logMsg);

			// logMsg = funcName + ": " + commentText +
			// "\n" +
			// "xmlDataText=" + xmlDataText;
			// console.log(logMsg);

			var startOfBodyIndex = xmlDataText.indexOf(startOfBodyStr);
			var endOfBodyIndex = (null == endOfBodyStr) ? 0 : xmlDataText.indexOf(endOfBodyStr);

			logMsg = funcName + ": " + commentText + "\n" + "startOfBodyIndex=" + startOfBodyIndex + "\n" + "endOfBodyIndex=" + endOfBodyIndex;
			// alert(logMsg);
			console.log(logMsg);

			var regExp = null;
			var bodySlice = (startOfBodyIndex < endOfBodyIndex) ? xmlDataText.slice(startOfBodyIndex, endOfBodyIndex) : xmlDataText.slice(startOfBodyIndex);

			regExp = /<ns1:/g;
			bodySlice = bodySlice.replace(regExp, "<ns1_");

			regExp = /<\/ns1:/g;
			bodySlice = bodySlice.replace(regExp, "</ns1_");

			regExp = /<serv:/g;
			bodySlice = bodySlice.replace(regExp, "<serv_");

			regExp = /<\/serv:/g;
			bodySlice = bodySlice.replace(regExp, "</serv_");

			regExp = /<use:/g;
			bodySlice = bodySlice.replace(regExp, "<use_");

			regExp = /<\/use:/g;
			bodySlice = bodySlice.replace(regExp, "</use_");

			regExp = /<com:/g;
			bodySlice = bodySlice.replace(regExp, "<com_");

			regExp = /<\/com:/g;
			bodySlice = bodySlice.replace(regExp, "</com_");

			bodySlice = "<body>" + bodySlice + "</body>";

			logMsg = funcName + ": " + commentText + "\n" + "bodySlice=\n" + bodySlice;
			console.log(logMsg);

			var x2js = new X2JS();
			var bodyJson = x2js.xml_str2json(bodySlice);

			logMsg = funcName + ": " + commentText + "\n" + "bodyJson=\n" + JSON.stringify(bodyJson);
			console.log(logMsg);

			return bodyJson;
		};
		// xml2JsonConvert()

		this.updateUserPrivileges = function() {
			var funcName = "updateUserPrivileges()";
			var logMsg = null;

			var currView = this;
			var userPrivileges = currView.userPrivileges;
			var userDataXml = currView.userDataXml;
			var userDataJson = currView.userDataJson;

			logMsg = funcName + ": " + "\n" + "userDataJson=\n" + JSON.stringify(userDataJson);
			// alert(logMsg);
			console.log(logMsg);

			var firstName = userDataJson.body.use_firstName;
			var lastName = userDataJson.body.use_lastName;

			logMsg = funcName + ": " + "\n" + "User Name=" + firstName + " " + lastName;
			// alert(logMsg);
			console.log(logMsg);

			var meetingTypes = userDataJson.body.use_meetingTypes.use_meetingType;

			logMsg = funcName + ": " + "\n" + "Meeting Types=[" + meetingTypes + "]";
			// alert(logMsg);
			console.log(logMsg);

			userPrivileges.label = "Services";
			$("#webexUserSettingsPage").removeClass("hidden");
		};
		// updateUserPrivileges()

		this.getUserData = function() {
			var funcName = "getUserData()";
			var logMsg = "";

			var currView = this;
			var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";
			var webExID = "jpallapa";
			// Host username
			var password = "C!sco123";
			// Host password
			var siteID = "4272";
			// Site ID
			var partnerID = "4272";
			// Partner ID

			var reqXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "    <header>" + "        <securityContext>" + "            <webExID>" + webExID + "</webExID>" + "            <password>" + password + "</password>" + "            <siteID>" + siteID + "</siteID>" + "            <partnerID>" + partnerID + "</partnerID>" + "        </securityContext>" + "    </header>" + "    <body>" + "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.GetUser\">" + "            <webExId>jpallapa</webExId>" + "        </bodyContent>" + "    </body>" + "</serv:message>";

			$http({
				url : xmlServerURL,
				method : "POST",
				data : reqXML,
				headers : {
					'Content-Type' : 'application/x-www-rform-urlencoded'
				}
			}).success(function(data) {
				currView.userDataXml = $(data);

				// TODO: add code to
				// validate
				// currView.userDataXml

				currView.userDataJson = currView.xml2JsonConvert("User Data", data, "<use:", "</serv:bodyContent>");
				currView.updateUserPrivileges();
			}).error(function(data) {
				logMsg = funcName + ".error()" + ": " + "\n" + "data=" + data;
				alert(logMsg);
			});
		};
		// getUserData()

		this.getSiteInfo = function() {
			var funcName = "getSiteInfo()";
			var logMsg = "";

			var currView = this;

			var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";
			var reqXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

			var siteID = "4272";
			// Site ID
			var partnerID = "4272";
			// Partner ID
			var webExID = "jpallapa";
			// Host username
			var password = "C!sco123";
			// Host password

			reqXML = "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" + "    <header>\n" + "        <securityContext>\n" + "            <webExID>" + webExID + "</webExID>\n" + "            <password>" + password + "</password>\n" + "            <siteID>" + siteID + "</siteID>\n" + "            <partnerID>" + partnerID + "</partnerID>\n" + "            <email>jpallapa@cisco.com</email>\n" + "        </securityContext>\n" + "    </header>\n" + "    <body>\n" + "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSite\" />\n" + "    </body>\n" + "</serv:message>";

			$http({
				url : xmlServerURL,
				method : "POST",
				data : reqXML,
				headers : {
					'Content-Type' : 'application/x-www-rform-urlencoded'
				}
			}).success(function(data) {
				currView.siteInfoXml = $(data);

				// TODO: add code to
				// validate
				// currView.siteInfoXml

				currView.siteInfoJson = currView.xml2JsonConvert("Site Info", data, "<ns1:", "</serv:bodyContent>");
				currView.initUserPrivilegesTemplate();
				currView.getUserData();
			}).error(function() {
				logMsg = funcName + ".error()" + ": " + "\n" + "data=" + data;
				alert(logMsg);
			});
		};
		// getSiteInfo()

		this.initUserPrivilegesTemplate = function() {
			var funcName = "initUserPrivilegesTemplate()";
			var logMsg = "";

			var userPrivileges = {
				webexCenters : [{
					centerName : "Meeting Center",

					sessionTypes : [{
						id : "MeetingCenter-STD",
						sessionName : "STD",
						sessionEnabled : false,
						sessionDescription : "Meeting Center Standard"
					}, {
						id : "MeetingCenter-PRO",
						sessionName : "PRO",
						sessionEnabled : false,
						sessionDescription : "Meeting Center Pro"
					}]
				}, {
					centerName : "Event Center",

					sessionTypes : [{
						id : "EventCenter-STD",
						sessionName : "STD",
						sessionEnabled : false,
						sessionDescription : "Event Center Standard"
					}, {
						id : "EventCenter-PRO",
						sessionName : "PRO",
						sessionEnabled : false,
						sessionDescription : "Event Center Pro"
					}]
				}, {
					centerName : "Training Center",

					sessionTypes : [{
						id : "TrainingCenter-STD",
						sessionName : "STD",
						sessionEnabled : false,
						sessionDescription : "Training Center Standard"
					}, {
						id : "TrainingCenter-PRO",
						sessionName : "PRO",
						sessionEnabled : false,
						sessionDescription : "Training Center Pro"
					}]
				}], // webexCenters

				/*
				 * general: { label: "General",
				 *
				 * recordingEditor: { id:
				 * "recordingEditor", label: "Recording
				 * Editor", value: true },
				 *
				 * personalRoom: { id: "personalRoom",
				 * label: "Personal Room", value: true },
				 *
				 * collabRoom: { id: "collabRoom",
				 * label: "Collabration Room", value:
				 * true },
				 *
				 * hiQualVideo: { id: "hiQualVideo",
				 * label: "Turn on high-quality video
				 * (360p)", value: true },
				 *
				 * hiDefVideo: { id: "hiDefVideo",
				 * label: "Turn on high-definition video
				 * video (720p)", value: true },
				 *
				 * assist: { id: "assist", label:
				 * "Assist", value: true } }, // general
				 *
				 * trainingCenter: { label: "Training
				 * Center",
				 *
				 * handsOnLabAdmin: { id:
				 * "handsOnLabAdmin", label: "Hands-on
				 * Lab Admin (effective only when
				 * hands-on lab is enabled)", value:
				 * true } }, // trainingCenter
				 *
				 * eventCenter: { label: "Event Center",
				 *
				 * optimizeBandwidthUsage: { id:
				 * "optimizeBandwidthUsage", label:
				 * "Optimized bandwidth usage for
				 * attendees within the same network",
				 * value: true } }, // eventCenter
				 *
				 * telephonyPriviledge: { label:
				 * "Telephony Privilege",
				 *
				 * callInTeleconf: { id:
				 * "callInTeleconf", label: "Call-in
				 * teleconferencing", value: true,
				 * currCallInTollType: 2,
				 *
				 * callInTollTypes: [ { id: "toll",
				 * label: "Toll", value: 0 }, { id:
				 * "tollFree", label: "Toll free",
				 * value: 1 }, { id: "tollAndTollFree",
				 * label: "Toll and Toll free", value: 2 } ],
				 *
				 * teleconfViaGlobalCallin: { id:
				 * "teleconfViaGlobalCallin", label:
				 * "Allow access to teleconference via
				 * global call-in numbers", value: true },
				 *
				 * cliAuth: { id: "cliAuth", label:
				 * "Enable teleconferencing CLI
				 * authentication", value: true },
				 *
				 * pinEnabled: { id: "pinEnabled",
				 * label: "Host and attendees must have
				 * PIN enabled", value: true } }, //
				 * callInTeleconf
				 *
				 * callBackTeleconf: { id:
				 * "callBackTeleconf", label: "Call-back
				 * teleconferencing", value: true },
				 *
				 * globalCallBackTeleconf: { id:
				 * "globalCallBackTeleconf", label:
				 * "Global call-back teleconferencing",
				 * value: true },
				 *
				 * otherTeleconfServices: { id:
				 * "otherTeleconfServices", label:
				 * "Other teleconference services",
				 * value: true },
				 *
				 * integratedVoIP: { id:
				 * "integratedVoIP", label: "Integrated
				 * VoIP", value: true },
				 *
				 * selectTeleconfLocation: { id:
				 * "selectTeleconfLocation", label:
				 * "Select teleconferencing location",
				 * value: true, defaultTeleconfLocation:
				 * "Asia",
				 *
				 * teleconfLocations: ["North America",
				 * "South America", "Asia", "Africa",
				 * "Australia"] } //
				 * selectTeleconfLocation }, //
				 * telephonyPriviledges
				 */

				label : null
			};
			// userPrivileges

			this.userPrivileges = userPrivileges;
		};
		// initUserPrivilegesTemplate()

		this.updateUserSettings = function() {
			alert("updateUserSettings(): START");
			alert("updateUserSettings(): END");
		};
		// updateUserSettings()

		this.userPrivileges = null;
		this.userDataXml = null;
		this.userDataJson = null;
		this.siteInfoXml = null;
		this.siteInfoJson = null;

		this.getSiteInfo();
	}
	// WebExUserSettingsCtrl()
	]);
})();
