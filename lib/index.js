import child_process from 'child_process';
import fs from 'fs';
import fop from 'fop';

export default function sign(settings) {
  
  settings.verbose = settings.verbose || false;
  
  let instance = {};
  
  instance.error = (err) => {
    return err;
  }

  instance.validate = (settings) => {
    
    if(settings.verbose) console.log("Validating settings");

    // check input apk path
    if(settings.apk == undefined || settings.apk == "")
      return new Error("APK path not defined");
    
    if(fs.accessSync(settings.apk, fs.R_OK) != undefined)
      return new Error("Cannot access APK path");
    
    // check signkey path
    if(settings.signkey == undefined || settings.signkey == "")
      return new Error("Signkey path not defined");
    
    if(fs.accessSync(settings.signkey, fs.R_OK) != undefined)
      return new Error("Cannot access Signkey path");
    
    // check password is defined
    if(settings.password == undefined || settings.password == "")
      return new Error("Password not defined");
    
    // check alias is defined
    if(settings.alias == undefined || settings.alias == "")
      return new Error("Alias not defined");
 
    // check outout apk path
    if(settings.output == undefined || settings.output == "")
      return new Error("Output Apk path not defined");

    let folder = fop(settings.output);
    if(fs.accessSync(folder, fs.W_OK) != undefined)
      return new Error("Cannot write on output folder");
  }

  instance.unsign = (settings) => {
    
    /* STEP 1
     * unsign package
     * zip -d <path/to/apk.apk> META-INF/\*
     */
    
    if(settings.verbose) console.log("Unsigning package");
    
    let child = child_process.spawnSync("zip", ["-d", settings.apk, "META-INF/\*"]);
    if(child.stderr && child.stderr.toString() !="") { 
      throw new Error(" "+child.stderr);
      return;
    }
  }

  instance.jarSign = (settings) => {
    
    /* STEP 2
     * jarsign package
     * jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore <path/to/signkey> -storepass <password> <path/to/apk.apk> <alias_name>
     */
    let params = ["-verbose", "-sigalg", "SHA1withRSA",
                  "-digestalg", "SHA1", 
                  "-keystore", settings.signkey,
                  "-storepass", settings.password, 
                  settings.apk, settings.alias];

    if(settings.verbose) console.log("Signing package");
    
    let child  = child_process.spawnSync("jarsigner", params);
    if(child.stderr && child.stderr.toString() !="") { 
      throw new Error(" "+child.stderr);
      return;
    }
    
    let output = child.stdout.toString();
    if(output.indexOf("jar signed")!= -1) return true;
    return output;
  }

  instance.verify = (settings) => {
    
    /* STEP 3
     * verify sign
     * jarsigner -verify -verbose -certs <path/signed.apk>
     */
    let params = ["-verify", "-verbose", "-certs", settings.apk];
    
    if(settings.verbose) console.log("Verifying package");

    let child  = child_process.spawnSync("jarsigner", params);
    if(child.stderr && child.stderr.toString() !="") { 
      throw new Error(" "+child.stderr);
      return;
    }
    let output = child.stdout.toString();
    if(output.indexOf("jar verified")!= -1) return true;
    return output;
  }

  instance.zipAlign = (settings) => {
    
    /* STEP 4
     * zipalign
     * zipalign -v 4 <path/to/signed.apk> <output.apk>
     */
    if(settings.verbose) console.log("Zipping package");
    
    let params = ["-v", "4", settings.apk, settings.output];
    
    let child  = child_process.spawnSync("zipalign", params);
    if(child.stderr && child.stderr.toString() !="") { 
      throw new Error(" "+child.stderr);
      return;
    }
    let output = child.stdout.toString();
    if(output.indexOf("Verification succesful") != -1) return true;
    return output;
  }

  instance.sign = (settings) => {
    
    let err = instance.validate(settings);
    if(err) return instance.error(err);
    
    try { instance.unsign(settings); }catch(e) {}
    
    let didSign = instance.jarSign(settings);
    if(didSign !== true) return instance.error(new Error(didSign));
    
    let isOK = instance.verify(settings);
    if(isOK !== true) return instance.error(new Error(isOK));
    
    let isZipAligned = instance.zipAlign(settings);
    if(isZipAligned === true) return true;
    
    return instance.error(new Error(isZipAligned));
  }
  
  if(!settings) return instance;

  return instance.sign(settings);
}
