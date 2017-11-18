//get user location
$(document).ready(function(){
    CI.events.init();
});

var CI = (function(){

    var myDistance = 200;
    var myPerimeter = null;

    var myCustomerID = '';
    var myProviderNo = '';
    var myCityID = '';

    function showMyPerimeter(d) {

        //save user preference for distance

        myDistance = d;

        //load user location

        lat = CI.gmaps.myLocation.lat;
        long = CI.gmaps.myLocation.lng;

        //set zoom based if user uses greater perimeter than aniticapted

        CI.gmaps.setZoom(17 - Math.floor(myDistance/300));

        var bounds = {
            north: lat + myDistance * 0.0000089,
            south: lat - myDistance * 0.0000089,
            east: long + myDistance * 0.0000089 / Math.cos(lat * 0.018),
            west: long - myDistance * 0.0000089 / Math.cos(lat * 0.018)
        };

        showRectangle(bounds);
    }

    function showRectangle(bounds){

        // Define the rectangle and set its editable property to true.


    }

    // Show the new coordinates for the rectangle in an info window.
    /** @this {google.maps.Rectangle} */
    function showNewRect(event) {
        myDistance =  myPerimeter.getRadius();
        console.log(myDistance);
        console.log(CI.gmaps.myLocation);
    }

    //returns distance in meters
    function haversine_distance(coords1, coords2) {

        function toRad(x) {
            return x * Math.PI / 180;
        }

        var dLat = toRad(coords2.lat - coords1.lat);
        var dLon = toRad(coords2.lng - coords1.lng)

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(coords1.lat)) *
            Math.cos(toRad(coords2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        return 1000*12742 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    var validCars = [];
    function fetchValidCars(){
        //first make sure the user is logged in. Force remember me


        $.ajax({
            url: 'https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/GetVehicleProposals?Callback=?',
            type: 'GET',
            data: {CustomerID: "\"\"", "Longitude": "0", "Latitude": "0"},
            dataType: 'jsonp',
            crossdomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data){

                if (typeof data.Vehicules != 'undefined') {
                    if (!(Object.prototype.toString.call(data.Vehicules) === '[object Array]')) {
                        data.Vehicules = [data.Vehicules];
                    }

                    $.each(data.Vehicules, function (i, item) {
                        if (item != null) {

                            var latlng2 = {lat: parseFloat(item.Position.Lat), lng: parseFloat(item.Position.Lon)};

                            if (haversine_distance(latlng2, CI.gmaps.myLocation) <= myDistance){
                                validCars.push(item);
                                new google.maps.Marker({
                                    position: latlng2,
                                    map: CI.gmaps,
                                    draggable:true,
                                    title:' ' + haversine_distance(latlng2, CI.gmaps.myLocation)
                                });
                            }
                        }
                    })
                }
                console.log(validCars);
                if(validCars.length > 0){

                    //make reservation

                    var closestCar = CI.closestCar();

                    //get last used time

                    //get address

                    // BookLSI(closestCar.Id, closestCar.Name, closestCar.ModelName.toLowerCase(), closestCar.Immat, '' , closestCar.EnergyLevel, '' , closestCar.Position.Lat, closestCar.Position.Lon);

                    alert("Reservation Successful!");

                    CI.reserveCar(closestCar);
                } else{
                    console.log("Currently no available cars in selected perimeter!");
                    setTimeout(fetchValidCars, 30000);
                }
            }
        });
    }

    function closestCar(){
        var smallestVal = Number.MAX_VALUE;
        var smallestIdx = -1;

        validCars.forEach(function(val,i){
           if(val < smallestIdx){
               smallestVal = val;
               smallestIdx = i;
           }
        });

        return validCars[0];
    }


    function login(username, password){
        $.ajax({
            url: 'https://www.reservauto.net/Scripts/Client/Ajax/Mobile/Login.asp',
            type: 'GET',
            data: {BranchID: 1, Username: $('#Username').val(), Password: $('#Password').val(), RememberMe: $('#RememberMe').prop('checked')},
            dataType: 'jsonp',
            crossdomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data){
                if(data[0].CustomerID === ''){
                    //the data entered was invalid
                } else{
                    //save the users info
                    myCustomerID = data[0].CustomerID;
                    myProviderNo = data[0].ProviderNo;
                    myCityID = data[0].CityID;
                }
            }
        });
    }
    // google.maps.event.addListener(mgr, 'loaded', function(){
    //     $.ajax({
    //         url: 'https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/GetVehicleProposals?Callback=?',
    //         type: 'GET',
    //         data: {CustomerID: "\"\"", "Longitude": "0", "Latitude": "0"},
    //         dataType: 'jsonp',
    //         crossdomain: true,
    //         contentType: 'application/json; charset=utf-8',
    //         success: function(data){
    //
    //             if (typeof data.Vehicules != 'undefined') {
    //                 if (!(Object.prototype.toString.call(data.Vehicules) === '[object Array]')) {
    //                     data.Vehicules = [data.Vehicules];
    //                 }
    //
    //                 $.each(data.Vehicules, function (i, item) {
    //                     if (item != null) {
    //
    //                         var latlng2 = {lat: parseFloat(item.Position.Lat), lng: parseFloat(item.Position.Lon)};
    //
    //                         if (haversine_distance(latlng2, CI.gmaps.myLocation) <= myDistance) validCars.push(item);
    //                     }
    //                 })
    //             }
    //             console.log(validCars);
    //         }
    //     });
    // });

    // function BookLSI (vin, carNo, modelName, licensePlate, address, charge, nbrHour, lat, lng) {
    //     if (blnLogin) {
    //         $('#InvalidLogin').show();
    //     } else {
    //         $('#InvalidLogin').hide();
    //     }
    //
    //     $.ajax({
    //         url: 'https://www.reservauto.net/Scripts/Client/Ajax/Mobile/Login.asp',
    //         type: 'GET',
    //         data: {URLEnd: 'URLEnd'},
    //         dataType: 'jsonp',
    //         crossdomain: true,
    //         contentType: 'application/json; charset=utf-8',
    //         success: function(data){
    //             var CustomerID = parseInt (data.data[0].CustomerID, 10);
    //             var ProviderNo = data.data[0].ProviderNo;
    //             // modif Eric
    //             var cityID = $('#ville').val();
    //             // end  modif Eric
    //             var Access = data.data[0].Access;
    //             var contButtonLang =(lang == 1)? "Annuler" : "Cancel";
    //
    //             if (isNaN (CustomerID)) {
    //                 $('#LoginDialog').dialog({
    //                     dialogClass: 'LoginDialog',
    //                     modal: true,
    //                     close: function(){
    //                         $('#LoginDialog').dialog('destroy');
    //                     },
    //                     buttons: [
    //                         {
    //                             text: "OK",
    //                             "class": 'uiButtonClass',
    //                             click: function() {
    //                                 $.ajax({
    //                                     url: 'https://www.reservauto.net/Scripts/Client/Ajax/Mobile/Login.asp',
    //                                     type: 'GET',
    //                                     data: {BranchID: 1, Username: $('#Username').val(), Password: $('#Password').val(), RememberMe: $('#RememberMe').prop('checked')},
    //                                     dataType: 'jsonp',
    //                                     crossdomain: true,
    //                                     contentType: 'application/json; charset=utf-8',
    //                                     success: function(data){
    //                                         blnLogin = true;
    //                                         $('#LoginDialog').dialog('close');
    //                                         BookLSI (vin, carNo, modelName, licensePlate, address, charge, nbrHour, lat, lng);
    //                                     }
    //                                 });
    //                             }
    //                         },
    //                         {
    //                             text: contButtonLang,
    //                             "class": 'uiButtonClass',
    //                             click: function() {
    //                                 blnLogin = false;
    //                                 $(this).dialog('close');
    //                             }
    //                         }
    //                     ]
    //                 });
    //             }
    //             else {
    //                 if (ProviderNo != '') {
    //                     if (Access == 'BlackList') {
    //                         $('#LSIDialog').html('L\'état du compte de ce client ne lui donne présentement pas accès à cette catégorie de véhicules. Il est possible qu\'il soit inscrit sur l\'une de nos liste de soldes impayés ou que sa carte Opus ait été supprimée ou inscrite sur la liste des cartes perdues ou volées.');
    //                         $('#LSIDialog').dialog({
    //                             dialogClass: 'LSIDialog',
    //                             modal: true,
    //                             close: function(){ $('#LSIDialog').dialog('destroy'); },
    //                             buttons: {
    //                                 'Fermer': function() {
    //                                     $(this).dialog('close');
    //                                 }
    //                             }
    //                         });
    //                     }
    //                     else {
    //                         $.ajax({
    //                             url: 'https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/GetCurrentBooking?Callback=?',
    //                             type: 'GET',
    //                             data: {CustomerID: "\""+ProviderNo+"\""},
    //                             dataType: 'jsonp',
    //                             crossdomain: true,
    //                             contentType: 'application/json; charset=utf-8',
    //                             success: function(data){
    //                                 if (data == null) {
    //
    //                                     var strHTML,ouiButton,nonButton;
    //
    //                                     /* modif Eric*/
    //                                     strHTML='';
    //                                     if(lang ==1){
    //                                         if ((cityID == '90' && Access != 'OneWayQuebec') || (cityID != '90' && Access == 'OneWayQuebec')) {
    //                                             strHTML = strHTML + '<p style="font-weight: bold;">Avis de changement de zone</p><p>Si vous bloquez un véhicule à XcityX, nous modifierons la zone inscrite à votre compte pour vous permettre d\'y utiliser des véhicules <i>Auto-mobile</i>. Vous devrez modifier manuellement ce paramètre si vous souhaitez emprunter un véhicule trouvé dans la rue dans une autre ville sans le bloquer au préalable.</p>';
    //
    //                                             if (cityID == '90') {
    //                                                 strHTML = strHTML.replace ('XcityX', 'Québec');
    //                                             } else {
    //                                                 strHTML = strHTML.replace ('XcityX', 'Montréal');
    //                                             }
    //                                         }
    //                                         strHTML = strHTML +'<div style="padding: 5px 0px 8px 0px;">Désirez-vous bloquer ce véhicule?</div><table border="0"><tr><td style="width: 90px;"># Véhicule :</td><td>XcarNoX</td></tr><tr><td>Modèle :</td><td><div class="name_LSI">XmodelNameX</div></td></tr>XtrChargeX<tr><td>Dernière utilisation :</td><td>XnbrHourX</td></tr><tr><td>Adresse :</td><td>XaddressX</td></tr></table><div id="progressbar"></div>';
    //                                         ouiButton = "Oui";nonButton = "Non";
    //                                     } else {
    //                                         if ((cityID == '90' && Access != 'OneWayQuebec') || (cityID != '90' && Access == 'OneWayQuebec')) {
    //                                             strHTML = strHTML + '<p style="font-weight: bold;">Notice of zone change</p><p>If you block a vehicle in XcityX City, we will change the city listed on your account to enable your use of the <i>Auto-mobile</i> cars in this area. You will have to manually change this setting in your personal information afterwards if you want to use a vehicle found in the street in another city without blocking it first with our mobile app.</p>';
    //
    //                                             if (cityID == '90') {
    //                                                 strHTML = strHTML.replace ('XcityX', 'Québec');
    //                                             } else {
    //                                                 strHTML = strHTML.replace ('XcityX', 'Montréal');
    //                                             }
    //                                         }
    //                                         strHTML = strHTML +'<div style="padding: 5px 0px 8px 0px;">Do you want to block this car?</div><table border="0"><tr><td style="width: 70px;">Car # :</td><td>XcarNoX</td></tr><tr><td>Model :</td><td><div class="name_LSI">XmodelNameX</div></td></tr>XtrChargeX<tr><td>Previous use :</td><td>XnbrHourX</td></tr><tr><td>Address :</td><td>XaddressX</td></tr></table><div id="progressbar"></div>';
    //                                         ouiButton = "Yes";nonButton = "No";
    //                                     }
    //                                     /* end modif Eric*/
    //
    //                                     strHTML = strHTML.replace('XvinX', vin).replace('XcarNoX', carNo).replace('XmodelNameX', modelName).replace('XlicensePlateX', licensePlate).replace('XaddressX', address).replace('XnbrHourX', nbrHour);
    //
    //                                     if (charge == '') {
    //                                         strHTML = strHTML.replace ('XtrChargeX', '');
    //                                     }
    //                                     else {
    //                                         strHTML = strHTML.replace ('XtrChargeX', '<tr><td>Charge :</td><td>XchargeX</td></tr>').replace ('XchargeX', charge);
    //                                     }
    //
    //                                     $('#LSIDialog').html(strHTML);
    //
    //                                     $('#LSIDialog').dialog({
    //                                         dialogClass: 'LSIDialog',
    //                                         modal: true,
    //                                         close: function(){
    //                                             $('#LSIDialog').dialog('destroy');
    //                                         },
    //                                         buttons:
    //                                             [
    //                                                 {
    //                                                     id: 'Button_Yes',
    //                                                     text: ouiButton,
    //                                                     click: function(e) {
    //                                                         $('#Button_Yes').button({disabled: true});
    //                                                         $('#progressbar').show();
    //                                                         $('#progressbar').progressbar({
    //                                                             value: false
    //                                                         });
    //
    //                                                         $.ajax({
    //                                                             url: 'https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/CreateBooking?Callback=?',
    //                                                             type: 'GET',
    //                                                             data: {CustomerID: "\"\"", "VehicleID": "\"" + vin + "\""},
    //                                                             dataType: 'jsonp',
    //                                                             crossdomain: true,
    //                                                             contentType: 'application/json; charset=utf-8',
    //                                                             success: function(data){
    //                                                                 $('#progressbar').progressbar('destroy');
    //                                                                 $('#progressbar').hide();
    //
    //                                                                 if (data) {
    //                                                                     $('#LSIDialog').dialog('close');
    //
    //                                                                     SetContentInfoWindowLSI (vin, carNo, modelName, licensePlate, address, charge, nbrHour, lat, lng, current_iw_lsi, true);
    //
    //                                                                     LiberateLSI (vin, carNo, modelName, licensePlate, address, charge, nbrHour, lat, lng);
    //                                                                 }
    //                                                                 else {
    //                                                                     $('#LSIDialog').dialog('close');
    //                                                                     ErrorLSI (vin, carNo, modelName, licensePlate, address, charge, nbrHour, lat, lng);
    //                                                                 }
    //                                                             }
    //                                                         });
    //                                                     }
    //                                                 },
    //                                                 {
    //                                                     text: nonButton,
    //                                                     click: function() {
    //                                                         $(this).dialog('close');
    //                                                     }
    //                                                 }
    //                                             ]
    //                                     });
    //                                 }
    //                                 else {
    //                                     var latlng3 = new google.maps.LatLng(data.Vehicule.Position.Lat, data.Vehicule.Position.Lon);
    //
    //                                     geocoder.geocode({'latLng': latlng3}, function(results, status) {
    //                                         var address2 = '';
    //
    //                                         if (status == google.maps.GeocoderStatus.OK) {
    //                                             if (results[0]) {
    //                                                 address2 = results[0].address_components[0].long_name + ' ' + results[0].address_components[1].long_name;
    //                                             }
    //                                         }
    //
    //                                         AlreadyBookLSI (data, vin, carNo, modelName, licensePlate, address, charge, nbrHour, address2, lat, lng);
    //                                     });
    //                                 }
    //                             }
    //                         });
    //                     }
    //                 }
    //                 else {
    //                     $('#LSIDialog').html('L\'état du compte de ce client ne lui donne présentement pas accès à cette catégorie de véhicules. Il est possible qu\'il soit inscrit sur l\'une de nos liste de soldes impayés ou que sa carte Opus ait été supprimée ou inscrite sur la liste des cartes perdues ou volées.');
    //                     $('#LSIDialog').dialog({
    //                         dialogClass: 'LSIDialog',
    //                         modal: true,
    //                         close: function() { $('#LSIDialog').dialog('destroy'); },
    //                         buttons: {
    //                             'Fermer': function() {
    //                                 $(this).dialog('close');
    //                             }
    //                         }
    //                     });
    //                 }
    //             }
    //         }
    //     });
    //
    //     return false;
    // }

    function coordToAddress(coord){
        geocoder.geocode({location: coord}, function (results, status) {
            var address = '';

            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    address = results[0].address_components[0].long_name + ' ' + results[0].address_components[1].long_name;
                }
            }

            iw.content = iw.content.replace(/XstrAddressX/g, address);
            iw.content = iw.content.replace(/XstrAddress2X/g, address.replace("'", "\\\'"));

            console.log(address);
        });
    }

    return {
        showMyPerimeter: showMyPerimeter,
        haversine_distance: haversine_distance,
        coordToAddress: coordToAddress,
        checkValidCars: fetchValidCars,
        closestCar: closestCar,
        reserveCar: reserveCar
    }
})();
