let map

async function draw_notice(notice) {
    //let notice = JSON.parse(notice_str)
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
            await inspect_query({"bus_id": notice.bus_line, "select": "route"}, (response) => {
                if (!response.success) {
                    console.log("Failed to inspect route of line ",notice.bus_line)
                    return
                }
                for (let i = 0; i < response.result.length; i++) {
                    route.push([ response.result[i][1], response.result[i][0] ])
                }
    
            })

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
function init_map() {
    map = L.map('map').setView([57.828479, 26.533621], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    let bus_id_elem = document.getElementById('fineModalBusId')
    bus_id_elem.onchange = function() {
        inspect_query({"bus_id": bus_id_elem.value, "select": "trips"}, (res) => {
            if (!res.success) {
                alert("Unable to inspect bus line trips")
                return
            }

            let trip_id_elem = document.getElementById('fineModalTripId')
            let trips_html = ""
            for (let i = 1; i <= res.result; i++) {
                trips_html += `<option value=${bus_id_elem.value};${i}> ${bus_id_elem.value};${i} </option>`
            }
            
            trip_id_elem.innerHTML = trips_html
        })
    }

    // to add a fine trhourgh map:
    map.on('click', function(e) {
        let lat = e.latlng.lat
        let lng = e.latlng.lng
        
        let myModalEl = document.getElementById('fineModal')
        
        // get/create modal
        let modal = bootstrap.Modal.getInstance(myModalEl)
        if (!modal) {modal = new bootstrap.Modal(myModalEl)}
        
        let lat_elem = document.getElementById('fineModalLat')
        lat_elem.value = lat
    
        let lng_elem = document.getElementById('fineModalLng')
        lng_elem.value = lng
    
        
        inspect_query({ "bus_id": "*" }, (res) => {
            if (!res.success) {
                alert("Unable to inspect bus_id")
                return
            }

            let options_html = "<option selected value=''> Seleact a Line </option>"
            for (let i = 0; i < res.result.length; i++) {
                options_html += `<option value=${res.result[i]}> ${res.result[i]} </option>`
            }

            bus_id_elem.innerHTML = options_html
        })

        modal.toggle()
    } );
}



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
