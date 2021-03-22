How to run the programs

1. Install "Covid_Crowdedness_App.apk" on your *android* phone
2. Once mobile app open it probably won't work, since by default location permission is disabled,
enable any permissions for the app.
3. You must connect to a wifi first before using this app.

4. Inside "covid-tracing-website" folder, open *two* terminals: One for the server and one for the web app.
5. In one terminal type: "npm start" to start web app development server
6. In second terminal type "node src/server.js" to start express server

7. Once both server and web application have started, go back to the mobile application
8. On mobile app, click "SEND WIFI LOCATION"
9. Server should now receive your location info from the mobile app.

10. On web application click the date you send the location info, and click on the location street name (A list under the calendar).
11. There should be a change to the bar graph, if not wait at least *2 minutes*, because that's how long the server updates the web app.

**P.S This app will 100% *not* work for you(I know funny thing to say), that's because the mobile app is connecting
**to my computer wifi's IP address, it will work if it is connecting to your PC's IP address. To do this:**

Inside WifiScannerActivity.java file, change **http://192.168.1.19:5000** to **http://(YOUR OWN PC IP ADDRESS):5000**
You need to rebuild this android apk again(sorry :/).