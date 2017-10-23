<template>
  <div style="height:100%;">
    <span>Welcome: </span><span>{{ loginUser }}</span>
    <p>Place marker at your location. We will always pick the closest available car to your marker.</p>
    <p>Add a reservation perimeter. This is the allowed area where a car can be reserved.</p>
    <button id="myLocation" v-on:click="addPerimeter()" title="Add perimeter">Add Reservation Perimeter</button>
    <span>Max distance (m): </span>
    <input id="myDistance" type="number" value="200" v-model="mapData.myDistance">
    <button id="myListener" v-on:click="monitor()" title="Monitor Area">Monitor Area</button>
    <div id="map"></div>
    <div class="user-modal-container" id="login-modal" :class="{active: active !== null}">
      <div class="user-modal">
        <ul class="form-switcher">
          <li v-on:click="flip('register', $event)"><a href="" id="register-form" :class="{active: active === 'register'}">Register</a>
          </li>
          <li v-on:click="flip('loginReq', $event)"><a href="" id="login-form" :class="{active: active === 'loginReq'}">Login</a>
          </li>
        </ul>
        <div class="form-register" id="form-register" :class="{active: active === 'register'}">
          <p>
            To use this service, you must be registered with Automobile from Communauto. Registration can only be
            done via their website. Use the Register link to be redirected to their website.
          </p>
          <input type="submit" v-on:click="submit('register', $event)" v-model="registerSubmit" id="registerSubmit">
          <div class="links"> <a href="" v-on:click="flip('loginReq', $event)">Already have an account?</a>
          </div>
        </div>
        <div class="form-login" id="form-login" :class="{active: active === 'loginReq'}">
          <div class="error-message" v-text="loginError"></div>
          <input type="text" name="user" placeholder="Email or Username" v-model="loginUser">
          <input type="password" name="password" placeholder="Password" v-model="loginPassword">
          <input type="submit" v-on:click="submit('loginReq', $event)" v-model="loginSubmit" id="loginSubmit" :class="{disabled: !form_login.submitted}">
          <div class="links"> <a href="" v-on:click="flip('password', $event)">Forgot your password?</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'app',
        data() {
            return {
                active: null,

                form_login: {
                    sumbitted: false
                },

                // Submit button text
                registerSubmit: 'Register',
                passwordSubmit: 'Reset Password',
                loginSubmit: 'Login',

                // Modal text fields
                loginUser: '',
                loginPassword: '',

                // Modal error messages
                loginError: '',

                userData: {},

                mapData: {
                    GMaps: {},
                    myLocation: {},
                    myDistance: 100,
                    myPerimeter: null
                },
                validCars: []
            }
        },
        mounted() {
            this.open('loginReq');
        },
        methods: {
            open: function (which, e) {
                if (e) {
                    e.preventDefault();
                }
                if (this.active !== null) {
                    this.active = null;
                }

                this.active = which;
            },
            close: function (which, e) {
                if(e) e.preventDefault();
                if (which === this.active) {
                    this.active = null;
                }
            },
            flip: function (which, e) {
                e.preventDefault();
                if (which === 'password') {
                    window.open('http://www.communauto.com/auto-mobile/sinscrire_en.html', '_blank');
                    return;
                }
                if (which !== this.active) {
                    this.active = which;
                }
            },
            submit: function (which, e) {
                e.preventDefault();
                var data = {
                    form: which
                };

                switch (which) {
                    case 'register':
                        window.open('http://www.communauto.com/auto-mobile/sinscrire_en.html', '_blank');
                        break;
                    case 'loginReq':
                        this.form_login.sumbitted = true;
                        this.loginSubmit = 'Logging In...';
                        this.loggedInAction(this.loginAction);
                        break;
                }

                // TODO: submit our `data` variable
            },
            loginReq: function (callback) {
                var that = this;
                $.ajax({

                    // do the actual signing in based on the entered data

                    url: 'https://www.reservauto.net/Scripts/Client/Ajax/Mobile/Login.asp',
                    type: 'GET',
                    data: {BranchID: 1, Username: this.loginUser, Password: this.loginPassword, RememberMe: true},
                    dataType: 'jsonp',
                    crossdomain: true,
                    contentType: 'application/json; charset=utf-8',
                    success: function (data) {

                        // TODO set the user as signed in

                        if(data.data[0] && data.data[0].ProviderNo === ''){
                            that.loginError = "Invalid Credentials";
                        } else {
                            that.userData = data.data[0];
                        }
                    }
                });
            },
            loggedInAction: function (action) {
                var that = this;
                $.ajax({

                    // check if they are already signed in

                    url: 'https://www.reservauto.net/Scripts/Client/Ajax/Mobile/Login.asp',
                    type: 'GET',
                    data: {URLEnd: 'URLEnd'},
                    dataType: 'jsonp',
                    crossdomain: true,
                    contentType: 'application/json; charset=utf-8',
                    success: function (data) {
                        var CustomerID = parseInt(data.data[0].CustomerID, 10);
                        var ProviderNo = data.data[0].ProviderNo;
                        var Access = data.data[0].Access;

                        // they were not signed in already so sign them in

                        if (isNaN(CustomerID)) {
                            that.loginReq();
                        }
                        else {
                            action(data);
                        }
                    }
                });
            },
            loginAction: function(data){
                //they were signed in already
                this.loginError = "You were already signed in";
                this.userData = data.data[0];

                //show main app
                this.close('loginReq');
                this.initUserPosition();
            },
            showLogin: function(){
              this.open('login');
            },

            /* MAP RELATED FUNCTIONS */
            initUserPosition: function() {

                var that = this;

                  //create map

                var initPos = {
                    latitude: 45.5017,
                    longitude: -73.5673
                };

                  this.mapData.GMaps = new google.maps.Map(document.getElementById('map'), {
                      center: {
                          lat: initPos.latitude,
                          lng: initPos.longitude
                      },
                      zoom: 14
                  });

                  //store location defaults in structure

                  this.mapData.myLocation = {
                      lat: initPos.latitude,
                      lng: initPos.longitude
                  };

                  // Place a draggable marker on the map based on default location

                  var marker = new google.maps.Marker({
                      position: this.mapData.myLocation,
                      map: this.mapData.GMaps,
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

                          that.mapData.myLocation.lat = myPos.coords.latitude;
                          that.mapData.myLocation.lng = myPos.coords.longitude;

                          //move to users position

                          that.mapData.GMaps.panTo(
                              that.mapData.myLocation
                          );

                          //zoom in closer to them

                          setTimeout( function() {
                              that.mapData.GMaps.setZoom(17);
                          }, 1000 );

                          //add movable marker with user locations

                          marker.setPosition(that.mapData.myLocation);

                      });
                  } else {
                      console.log("no location using defaults");
                  }

          },

            addPerimeter: function(){
                this.showMyPerimeter(this.mapData.myDistance);
            },

            showMyPerimeter: function(myDistance){
                var that = this;
                if(this.mapData.myPerimeter === null){
                    this.mapData.myPerimeter = new google.maps.Circle({
                        map: this.mapData.GMaps,
                        editable: true,
                        center: this.mapData.myLocation,
                        radius: myDistance
                    });

                    this.mapData.myPerimeter.setMap(this.mapData.GMaps);

                    // Add an event listener on the rectangle.
                    this.mapData.myPerimeter.addListener('radius_changed', function(){
                        that.mapData.myDistance =  that.mapData.myPerimeter.getRadius()
                    });
                }
            },
            closestCar: function(){
                var smallestVal = Number.MAX_VALUE;
                var smallestIdx = -1;

                this.validCars.forEach(function(val,i){
                    if(val < smallestIdx){
                        smallestVal = val;
                        smallestIdx = i;
                    }
                });

                return this.validCars[0];
            },

            //returns distance in meters
            haversine_distance: function (coords1, coords2) {

                function toRad(x) {
                    return x * Math.PI / 180;
                }

                var dLat = toRad(coords2.lat - coords1.lat);
                var dLon = toRad(coords2.lng - coords1.lng);

                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(coords1.lat)) *
                    Math.cos(toRad(coords2.lat)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);

                return 1000*12742 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            },

            monitor: function(){
                this.fetchValidCars();
            },

            fetchValidCars: function(){

                var that = this;

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

                                    var carPos = {lat: parseFloat(item.Position.Lat), lng: parseFloat(item.Position.Lon)};

                                    if (that.haversine_distance(carPos, that.mapData.myLocation) <= that.mapData.myDistance){
                                        that.validCars.push(item);
                                        new google.maps.Marker({
                                            position: carPos,
                                            map: that.mapData.GMaps,
                                            draggable:false,
                                            title:' ' + that.haversine_distance(carPos, that.mapData.myLocation)
                                        });
                                    }
                                }
                            })
                        }
                        console.log(that.validCars);
                        if(that.validCars.length > 0){

                            //make reservation

                            var closestCar = that.closestCar();

                            //get last used time

                            //get address

                            //BookLSI(closestCar.Id, closestCar.Name, closestCar.ModelName.toLowerCase(), closestCar.Immat, '' , closestCar.EnergyLevel, '' , closestCar.Position.Lat, closestCar.Position.Lon);
                            that.BookLSI(closestCar.Id);

                            alert("Reservation Successful!");

                            that.reserveCar(closestCar);
                        } else{
                            console.log("Currently no available cars in selected perimeter!");
                            setTimeout(that.fetchValidCars, 3000);
                        }
                    }
                });
            },

            reserveCar: function(car){
                console.log(car);
            },

            BookLSI: function(vin){
                $.ajax({
                    url: 'https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/CreateBooking?Callback=?',
                    type: 'GET',
                    data: {CustomerID: "\"\"", "VehicleID": "\"" + vin + "\""},
                    dataType: 'jsonp',
                    crossdomain: true,
                    contentType: 'application/json; charset=utf-8',
                    success: function(data){
                        //TODO success action
                    }
                });
            }
        }
    }
</script>

<style>

    /* Always set the map height explicitly to define the size of the div
 * element that contains the map. */
    #map {
        height: 100%;
    }
    /* Optional: Makes the sample page fill the window. */
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    }

  .user-modal-container * {
    box-sizing: border-box;
  }

  .user-modal-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    visibility: hidden;
    cursor: pointer;
    overflow-y: auto;
    z-index: 3;
    font-family: 'Lato', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif';
    font-size: 14px;
    background-color: rgba(17, 17, 17, .9);
    -webkit-transition: all 0.25s linear;
    -moz-transition: all 0.25s linear;
    -o-transition: all 0.25s linear;
    -ms-transition: all 0.25s linear;
    transition: all 0.25s linear;
  }

  .user-modal-container.active {
    opacity: 1;
    visibility: visible;
  }

  .user-modal-container .user-modal {
    position: relative;
    margin: 50px auto;
    width: 90%;
    max-width: 500px;
    background-color: #f6f6f6;
    cursor: initial;
  }

  .user-modal-container .form-login,
  .user-modal-container .form-register,
  .user-modal-container .form-password {
    padding: 75px 25px 25px;
    display: none;
  }

  .user-modal-container .form-login.active,
  .user-modal-container .form-register.active,
  .user-modal-container .form-password.active {
    display: block;
  }

  .user-modal-container ul.form-switcher {
    margin: 0;
    padding: 0;
  }

  .user-modal-container ul.form-switcher li {
    list-style: none;
    display: inline-block;
    width: 50%;
    float: left;
    margin: 0;
  }

  .user-modal-container ul.form-switcher li a {
    width: 100%;
    display: block;
    height: 50px;
    line-height: 50px;
    color: #666666;
    background-color: #dddddd;
    text-align: center;
  }

  .user-modal-container ul.form-switcher li a.active {
    color: #000000;
    background-color: #f6f6f6;
  }

  .user-modal-container input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #eeeeee;
  }

  .user-modal-container input[type="submit"] {
    color: #f6f6f6;
    border: 0;
    margin-bottom: 0;
    background-color: #3fb67b;
    cursor: pointer;
  }

  .user-modal-container input[type="submit"]:hover {
    background-color: #3aa771;
  }

  .user-modal-container input[type="submit"]:active {
    background-color: #379d6b;
  }

  .user-modal-container .links {
    text-align: center;
    padding-top: 25px;
  }

  .user-modal-container .links a {
    color: #3fb67b;
  }

  .user-modal-container input[type="submit"].disabled {
    background-color: #98d6b7;
  }


</style>
