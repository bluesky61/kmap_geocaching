
##Kmap_geocaching##

served at http://www.geocaching.com/gpx/kmap_geocaching.html
Created by Min Heo (heomin61@gmail.com)
version 0.9 
April 13, 2016

##Purpose##
This program draws gpx files onto Korean maps like daum map(http://map.daum.net/) 
and naver map(http://map.naver.com/) as well as google maps.
The gpx files should contain geocaches, made by geocaching pocket query or GDSK.

##Usage##
At first, make personal directories, and then upload gpx files. (max 20 Mb)
That's all. Just move around and the geocaches will appear onto the map.
You can change maps using the buttons in the menu.

##Functions, Classes##
=== kmap_geocaching.html
readGPXFile() : GPX file parsing... should be moved to Geocaches.
changeMap() : should be moved to koMap and make new callback function
upload() : callback function
currentLocation() : callback function


=== geocachegpx.js
function Geocache(...) : constructor for one geocache 
Geocache.prototype.makeHTML() : creat HTML string base on the geocache

function GPXMap(var GPXOwner) : initializes map : gMap, dMap and nMap.
GPXMap.prototype.parseGPX() : creates geocacheDB from GPX XML
GPXMap.prototype.createMarker() : create markers for whole geocacheDB and add events
GPXMap.prototype.registerGBoundsEvent() : attache events for changing boundarys for googlemaps
GPXMap.prototype.registerDBoundsEvent() : attache events for changing boundarys for daum maps
GPXMap.prototype.registerNBoundsEvent() : attache events for changing boundarys for naver maps
GPXMap.prototype.centerAndZoom() : 
