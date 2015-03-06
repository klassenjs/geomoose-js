/*
Copyright (c) 2009-2012, Dan "Ducky" Little & GeoMOOSE.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.TitlePane");
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.Button');
dojo.require("GeoMOOSE.Tab");

dojo.provide("extensions.CoordinateSearch.tab");
dojo.declare('extensions.CoordinateSearch.tab', [GeoMOOSE.Tab, dijit._Widget, dijit._Templated], {
	title: 'Coordinate Search', /* GeoMOOSE.Tab */

	templateString: dojo.cache("extensions.CoordinateSearch", "templates/tab.html"),
	widgetsInTemplate: true,
	ll84: null,
	usng: null,

	startup: function() {
		this.inherited(arguments);

		if(CONFIGURATION['extensions.CoordinateSearch.tab_name']) {
			this.set('title', CONFIGURATION['extensions.CoordinateSearch.tab_name']);
		}

		if(!CONFIGURATION.coordinate_display.xy) {
			dojo.style(this.xyPane.id, "display", "none");
		}
		if(!CONFIGURATION.coordinate_display.latlon) {
			dojo.style(this.llPane.id, "display", "none");
		}
		if(!CONFIGURATION.coordinate_display.usng) {
			dojo.style(this.usngPane.id, "display", "none");
		}

		this.ll84 = new OpenLayers.Projection("EPSG:4326");	
		this.usng = new USNG2();
		this.searchLLBtn.onClick = dojo.hitch(this, this.onZoomToLL);
		this.searchXYBtn.onClick = dojo.hitch(this, this.onZoomToXY);
		this.searchUSNGBtn.onClick = dojo.hitch(this, this.onZoomToUSNG);
		this.locateBtn.onClick = dojo.hitch(this, this.onLocateMe);
	},

	onZoomToLL: function() {
		var lat = this.latNode.get('value');
		var lon = this.lonNode.get('value');
		
		try {
			this.usngNode.set('value', this.usng.fromLonLat({lon: lon, lat: lat}, 4));

			var pt = new OpenLayers.Geometry.Point(lon, lat);
			pt.transform(this.ll84, Map.getProjectionObject());

			this.xNode.set('value', pt.x);
			this.yNode.set('value', pt.y);

			var LL = new OpenLayers.LonLat(pt.x, pt.y);
			if(Map.isValidLonLat(LL)) {
				Map.panTo(LL);
			} else {
				alert("Cannot pan to requested coordinate because it falls outside the bounds of this map.");
			}
		} 
		catch( e ) 
		{
			if(console && console.error)
				console.error(e);
			else
				alert(e);
		}
	},

	onZoomToXY: function() {
		var x = this.xNode.get('value');
		var y = this.yNode.get('value');
		
		try {
			var pt = new OpenLayers.Geometry.Point(x, y);
			pt.transform(Map.getProjectionObject(), this.ll84);
			this.lonNode.set('value', pt.x);
			this.latNode.set('value', pt.y);
			this.usngNode.set('value', this.usng.fromLonLat({lon: pt.x, lat: pt.y}, 4));

			var LL = new OpenLayers.LonLat(x, y);
			if(Map.isValidLonLat(LL)) {
				Map.panTo(LL);
			} else {
				alert("Cannot pan to requested coordinate because it falls outside the bounds of this map.");
			}
		} 
		catch( e ) 
		{
			alert(e);
		}
	},

	_onGotLocation: function(loc) {
		console.log("Got new position: " + loc.timestamp + ": " + loc.coords.latitude + "/" + loc.coords.longitude);
		this.latNode.set('value', loc.coords.latitude);
		this.lonNode.set('value', loc.coords.longitude);
		return this.onZoomToLL();
	},

	onLocateMe: function() {
		
		//var locationWatcher = navigator.geolocation.watchPosition(
		var locationWatcher = navigator.geolocation.getCurrentPosition(
			// Success
			dojo.hitch(this, this._onGotLocation),
			// Failure
			function(error) {
				console.log(error.message);
				//stopGPS();
			},
			{ enableHighAccuracy: true, maximumAge: 5000 }	
		);
	},

	onZoomToUSNG: function() {
		var usng_str = this.usngNode.get('value');
		usng_str = usng_str.toUpperCase();
		try {

			var center = Map.getCenter();
			center = {'x': center.lon, 'y': center.lat };
			OpenLayers.Projection.transform(center,
				Map.getProjectionObject(),
				this.ll84);
			center = {'lon': center.x, 'lat': center.y};

			var result = this.usng.toLonLat(usng_str, center);
			
			this.latNode.set('value', result.lat);
			this.lonNode.set('value', result.lon);

			var degrees = {'x': result.lon, 'y' : result.lat};
			OpenLayers.Projection.transform(degrees,
				this.ll84,
				Map.getProjectionObject());

				
			this.xNode.set('value', degrees.x);
			this.yNode.set('value', degrees.y);

			var inches = OpenLayers.INCHES_PER_UNIT;
			// Zoom to center of whole grid square
			var grid_radius = Math.pow(10, 5 - result.precision) / 2; // meters
			grid_radius = grid_radius * (inches['m'] / inches[Map.getUnits()]); // ground units
			GeoMOOSE.zoomToPoint(degrees.x + grid_radius, degrees.y+grid_radius, grid_radius);
		} 
		catch( e ) 
		{
			alert(e);
		}
	},

	onZoomToUTM: function() {
		easting = document.getElementById("search_easting").value;
		northing = document.getElementById("search_northing").value;
		//zone = ???
		try {
			LL = new OpenLayers.LonLat(easting, northing);
			Map.panTo(LL);
		} 
		catch( e ) 
		{
			alert(e);
		}
	},

	/* TODO: assumes WKT is a point */
	onZoomToWKT: function(wkt) {
	    var geom = OpenLayers.Geometry.fromWKT(wkt);
	   
	    geom.transform(LatLongProjection, Map.getProjectionObject());
	    var LL = new OpenLayers.LonLat(geom.x, geom.y)
	    Map.panTo(LL);
	},

	_pad2: function(num) {
		return (num < 10? '0' : '') + num;
	},
});
