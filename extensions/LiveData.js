/*
Copyright (c) 2009-2011, Dan "Ducky" Little & GeoMOOSE.org

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

/* Extension to display a live vector data feed from a server
 * Jul 25, 2011 James Klassen
 */




LiveDataExtension = new OpenLayers.Class(GeoMOOSE.UX.Extension, {
	CLASS_NAME : "LiveDataExtension",

	CONFIG: {  
			//baseUrl: "/json_push/test_lp.cgi",
			baseUrl: "/java/test_lp.cgi",
			layerProj : new OpenLayers.Projection("EPSG:4326")
		 },

	layer: null,
	features: [ ],
	running: false,
	session_id:  null,

	load: function() {
		/* Register onMapbookLoad event */
		GeoMOOSE.register('onMapbookLoaded', this, this.onMapbookLoad);
	},

	onMapbookLoad: function() {
		lde = this;

		/* Create TAB UI */
		dojo.declare('LiveDataTab', [GeoMOOSE.Tab], {
			title: 'Live Data',
		
			startup: function() {
			this.inherited(arguments);
				this.set('content', "<input type=\"button\" value=\"Start\" onclick=\"lde.connect()\"><br>" + 
				"<input type=\"button\" value=\"Stop\" onclick=\"lde.stop()\">");
			}
		});
		GeoMOOSE.addTab('live_data_tab', new LiveDataTab());

		/* Create a new GeoJSON parser */
		this.parser = new OpenLayers.Format.GeoJSON();

		/* Create a new feature layer */
		this.layer = new OpenLayers.Layer.Vector("LiveDataExtension", {
			styleMap: new OpenLayers.StyleMap({
				pointRadius: 5,
				outlineColor: "#111111",
				fillColor: "#6666ff"
			}),
			projection: this.CONFIG.layerProj  // Data input as LL
		});
		this.layer.events.register('beforefeatureadded', this, this.beforefeatureadded)
		Map.addLayer(this.layer);
		this.layer.display(true);
	},

	beforefeatureadded: function(feature) {
		try {
			var fid = feature.feature.attributes["fid"];

			for(var i=0, len=this.layer.features.length; i < len; i++) {
				if(this.layer.features[i].attributes["fid"] == fid)
					this.layer.removeFeatures([this.layer.features[i]]);

			}

			// Reproject from LL84 to Map projection ... why is this needed?
			feature.feature.geometry.transform(this.CONFIG.layerProj, Map.projection);
			return true;
		} catch(err) {
			return false;
		}
	},

	connect: function() {
		if(this.running) 
			this.stop();

		req = new XMLHttpRequest();
		lde = this;
	
		req.onreadystatechange = function() {
			if(req.readyState == 4) {
				if(req.status == 200) {
					response = JSON.parse(req.responseText);
					if(response.session_id == null) {
						alert("Null session_id???");
					}
					lde.session_id = response.session_id;
					lde.running = true;
					lde.getData();
				}
			}
		};
		req.open("POST", this.CONFIG.baseUrl , true);
		req.send( JSON.stringify({ username: "jimk", password: "password" }) );
	},

	stop: function() {
		this.running = false;
		this.session_id = null;
	},

	getData: function() {
		req = new XMLHttpRequest();
		lde = this;
	
		req.onreadystatechange = function() {
			if(req.readyState == 4) {
				if(req.status == 200) {
					try {
						lde.layer.addFeatures(
							lde.parser.read(req.responseText, "FeatureCollection", null)
						);
						if(lde.running) {
							lde.getData();
						}
					} catch(e) {
						alert(e);
					}
				}

			}
		};
		

		req.open("GET", this.CONFIG.baseUrl + "?session_id=" + encodeURI(this.session_id), true);
		req.send();
	}
});

GeoMOOSE.UX.register('LiveDataExtension');


/* Marker Implementation

l = new OpenLayers.Layer.Markers("Markers");
Map.addLayer(l);
l.display(true);

size = new OpenLayers.Size(21,25);
offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);

m = new OpenLayers.Marker(new OpenLayers.LonLat(0,0),icon.clone());
l.addMarker(m);
m.lonlat.lon=100000;
l.redraw();

*/
