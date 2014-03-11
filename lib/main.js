var widget = require("sdk/widget").Widget({
  id: "standalone-widget",
  label: "Install Current Page as App",
  contentURL: 'chrome://global/skin/icons/webapps-16.png'
})

widget.on('click', function() {
  var tab = require('sdk/tabs').activeTab
  createManifestJSONForTab(tab, function(manifestObj) {
    installAppFromManifestObj(manifestObj)
  })
})

function createManifestJSONForTab(tab, cb) {
  let { getFavicon } = require("sdk/places/favicon")
  getFavicon(tab).then(function (faviconURL) {
    console.log(faviconURL)
    cb({
      //"version": "1",
      "name": tab.title, // TODO: shorten to 128
      "launch_path": require('sdk/url').URL(tab.url).path,
      "url": tab.url,
      "description": "Standalone: Your Web as an App.",
      "icons": {
        "16": faviconURL
      }
    })
  })
}

function installAppFromManifestObj(obj) {
  const {Cc, Ci, Cu, Cm} = require('chrome')
  Cu.import("resource://gre/modules/WebappsInstaller.jsm")
  var installParam = {
    app: {
      manifest: obj,
      origin: obj.url,
      installOrigin: obj.url,
      manifestURL: obj.url,
      categories: []
    }
  }
 
  var app = WebappsInstaller.init(installParam);
  WebappsInstaller.install(installParam, obj).then(function success() {
    // NOTIFY
    console.log('success!')
  })

  // Hack.
  // If the app is not listed in the webapps registry,
  // WebRT will not set up the <browser> such that the content
  // behaves like an app.
  // Eg: _blank links don't open in default browser, etc.
  var path = require('sdk/system').pathFor('ProfD'),
      filePath = require('sdk/io/file').join(path, 'webapps', 'webapps.json'),
      registry = JSON.parse(readTextFromFile(filePath))
  registry[Date.now()] = installParam.app
  writeTextToFile(JSON.stringify(registry), filePath)
}

function readTextFromFile(filename) {
  var fileIO = require("sdk/io/file");
  var text = null;
  if (fileIO.exists(filename)) {
    var TextReader = fileIO.open(filename, "r");
    if (!TextReader.closed) {
      text = TextReader.read();
      TextReader.close();
    }
  }
  return text;
}

function writeTextToFile(text, filename) {
  var fileIO = require("sdk/io/file")
  var TextWriter = fileIO.open(filename, "w")
  if (!TextWriter.closed) {
    TextWriter.write(text)
    TextWriter.close()
  }
}
