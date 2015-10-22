#Overview

The program takes an input csv file, uses google API to find lattitude and longitude, and outputs csv file.
The program is made according to the specifications in the topcoder challenge : SunShot - Hot4Solar CSV Geocoding Extractor F2F.

<b>Sample input : sample.csv </b>
<b>Sample output : output.csv </b>
<b>Sample logs : logs folder </b>

#Prerequisites
- node js
- npm

#How to setup dependencies

Inside project folder, run :
<code>npm install</code>

#How to setup configuration
configuration can be set in config.json.
- input file to take data from : "inFile" : "./sample.csv",
- output file to dump csv output data : "outFile" : "./output2.csv",
- address field : "address": "address",
- lattitude field : "lat": "lat",
- longitude field : "lng": "lng",
- limit of rows : "limit" : 5,
- log folder : "logFolder" : "./logs",
- delimiter of input file : "inDelimiter" : ",",
- delimiter of output file : "outDelimiter" : ","

#Sample Usage
After setting up appropriate config, run the following command in the terminal once inside the projct folder :

<code>node index.js</code>

or

<code>node . </code>
