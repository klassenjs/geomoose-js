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

/*
 * Class: CoordinateSearch
 * Creates a tab where the user can enter a lat/lon, x/y, or USNG coordinate
 * and then pan/zoom to that coordinate.
 *
 * Activate by adding dojo.require('extentions.CoordinateSearch'); 
 * to site/includes.js and rebuilding GeoMOOSE.
 *
 */

dojo.require("extensions.CoordinateSearch.tab");

dojo.provide("extensions.CoordinateSearch");
dojo.declare('CoordinateSearchExtension', null, {
	// Executed when GeoMOOSE is starting after UI loaded, before Mapbook loaded.
	load: function() {
		var tab = new extensions.CoordinateSearch.tab();
		GeoMOOSE.addTab('coordinate_search_tab', tab);
	}
});

GeoMOOSE.UX.register('CoordinateSearchExtension');
