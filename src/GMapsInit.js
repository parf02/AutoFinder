// This example adds a user-editable rectangle to the map.

CI.gmaps = {};
CI.gmaps.myLocation = {lat: 45.5017, lng: -73.5673};


function initMap() {

    showUserPosition(
            {coords:
                {latitude: 45.5017,
                    longitude: -73.5673
                }
            });

}

function showUserPosition(position) {

    //create map

    CI.gmaps = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        },
        zoom: 14
    });

    //store location defaults in structure

    CI.gmaps.myLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    // Place a draggable marker on the map based on default location

    var marker = new google.maps.Marker({
        position: CI.gmaps.myLocation,
        map: CI.gmaps,
        draggable:true,
        title:"Your Location"
    });

    google.maps.event.addListener(marker, "dragend", function() {
        var position = marker.getPosition();
        console.log(position);
    });

    //get user location

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(myPos){

            //save users location for future

            CI.gmaps.myLocation.lat = myPos.coords.latitude;
            CI.gmaps.myLocation.lng = myPos.coords.longitude;

            //move to users position

            CI.gmaps.panTo(
                CI.gmaps.myLocation
            );

            //zoom in closer to them

            setTimeout( function() {
                CI.gmaps.setZoom(17);
            }, 1000 );

            //add movable marker with user locations

            marker.setPosition(CI.gmaps.myLocation);

        });
    } else {
        console.log("no location using defaults");
    }

}
