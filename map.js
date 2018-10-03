/* TO DO:
- add content
- figure out how to scroll the sidebar when minimap point is clicked
- add "intro" page that, when you scroll down, you get to the map
*/
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FtZiIsImEiOiJjaWZ3bGhtdjgzMnN1dWdrcnEwZTVieG91In0.DkCY-91coDahKvpH7Z26dw';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/samf/cjlgx20np04zo2rtcgm9d4j61',
    center: [-115.850000, 50.216667],
    zoom: 11.5,
    bearing: 10,
    pitch: 45
});

var mapOverlay = new mapboxgl.Map({
    container: 'map-overlay', // container id
    style: 'mapbox://styles/samf/cjms84la95njz2rn7inpm05sx', // stylesheet location
    center: [-119.864167, 48.947222], // starting position [lng, lat]
    zoom: 3.3, // starting zoom
    zoomControl: false,
    attributionControl: false
});

var chapters = {
    'columbiaLake': {
        bearing: 27,
        center: [-115.850000, 50.216667],
        zoom: 9.5,
        pitch: 20
    },
    'kinbasket': {
        duration: 6000,
        center: [-118.077, 51.997],
        bearing: 170,
        zoom: 9.2,
        pitch: 20
    },
    'micaDam': {
        bearing: 90,
        center: [-118.566389, 52.077500],
        zoom: 13,
        speed: 0.3,
        pitch: 40
    },
    'revelstokeDam': {
        bearing: 90,
        center: [-118.193333, 51.049167],
        zoom: 13.3,
        speed: 0.2
    },
    'keenleysideDam': {
        bearing: 45,
        center: [-117.771667, 49.338333],
        zoom: 15.3,
        pitch: 20,
        speed: 0.2
    },
    'grandCouleeDam': {
        center: [-118.9775, 47.957222],
        zoom: 13.3,
        speed: 0.2
    },
    'chiefJosephDam': {
        bearing: 90,
        center: [-119.638611, 47.995],
        zoom: 17.3,
        pitch: 40,
        speed: 0.2
    },
    'wellsDam': {
        bearing: 90,
        center: [-119.864167, 47.947222],
        zoom: 14.3,
        pitch: 20,
        speed: 0.2
    },
    'rockyReachDam': {
        duration: 6000,
        center: [-120.294722, 47.533056],
        bearing: 170,
        zoom: 13.2,
        pitch: 20,
        speed: 0.2
    },
    'rockIslandDam': {
        bearing: 90,
        center: [-120.094444, 47.3425],
        zoom: 13,
        speed: 0.2,
        pitch: 40
    },
    'wanapumDam': {
        bearing: 90,
        center: [-119.970278, 46.877778],
        zoom: 13.3,
        speed: 0.2
    },
    'priestRapidsDam': {
        bearing: 45,
        center: [-119.91, 46.644167],
        zoom: 15.3,
        pitch: 20,
        speed: 0.2
    },
    'mcnaryDam': {
        duration: 6000,
        center: [-119.298056, 45.935278],
        bearing: 170,
        zoom: 13.2,
        pitch: 20,
        speed: 0.2
    },
    'johnDayDam': {
        bearing: 90,
        center: [-120.693611, 45.715833],
        zoom: 13,
        speed: 0.2,
        pitch: 40
    },
    'theDallesDam': {
        bearing: 90,
        center: [-121.133889, 45.613889],
        zoom: 13.3,
        speed: 0.2
    },
    'bonnevilleDam': {
        bearing: 45,
        center: [-121.940833, 45.645],
        zoom: 15.3,
        pitch: 20,
        speed: 0.2
    },
};

// when minimap icons are clicked, fly in main map to spot
mapOverlay.on('click', 'columbia-dammed-full', function (e) {
  var bbox = [[e.point.x - 2, e.point.y - 2], [e.point.x + 2, e.point.y + 2]];
  var features = mapOverlay.queryRenderedFeatures(bbox, { layers: ['columbia-dammed-full'] });
  var name = features[0].properties.name
  map.flyTo(chapters[name]);
  setActiveChapter(name);
  // figure out here how to scroll
});

mapOverlay.on('mouseenter', 'columbia-dammed-full', function () {
  mapOverlay.getCanvas().style.cursor = 'pointer';
});

mapOverlay.on('mouseleave', 'columbia-dammed-full', function () {
  mapOverlay.getCanvas().style.cursor = '';
});

// On every scroll event, check which element is on screen
window.onscroll = function() {
    var chapterNames = Object.keys(chapters);
    for (var i = 0; i < chapterNames.length; i++) {
        var chapterName = chapterNames[i];
        if (isElementOnScreen(chapterName)) {
            setActiveChapter(chapterName);
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

function isElementOnScreen(id) {
    var element = document.getElementById(id);
    var bounds = element.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom > 0;
}

function goToLocation(location) {
  map.flyTo(chapters[location]);
}