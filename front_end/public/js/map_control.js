function get_random_color() {
    var makeColorCode = '0123456789ABCDEF';
    var code = '#';
    for (var count = 0; count < 6; count++) {
        code =code+ makeColorCode[Math.floor(Math.random() * 16)];
    }
    return code;
}

function draw_notice(notice_str) {
    let notice = JSON.parse(notice_str)
    let features = []
    myStyle.color = get_random_color()
    myStyle.fillColor = myStyle.color
    let mark

    if (notice.tp == 1) { // Out of Route Fine
        let curr_coord = [ notice.curr_coords[1], notice.curr_coords[0] ]
        mark = notice.curr_coords

        if (!points_in_map.hasOwnProperty(`${notice.epoch_index};${notice.input_index}`)) {
            features.push({
                "type": "Point",
                "popup": `Bus of line ${notice.bus_line} was out of route at ${notice.ts}.`,
                "coordinates": curr_coord
            })
            points_in_map[`${notice.epoch_index};${notice.input_index}`] = true
            console.log(points_in_map)
        }

        if (!routes_in_map.hasOwnProperty(notice.bus_line)) {
            let route = []
            for (let i = 0; i < notice.expected_route.length; i++) {
                route.push([ notice.expected_route[i][1], notice.expected_route[i][0] ])
            }

            features.push({
                "type": "LineString",
                "popup": `Route of bus ${notice.bus_line}.`,
                "coordinates": route
            })
            routes_in_map[notice.bus_line] = myStyle.color
            console.log(routes_in_map)
        }
        else {
            myStyle.color = routes_in_map[notice.bus_line]
            myStyle.fillColor = myStyle.color
        }
    }
    else if (notice.tp == 2) { // Late fine
        let curr_coord = [ notice.curr_stop[1], notice.curr_stop[0] ]
        mark = notice.curr_stop

        if (!points_in_map.hasOwnProperty(`${notice.epoch_index};${notice.input_index}`)) {
            features.push({
                "type": "Point",
                "popup": `Bus of line ${notice.bus_line} was ${notice.late} late.`,
                "coordinates": curr_coord
            })
            points_in_map[`${notice.epoch_index};${notice.input_index}`] = true
            console.log(points_in_map)
        }
    }


    // console.log(features)
    // L.geoJSON(features, {
    //     style: myStyle,
    //     onEachFeature: (feature, layer) => {layer.bindPopup(feature.popup)}
    // }).addTo(map);
    
    L.geoJSON(features, {
        style: myStyle,
        onEachFeature: (feature, layer) => {layer.bindPopup(feature.popup)},
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        }
    }).addTo(map);


    if (mark){
        map.flyTo(mark)
    }
}


function clear_map() {
    map.eachLayer(function (layer) {
        if (!layer._url) {
            map.removeLayer(layer);
        }
    });
    routes_in_map = {}
    points_in_map = {}
}

// MAP GLOBAL VARIABLES
var map = L.map('map').setView([57.828479, 26.533621], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

var myStyle = {
    "color": null,
    "fillColor": null,
    "weight": 3,
    "opacity": 1.0,
    "fillOpacity": 0.6,
    "radious": 10
};

var routes_in_map = {} // { bus_line: boolean }
var points_in_map = {} // { "epoch_index;input_index": boolean }


// to add a fine trhourgh map:
// map.on('click', function(e) {
//     alert(e.latlng);
// } );
