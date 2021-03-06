/* TO DO:
- fix content
- set up some kind of loading spinner - https://jsbin.com/taqexahefu/1/edit?html,output?
- refactor: have an object to store different states, like
{
  activeChapterDiv: "#blah",
  activeCircle: blahCircle,
...
}
then call all the relevant functions to do updates
*/
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FtZiIsImEiOiJjam5raHU2ZHMxNjduM3FwbTk1YnprbTI3In0.TUnz9LTsWMbCVZJKIcg_Ow';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/samf/cjlgx20np04zo2rtcgm9d4j61',
    center: [-115.850000, 50.216667],
    bearing: 27,
    zoom: 12.5,
    pitch: 75
});

var mapOverlay = new mapboxgl.Map({
    container: 'map-overlay', // container id
    style: 'mapbox://styles/samf/cjn25qz5d08si2rk6z7e35yl7', // stylesheet location
    center: [-119.864167, 48.947222], // starting position [lng, lat]
    zoom: 3.3, // starting zoom
    zoomControl: false,
    attributionControl: false
});

var clickedId = null;

map.on('load', function () {
  map.addSource('mapbox-dem', {
    'type': 'raster-dem',
    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
    'tileSize': 512,
    'maxzoom': 14
    });
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
     
    // add a sky layer that will show when the map is highly pitched
    map.addLayer({
    'id': 'sky',
    'type': 'sky',
    'paint': {
    'sky-type': 'atmosphere',
    'sky-atmosphere-sun': [0.0, 0.0],
    'sky-atmosphere-sun-intensity': 15
    }
    });
});

mapOverlay.on('load', function() {
  mapOverlay.addSource('dams', {
      'type': 'geojson',
      'data': 'https://gist.githubusercontent.com/samfader/babbb3c429f77ce52764915f690037cc/raw/4bd494a87b40abfc3449e23e9a1cd9a0e9f9e397/dams.geojson',
      'generateId': true
  });

  mapOverlay.addLayer({
      'id': 'dams-points',
      'type': 'circle',
      'source': 'dams',
      'layout': {},
      'paint': {
        'circle-color': ['case',
          ['boolean', ['feature-state', 'clicked'], false],
          '#e76e6e',
          '#616161'
        ]
      }
      
  });
  // On every scroll event, check which element is on screen
window.onscroll = function() {
  mapOverlay.setFeatureState({source: 'dams', id: 14}, {clicked: false});
  var chapterNames = Object.keys(chapters);
  console.log("chapter names is", chapterNames)
  for (var i = 0; i < chapterNames.length + 1; i++) {
      var chapterName = chapterNames[i];
      console.log("chapter name before iselementonscreen  is", chapterName)
      if (isElementOnScreen(chapterName)) {
        console.log("ok, now chapter name here is", chapterName)
          setActiveChapter(chapterName);
          setActiveCircle(chapterName);
          break;
      }
  }
};
  mapOverlay.setFeatureState({source: 'dams', id: 14}, {clicked: true});
})

// when minimap icons are clicked, fly in main map to spot
mapOverlay.on('click', 'dams-points', function (e) {
  var features = mapOverlay.queryRenderedFeatures(e.point, { layers: ['dams-points'] });
  console.log("features are", JSON.stringify(features));
  var name = features[0].properties.name
  console.log("name is ", name);
  map.flyTo(chapters[name]);
  setActiveChapter(name);
  // scroll on sidebar when minimap clicked
  // have to do a bit of math to get scrollIntoView aligned NEAR the top, but not all the way at it
  var element = document.getElementById(name);
  element.scrollIntoView(true);
  var viewportH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  window.scrollBy(0, (element.getBoundingClientRect().height-viewportH)/40);
});

mapOverlay.on('mouseenter', 'dams-points', function () {
  mapOverlay.getCanvas().style.cursor = 'pointer';
});

mapOverlay.on('mouseleave', 'dams-points', function () {
  mapOverlay.getCanvas().style.cursor = '';
});

var activeChapterName = 'columbiaLake';

function setActiveChapter(chapterName) {
  console.log("setActiveChapter chapter name and activeChapterName is", chapterName, activeChapterName)
    if (chapterName === activeChapterName) return;

    map.flyTo(chapters[chapterName]);

    document.getElementById(chapterName).setAttribute('class', 'active');
    document.getElementById(activeChapterName).setAttribute('class', '');

    activeChapterName = chapterName;
}

function setActiveCircle(chapterName){
  var activeDam = mapOverlay.querySourceFeatures('dams', {
    filter: ['in', 'name', chapterName]
  });

    // bug still: chief joseph dam not working
    // bug: on first click console error since there is no clickedId (it's null)
    // unhighlight previously clicked circle
    mapOverlay.setFeatureState({source: 'dams', id: clickedId}, {clicked: false});

    clickedId = activeDam[0].id;
    // highlight clicked circle
    // clickedId = activeDam[0].id;
    mapOverlay.setFeatureState({source: 'dams', id: clickedId}, {clicked: true});
};

function isElementOnScreen(id) {
    var element = document.getElementById(id);
    var bounds = element.getBoundingClientRect();
    console.log("id in isElementOnScreen is ", id)
    return bounds.top < window.innerHeight && bounds.bottom > 0;
}

function goToLocation(location) {
  map.flyTo(chapters[location]);
}