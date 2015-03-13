var buttons = require('sdk/ui/button/action');
var button = buttons.ActionButton({
  id: "standalone-button",
  label: "Install Current Page as App",
  icon: {
    "16": "chrome://global/skin/icons/webapps-16.png"
  }
})

button.on('click', function() {
  var tab = require('sdk/tabs').activeTab
  createManifestJSONForTab(tab, function(manifestObj) {
    installAppFromManifestObj(manifestObj, function(err) {
      // NOTIFY or something
      require("sdk/notifications").notify({
        title: 'Standalone',
        text: manifestObj.name + ' has been installed as an app',
        iconURL: manifestObj.icons[16]
      });
    })
  })
})

function createManifestJSONForTab(tab, cb) {
  var { getFavicon } = require("sdk/places/favicon")
  getFavicon(tab, function (faviconURL) {
    var launch_path = require('sdk/url').URL(tab.url).path,
        title = tab.title.replace(/[^a-zA-Z0-9]/g,''),
        url = tab.url
    var ret = {
      //"version": "1",
      "name": title, // TODO: shorten to 128
      "launch_path": launch_path,
      "url": url,
      "description": "Standalone: Your Web as an App.",
      "icons": {
        "16": faviconURL
      }
    } 
    cb(ret)
  })
}

function installAppFromManifestObj(obj, cb) {
  var app = {
    manifest: obj,
    origin: obj.url,
    installOrigin: obj.url,
    manifestURL: obj.url,
    categories: []
  }
 
  const {Cc, Ci, Cu, Cm} = require('chrome')
  Cu.import("resource://gre/modules/NativeApp.jsm")

  var nativeApp = new NativeApp(app, obj, [])
  nativeApp.createProfile()
  nativeApp.install(app, obj).then(cb)
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

