# android-sign
Signing Android application from node

#Usage

**CLI**
```bash
$ npm install -g android-sign
$ android-sign --apk [full_path_to_apk.apk] --signkey [full_path_to_signkey.keystore] --password [signkey_password] --alias [signkey_alias] --output [full_output_path_folder/your_application.apk]
```

**API**
```bash
npm install --save android-sign
```
```javascript
var sign = require('android-sign');
var isSigned = sign({
  "apk":"full_path_to_apk.apk",
  "signkey": "full_path_to_signkey.keystore",
  "password" : "signkey_password",
  "alias" : "signkey_alias",
  "output" : "full_output_path_folder/your_application.apk"
});
```
