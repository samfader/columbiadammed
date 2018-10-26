/* TO DO:
- fix content
- wanapum dam is broken
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
    zoom: 11.5,
    pitch: 20
});

var mapOverlay = new mapboxgl.Map({
    container: 'map-overlay', // container id
    style: 'mapbox://styles/samf/cjn25qz5d08si2rk6z7e35yl7', // stylesheet location
    center: [-119.864167, 48.947222], // starting position [lng, lat]
    zoom: 3.3, // starting zoom
    zoomControl: false,
    attributionControl: false
});

var hoveredId = null;

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
          ['boolean', ['feature-state', 'hover'], false],
          '#e76e6e',
          '#616161'
        ]
      }
      
  });
  mapOverlay.setFeatureState({source: 'dams', id: 14}, {hover: true});
})

// when minimap icons are clicked, fly in main map to spot
mapOverlay.on('click', 'dams-points', function (e) {
  var bbox = [[e.point.x - 2, e.point.y - 2], [e.point.x + 2, e.point.y + 2]];
  var features = mapOverlay.queryRenderedFeatures(bbox, { layers: ['dams-points'] });
  var name = features[0].properties.name
  map.flyTo(chapters[name]);
  setActiveChapter(name);

  // use feature-state to "light up" the circle that was clicked in minimap
  if (features.length > 0) {
    if (hoveredId) {
      mapOverlay.setFeatureState({source: 'dams', id: hoveredId}, { hover: false});
    }
    hoveredId = e.features[0].id;
    mapOverlay.setFeatureState({source: 'dams', id: hoveredId}, {hover: true});
  }
  // scroll on sidebar when minimap clicked
  var element = document.getElementById(name);
  element.scrollIntoView();
});

mapOverlay.on('mouseenter', 'dams-points', function () {
  mapOverlay.getCanvas().style.cursor = 'pointer';
});

mapOverlay.on('mouseleave', 'dams-points', function () {
  mapOverlay.getCanvas().style.cursor = '';
});

// On every scroll event, check which element is on screen
window.onscroll = function() {
    mapOverlay.setFeatureState({source: 'dams', id: 14}, {hover: false});
    var chapterNames = Object.keys(chapters);
    for (var i = 0; i < chapterNames.length; i++) {
        var chapterName = chapterNames[i];
        if (isElementOnScreen(chapterName)) {
            setActiveChapter(chapterName);
            setActiveCircle(chapterName);
            break;
        }
    }
};

var activeChapterName = 'columbiaLake';

function setActiveChapter(chapterName) {
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
  if (hoveredId) {
    mapOverlay.setFeatureState({source: 'dams', id: hoveredId}, { hover: false});
  }

  hoveredId = activeDam[0].id;
  mapOverlay.setFeatureState({source: 'dams', id: hoveredId}, {hover: true});
}

function isElementOnScreen(id) {
    var element = document.getElementById(id);
    var bounds = element.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom > 0;
}

function goToLocation(location) {
  map.flyTo(chapters[location]);
}