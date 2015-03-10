'use strict';

var fs = require('fs');

var args = process.argv;
var writePath = args[3];
var jsonFile = args[2];

//console.log('reading json file: ' + jsonFile);
//console.log('writing files to: ' + writePath);

function createAppJS(modules) {
	var appContent = "'use strict';\n";
	appContent += 'angular\n';
	appContent += "  .module('angularApp', [\n";
	if(modules){
		for (var i = 0; i < modules.length-1; i++) {
	    appContent += "    '" + modules[i] + "',\n";
		}
		appContent += "    '" + modules[modules.length-1] + "'\n";
	}
	appContent += '  ]);\n';

	//console.log('app.js content: ' + appContent);

	fs.writeFile(writePath + '/app.js', appContent, function(err) {
	  if(err) {
	    //console.log(err);
	  } else {
	    //console.log('Created app.js file.');
	  }
	});
}

function createAppConfigJS(routes) {
	var configContent = "'use strict';\n";
	configContent += 'angular\n';
	configContent += "  .module('angularApp')\n";
	configContent += "  .config(['$routeProvider', '$translateProvider',\n";
	configContent += '    function($routeProvider, $translateProvider) {\n';
	configContent += '    $routeProvider\n';
	if (routes && routes.paths){
		var paths = routes.paths;
		for (var i = 0; i < paths.length; i++) {
			configContent += "      .when('" + paths[i].path + "', {\n";
			if (paths[i].templateUrl) {
				configContent += "        templateUrl: '" + paths[i].templateUrl + "'";
			}
			if (paths[i].controller){
				configContent += ",\n"
				configContent += "        controller: '" + paths[i].controller + "'\n";
			}
			else {
				configContent += "\n"
			}
			configContent += '      })\n';
		}
	}
  if (routes && routes.defaultRoute){
		configContent += '      .otherwise({\n';
		configContent += "        redirectTo: '" + routes.defaultRoute + "'\n";
		configContent += '      });\n';
	}
	configContent += '\n';

	configContent += '$translateProvider.useStaticFilesLoader({\n';
	configContent += "   prefix: 'l10n/',\n";
	configContent += "   suffix: '.json'\n";
	configContent += '});\n\n';

	configContent += ' //Tell the module what language to use by default\n';
	configContent += '$translateProvider.preferredLanguage("en_US");\n';

	configContent += '  }]);\n';

	//console.log('appconfig.js content: ' + configContent);

	fs.writeFile(writePath + '/appconfig.js', configContent, function(err) {
	  if(err) {
	    //console.log(err);
	  } else {
	    //console.log('Created appconfig.js file.');
	  }
	});
}

fs.readFile(jsonFile, 'utf8', function (err, data) {
  if (err) {
    //console.log('Error reading JSON file: ' + err);
    return;
  }

  data = JSON.parse(data);
  //console.dir(data);

  if (data.modules){
		createAppJS(data.modules);
  }
  if (data.routes){
		createAppConfigJS(data.routes);
  }
});
