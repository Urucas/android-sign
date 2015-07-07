import child_process from 'child_process';
export default function sign(caps) {
  
  /*
   * unsign package
   * zip -d <path/to/apk.apk> META-INF/\*
   *
   * sign package
   * jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore <path/to/signkey> <path/to/apk.apk> alias_name
   *
   * zipalign
   * zipalign -v 4 <path/to/signed/apk.apk> <output.apk>
   */
   
}
