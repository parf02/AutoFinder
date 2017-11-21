<template>
  <div style="height:100%;">
    <div class="fill-height-or-more">
      <nav>
        <div class="nav-wrapper blue-grey">
          <a href="#!" class="brand-logo center">AutoFinder</a>
          <a href="#" data-activates="slide-out" class=" show-on-large button-collapse"><i class="material-icons">menu</i></a>
          <ul id="slide-out" class="side-nav">
            <li>
              <div class="user-view">
                <div class="background">
                  <img src="../static/background-sidebar.jpg">
                </div>
                <a href="#!user"><img class="circle" src="../static/person.png"></a>
                <a href="#!name"><span class="white-text name">{{ displayNameUser }}</span></a>
                <a href="#!email"><span class="white-text email">City: Montreal</span></a>
                <a v-on:click="logout()"><span style="border: 2px solid white;padding: 4px;"><div style="display:inline-block;" class="border white-text email">Logout</div></span></a>
              </div>
            </li>
            <!--<li><a class="subheader">Options</a></li>-->
            <!--<li><a href="#!"><i class="material-icons">map</i>Map Options</a></li>-->
            <!--<li><a href="#!"><i class="material-icons">location_searching</i>Monitor Options</a></li>-->
            <!--<li><div class="divider"></div></li>-->
            <li><a class="subheader">How To Use</a></li>
            <li v-on:click="showHelp('perimeter')"><a class="waves-effect" href="#!">Monitor Area</a></li>
            <li v-on:click="showHelp('reservations')"><a class="waves-effect" href="#!">Reservations</a></li>
            <li v-on:click="showHelp('faq')"><a class="waves-effect" href="#!">FAQ</a></li>
          </ul>
        </div>
      </nav>
      <div id="infoCntr">
        <div id="info">
          <ul class="collapsible" data-collapsible="accordion">
            <li>
              <div class="collapsible-header"><i class="material-icons">place</i>Starting Address (optional)</div>
              <div class="collapsible-body">
                <places
                      v-model="form.country.label"
                      placeholder="Starting Address (optional)"
                      @change="val => { if(val.latlng !== undefined){form.country.data = val; updateLocation(form.country.data.latlng);}}"
                      :options="{ countries: ['CA'], appId:'plYQC72L7LQ5', apiKey: '4c671e357b012ca26e62ac59b3299177' }">
                </places>
              </div>
            </li>
            <li>
              <div class="collapsible-header active"><i class="material-icons">directions_run</i>Max Distance</div>
              <div class="collapsible-body">
                <div>
                  <span>Max walking distance ({{ myTimeDistance }} min): </span>
                  <p class="range-field-custom">
                    <input id="myDistance" type="range" min="1" max="30" v-model="myTimeDistance">
                  </p>
                </div>
              </div>
            </li>
          </ul>
          <div>
            <button id="myListener" class="btn btn-block" v-bind:class="{'green lighten-1': monitorLoop === null, 'red lighten-1': monitorLoop !== null}" v-on:click="monitorBtnPress()" title="Monitor Area" v-text="monitorButtonText"></button>
          </div>
          <input type="checkbox" id="showCars" v-model="showCars" title="Show communauto cars"/>
        </div>
      </div>
      <div id="mapCntr">
        <div v-if="loaderActive" id="loaderCntr">
          <div class="preloader-wrapper active">
            <div class="spinner-layer spinner-red-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div><div class="gap-patch">
              <div class="circle"></div>
            </div><div class="circle-clipper right">
              <div class="circle"></div>
            </div>
            </div>
          </div>
        </div>
        <div id="map"></div>
      </div>
    </div>
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
          <input type="submit" v-on:click="submit('loginReq', $event)" v-model="loginSubmit" id="loginSubmit" :class="{disabled: form_login.loggedIn}">
          <div class="links"> <a href="" v-on:click="flip('password', $event)">Forgot your password?</a>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Structure -->
    <div id="modal1" class="modal">
      <div v-if="pendingCar.Id !== null" class="modal-content">
        <h4>Current Reservation</h4>
        <div>
          <div><span>Car Number: </span><span>{{ pendingCar.Name }}</span></div>
          <div><span>License: </span><span>{{ pendingCar.Immat }}</span></div>
          <div><span>Model: </span><span>{{ pendingCar.ModelName }}</span></div>
          <div><span>Address: </span><span>{{ pendingCar.formattedAddress }}</span></div>
        </div>
      </div>
      <div v-if="pendingCar.Id === null" class="modal-content">
        <h4>Current Reservation</h4>
        <div>
          <span>You currently have no reservations</span>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="right modal-action modal-close waves-effect waves-green btn-flat" v-on:click="">OK</a>
        <a v-if="pendingCar.Id !== null" href="#!" class="left red modal-action modal-close waves-effect waves-green btn-flat" v-on:click="cancelBooking()">Cancel Block</a>
      </div>
    </div>

    <div id="tutorialModal" class="modal modal-fixed-footer">
      <div v-if="tutorialInfo === 'perimeter'" class="modal-content">
        <h4>Monitor Perimeter</h4>
        <div>
          <p>
            The black circle indicates the area where cars will be located. The application
            periodically verifies if a new automobile has been released within the designated
            perimeter. When one becomes available, the reservation is made.
          </p>
          <p>
            At any time during the search, if you want to manually book a car on the map, you may
            do so by pressing on it and choosing "Block Car". Moreover, the perimeter can be
            modified at any time by enlarging it manually or via the max walking distance slider.
          </p>
        </div>
      </div>
      <div v-if="tutorialInfo === 'faq'" class="modal-content">
        <h4>FAQ</h4>
        <div>
          <div>Q: Can I book more than one car at the same time?</div>
          <div>A: No, as set by communauto, this is not possible.</div>
          <br>
          <div>Q: Can I have more than 30 minutes to get to the car.</div>
          <div>A: No, as set by communauto, this is not possible.</div>
          <br>
          <div>Q: Can I book ordinary communauto vehicles through this app?</div>
          <div>A: No, this function is not currently available at the moment.</div>
        </div>
      </div>
      <div v-if="tutorialInfo === 'reservations'" class="modal-content">
        <h4>Reservations</h4>
        <div>
          Reservations are made through the same process as used by Communauto.
          This means that once the car has been blocked, you have 30 minutes
          to get to it before it is released. The same rules and regulations
          apply as when booked directly through communauto.
        </div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat ">OK</a>
      </div>
    </div>

    <div id="modalError" class="modal">
      <div class="modal-content">
        <h4>Error</h4>
        <div>
          <div>
            <span>Your account does not currently allow for new reservations</span>
          </div>
          <ol>
            <li>
              <div>Only Montreal-based accounts are currently supported in AutoFinder</div>
            </li>
            <li>
              <div>Otherwise, you may have unpaid bills with Communauto(R) or a problem with your account.</div>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <div v-if="form_login.loggedIn" class="fixed-action-btn toolbar left">
      <a class="btn-floating btn-large red">
        <i class="large material-icons">map</i>
      </a>
      <ul>
        <li class="waves-effect waves-light" v-on:click="showReservation()"><a href="#!"><i class="material-icons">directions_car</i></a></li>
        <li class="waves-effect waves-light" v-on:click="initUserPosition()"><a href="#!"><i class="material-icons">gps_fixed</i></a></li>
        <li class="waves-effect waves-light" v-on:click="refreshValidCars()"><a href="#!"><i class="material-icons">refresh</i></a></li>
      </ul>
    </div>
  </div>
</template>

<script>
    var Materialize = require('../static/js/materialize.js');
    var MaterializeCSS = require('../static/css/materialize.css');
    import Places from 'vue-places';
    import {WALK_M_PER_MIN} from '../static/js/constants.js';


    export default {
        name: 'app',
        data() {
            return {

                //which modal pane is currently active
                active: null,

                form_login: {
                    loggedIn: false
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

                custIDToUserMap: {},

                mapData: {
                    GMaps: null,
                    Geocoder: null,
                    myLocation: {lat: [], lng: []},
                    myDistance: 100,
                    myTimeDistance: 5,
                    myPerimeter: null,
                    marker: null,
                    carMarkers: []
                },
                myTimeDistance: 2,
                validCars: [],

                showCars: true,

                monitorLoop: null,

                pendingCar: {
                    "HasPromo": null,
                    "ExtensionData": null,
                    "Id": null,
                    "Name": null,
                    "ModelName": null,
                    "Immat": null,
                    "EnergyLevel": null,
                    "Position": null,
                    "formattedAddress": null
                },

                infoWindow: null,

                blockInfoButton: "Block Car<i class='material-icons right'>directions_car</i>",

                form: {
                    country: {
                        label: null,
                        data: {},
                    },
                },

                loaderActive: false,

                tutorialInfo:{
                    header:'',
                    content:''
                }
            }
        },
        watch: {
            // whenever time distance is changed
            myTimeDistance: function (newDistance) {
              this.mapData.myDistance = newDistance*WALK_M_PER_MIN;
              this.mapData.myPerimeter.setRadius(this.mapData.myDistance);
              this.mapData.GMaps.fitBounds(this.mapData.myPerimeter.getBounds());
            }
        },

        components: {
            Places
        },
        computed: {

            // At this point, we are displaying the app logged in.
            // this means that the dictionary contains a key as the customerID
            displayNameUser: function() {
                var userName = undefined;
                var customerID;

                customerID = this.userData.CustomerID;
                if(customerID){
                    userName = this.custIDToUserMap[this.userData.CustomerID];
                }

              return userName === undefined? '': userName;
            },
            monitorButtonText: function(){

                var btnText = '';
                if(this.monitorLoop === null){
                    if(this.pendingCar && this.pendingCar.Id !== null){
                        btnText = 'See Current Reservation';
                    } else {
                        btnText = 'Start Search';
                    }
                } else {
                    btnText = 'Stop Search';
                }
                return btnText
            },
            walkingDistance: function(){
                return Math.ceil(this.mapData.myDistance/WALK_M_PER_MIN);
            }
        },
        mounted() {
            this.loadLoginCreds();
            this.loggedInAction(this.autoSignInAttempt, this.loginSuccessAction);

            var modals = document.querySelector('.modal');
            var errorModal = document.querySelector('#modalError');
            var instance = new M.Modal(modals, {});
            errorModal.modal({
                    dismissible: false,
            });

            $('.button-collapse').sideNav({
                menuWidth: 300, // Default is 300
                edge: 'left', // Choose the horizontal origin
                closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
                draggable: true, // Choose whether you can drag to open on touch screens,
                onOpen: function(el) {}, // A function to be called when sideNav is opened
                onClose: function(el) {}, // A function to be called when sideNav is closed
             });

            $('.collapsible').collapsible();

            document.getElementById('mapCntr').style.height = window.innerHeight + "px";
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
                        this.loginSubmit = 'Logging In...';
                        this.loginAttempt();
                        break;
                }

                // TODO: submit our `data` variable
            },
            loginAttempt: function (callback) {
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
                            that.showLogin();
                            that.loginError = "Invalid Credentials";
                            that.loginSubmit = 'Login';

                        } else {
                            that.loginSuccessAction(data);
                        }
                    }
                });
            },
            autoSignInAttempt: function (callback) {
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
                            that.showLogin();
                        } else {
                            that.loginSuccessAction(data);
                        }
                    }
                });
            },
            loggedInAction : function (loggedOutAction, loggedInAction) {
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

                        // they were not signed in already so ask them to sign in

                        if (isNaN(CustomerID)) {

                            //check if the app internal has their credentials
                            loggedOutAction();
                        }

                        //if they were already signedin, do the desired action
                        else {
                            loggedInAction(data);
                        }
                    }
                });
            },
            loginSuccessAction: function(data){

                if(
                    data.data[0].CityID != 59 ||
                    data.data[0].BalanceTypeGrace_BankError !== "False" ||
                    data.data[0].BalanceTypeGrace_Delay !== "False" ||
                    data.data[0].BalanceTypeGrace_Max !== "False" ||
                    data.data[0].CreditCardExpired !== "False"
                ){
                  $('#modalError').modal('open');
                }

                this.saveLoginCreds(data);
                this.form_login.loggedIn = true;
                this.userData = data.data[0];

                //show main app
                this.close('loginReq');
                this.initUserPosition();
                this.showValidCars();

                //check if they have reservations

                this.checkBookings();
            },
            showLogin: function(){
              this.open('loginReq');
            },

            saveLoginCreds: function(data){

                //save the user and custID
                var customerID = parseInt(data.data[0].CustomerID, 10);

                //when the user is automatically logged in from the start, don't save the username
                if(this.loginUser !== '') this.custIDToUserMap[customerID] = this.loginUser;

                //save for future
                window.localStorage.setItem("autofinder.creds", JSON.stringify(this.custIDToUserMap));
            },

            loadLoginCreds: function(){
                var map = JSON.parse(window.localStorage.getItem("autofinder.creds"));
                this.custIDToUserMap = map === null? {}: map;
            },

            logout: function(){
                var that = this;
                try {
                    $.ajax({

                        // check if they are already signed in

                        url: 'https://www.reservauto.net/Scripts/Client/Mobile/Login.asp' +
                        '?BranchID=1&Logout=True&CurrentLanguageID=2&Callback=that.showLogin',
                        type: 'GET',
                        data: {},
                        dataType: 'jsonp',
                        crossdomain: true,
                        contentType: 'application/json; charset=utf-8',
                        success: function (data) {
                            that.showLogin();

                        }
                    });
                } catch(e){
                    console.log("logout");
                }
                that.form_login.loggedIn = false;
                that.loginError = "";
                that.loginSubmit = 'Login';
                that.showLogin();
            },

            /* MAP RELATED FUNCTIONS */
            initUserPosition: function() {

                var that = this;

                  //create map

                var initPos = {
                    latitude: 45.5017,
                    longitude: -73.5673
                };

                if(!this.mapData.GMaps) {
                    this.mapData.GMaps = new google.maps.Map(document.getElementById('map'), {
                        center: {
                            lat: initPos.latitude,
                            lng: initPos.longitude
                        },
                        zoom: 14
                    });

                    this.mapData.Geocoder = new google.maps.Geocoder;

                    //store location defaults in structure

                    this.mapData.myLocation = {
                        lat: initPos.latitude,
                        lng: initPos.longitude
                    };
                }

                  // Place a draggable marker on the map based on default location

                  var marker;

                  if(!that.mapData.marker){
                      marker = new google.maps.Marker({
                          position: this.mapData.myLocation,
                          map: this.mapData.GMaps,
                          draggable: true,
                          title: "Your Location"
                      });

                      that.mapData.marker = marker;

                      google.maps.event.addListener(marker, "dragend", function () {
                          var newLocation = marker.getPosition();
                          that.mapData.myLocation.lat = newLocation.lat();
                          that.mapData.myLocation.lng = newLocation.lng();
                          that.moveMyPerimeter();
                      });
                  }

                  //get user location

                  if (navigator.geolocation) {
                      that.showMyPerimeter(this.mapData.myDistance);
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

                          that.mapData.marker.setPosition(that.mapData.myLocation);

                          that.showMyPerimeter(that.mapData.myDistance)

                      });
                  } else {
                      console.log("no location using defaults");
                      that.showMyPerimeter(this.mapData.myDistance)
                  }
          },

            updateLocation: function(nLatlng){
                this.mapData.myLocation = nLatlng;
                this.mapData.marker.setPosition(nLatlng);
                this.mapData.GMaps.panTo(nLatlng);
                this.moveMyPerimeter();
            },

            showMyPerimeter: function(myDistance){
                var that = this;
                if(this.mapData.myPerimeter === null){
                    this.mapData.myPerimeter = new google.maps.Circle({
                        map: this.mapData.GMaps,
                        editable: true,
                        draggable: false,
                        center: this.mapData.myLocation,
                        radius: myDistance
                    });

                    var dummyMarker = new google.maps.Marker({
                        visible: false,
                        map: this.mapData.GMaps,
                    });

                    this.mapData.myPerimeter.bindTo('center', dummyMarker, 'position');

                    google.maps.event.addListener(this.mapData.myPerimeter, 'center_changed', function(){
                        that.mapData.marker.setPosition(that.mapData.myLocation);
                    });

                    this.mapData.myPerimeter.setMap(this.mapData.GMaps);

                    // Add an event listener on the rectangle.
                    this.mapData.myPerimeter.addListener('radius_changed', function(){
                        that.mapData.myDistance =  that.mapData.myPerimeter.getRadius();
                        that.myTimeDistance = Math.ceil(that.mapData.myDistance/WALK_M_PER_MIN);
                    });
                } else {
                    that.moveMyPerimeter();
                }
            },
            moveMyPerimeter: function(){
                if(this.mapData.myPerimeter !== null){
                    this.mapData.myPerimeter.setCenter(this.mapData.myLocation);
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

            monitorBtnPress: function(){

                if(this.monitorLoop !== null){
                    this.stopMonitor();
                } else {
                    if(this.pendingCar.Id !== null){
                        this.showReservation();
                    } else {
                        cordova.plugins.backgroundMode.overrideBackButton();
                        cordova.plugins.backgroundMode.enable();
                        cordova.plugins.backgroundMode.setDefaults({
                          title: "AutoFinder",
                          text: "Searching for an automobile...",
                          icon: 'icon',
                          color: 'F14F4D',
                          resume: true,
                          hidden: false,
                          bigText: false
                        });
                        this.monitorLoop = setTimeout(this.checkValidCars, 30000);
                    }
                }
            },

            stopMonitor: function(){
                cordova.plugins.backgroundMode.disable();
                clearTimeout(this.monitorLoop);
                this.monitorLoop = null;
            },

            checkValidCars: function(){

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

                            that.validCars = [];

                            $.each(data.Vehicules, function (i, item) {
                                if (item != null) {

                                    var carPos = {lat: parseFloat(item.Position.Lat), lng: parseFloat(item.Position.Lon)};

                                    if (that.haversine_distance(carPos, that.mapData.myLocation) <= that.mapData.myDistance){
                                        that.validCars.push(item);
//                                        new google.maps.Marker({
//                                            position: carPos,
//                                            map: that.mapData.GMaps,
//                                            draggable:false,
//                                            title:' ' + that.haversine_distance(carPos, that.mapData.myLocation)
//                                        });
                                    }
                                }
                            })
                        }
                        console.log(that.validCars);
                        if(that.validCars.length > 0){

                            var expired = new Date((new Date).getTime() + 30*60000);

                            //make reservation

                            var closestCar = that.closestCar();

                            //get last used time

                            //get address

                            that.reserveCar(closestCar, function(){
                                cordova.plugins.backgroundMode.configure({
                                  title: "AutoFinder",
                                  text: "Automobile reserved!"
                            });
                            //cordova.plugins.notification.local.setDefaults({
                            //    led: { color: '#FF00FF', on: 500, off: 500 },
                            //    vibrate: true,
                            //    sound: true
                            //});
                            cordova.plugins.notification.local.schedule({
                                title: 'Reservation Succesful!',
                                text: 'Car is blocked until ' + ('0' + expired.getHours()).slice(-2) + ":" + ('0' + expired.getMinutes()).slice(-2)
                            });
                                that.showReservation();
                                that.refreshValidCars();
                                that.checkBookings();
                            });
                        } else{
                            console.log("Currently no available cars in selected perimeter!");
                            that.monitorLoop = setTimeout(that.checkValidCars, 3000);
                        }
                    }
                });
            },

            showReservation(){
                $('#modal1').modal('open');
                if(this.pendingCar.Id !== null){
                    this.mapData.GMaps.panTo(
                        {
                            lat: this.pendingCar.Position.Lat,
                            lng: this.pendingCar.Position.Lon
                        }
                    );
                    this.mapData.GMaps.setZoom(17);
                }
            },

            showValidCars: function(callback){

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

                                    var carPos = {
                                        lat: parseFloat(item.Position.Lat),
                                        lng: parseFloat(item.Position.Lon)
                                    };

                                    var carMarker = new google.maps.Marker({
                                        position: carPos,
                                        icon: require('./assets/car-2.png'),
                                        map: that.mapData.GMaps
                                    });

                                    //show on map

                                    var infowindow = new google.maps.InfoWindow({
                                        content:
                                        "<div carID='" + item.Id + "'>" +
                                            "<h6 class='title full-width'>Car Information</h6>" +
                                            "<div>Car Model: " + item.ModelName + "</div>" +
                                            "<div>Car ID: " + item.Name + "</div>" +
                                            "<div>Fuel Level: " + item.EnergyLevel + "</div>" +
                                            "<div>Plate Number: " + item.Immat + "</div>" +
                                            "<button id='manualReserve' class=\'btn waves-effect waves-light' type='submit' name='action'>" +
                                        that.blockInfoButton +
                                            "</button>" +
                                        "</div>"
                                    });

                                    infowindow.addListener("domready", function() {
                                        if(that.infoWindow !== null) that.infoWindow.close();
                                        that.infoWindow = this;
                                        $("button#manualReserve").on("click", function(e) {
                                            if(that.pendingCar.Id === item.Id){that.showReservation();return;}
                                            if(that.pendingCar.Id !== null){
                                                Materialize.toast('Only 1 reservation at a time is possible.', 4000);// 4000 is the duration of the toast
                                                return;
                                            }
                                            var button = this;
                                            this.innerHTML = "<img style='height:100%' src='" + require('./assets/loading.gif') + "'/>";

                                            that.reserveCar(item, function(){
                                                that.showReservation();
                                                carMarker.setIcon(require('./assets/car-reserved.png'));
                                                button.innerHTML = "<span>Reserved</span>";
                                                that.pendingCar.carMarker = carMarker;
                                            });
                                        });
                                    });

                                    infowindow.addListener("closeclick", function() {
                                        that.infoWindow = null;
                                    });

                                    carMarker.addListener('click', function() {
                                        infowindow.open(that.mapData.GMaps, carMarker);
                                    });

                                    that.mapData.carMarkers.push(carMarker);
                                }
                            });
                        }

                        if(callback) callback();
                    }
                });
            },

            refreshValidCars(){
                var that = this;
                that.loaderActive = true;
                for(var i=0; i< this.mapData.carMarkers.length; i++){
                    this.mapData.carMarkers[i].setMap(null);

                }
                this.mapData.carMarkers.length = [];
                this.showValidCars(function(){
                    that.loaderActive = false;
                });
            },

            reserveCar: function(car, successCB){
                if(this.pendingCar.Id!==null){
                    Materialize.toast('Only 1 reservation at a time is possible.', 4000);// 4000 is the duration of the toast
                    return;
                }
                this.loggedInAction(this.loginAttempt,this.bookCar(car, successCB));
            },

            bookCar: function(car, successCB){
                var that = this;
                return function(){
                    $.ajax({
                        url: 'https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/CreateBooking?Callback=?',
                        type: 'GET',
                        data: {CustomerID: "\"\"", "VehicleID": "\"" + car.Id + "\""},
                        dataType: 'jsonp',
                        crossdomain: true,
                        contentType: 'application/json; charset=utf-8',
                        success: function(data) {

                            if(true){
                                that.stopMonitor();

                                that.mapData.Geocoder.geocode({
                                    'location': {
                                        lat: car.Position.Lat,
                                        lng: car.Position.Lon
                                    }
                                }, function (results, status) {
                                    if (status === 'OK') {
                                        if (results[0]) {
                                            car['formattedAddress'] = results[0].formatted_address;
                                        } else {
                                            car['formattedAddress'] = 'See on map';
                                        }
                                    } else {
                                        car['formattedAddress'] = 'See on map';
                                    }

                                    that.pendingCar = car;

                                    successCB();
                                });
                            }
                        }
                    });
                }
            },

            checkBookings(){
                var that = this;
                $.ajax({
                    url: 'https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/GetCurrentBooking?Callback=?',
                    type: 'GET',
                    data: { CustomerID: "\"C000030336\"" },
                    dataType: 'jsonp',
                    crossdomain: true,
                    contentType: 'application/json; charset=utf-8',
                    success: function (data) {
                        if (data != null) {

                            that.pendingCar = data.Vehicule;

                            var latlng = new google.maps.LatLng(data.Vehicule.Position.Lat, data.Vehicule.Position.Lon);

                            var carMarker = new google.maps.Marker({
                                position:latlng,
                                icon: require('./assets/car-reserved.png'),
                                map: that.mapData.GMaps
                            });

                            carMarker.addListener('click', function() {
                                that.showReservation();
                            });

                            that.pendingCar.carMarker = carMarker;
                            that.mapData.Geocoder.geocode({ 'latLng': latlng }, function (results, status) {

                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[0]) {
                                        that.$set(that.pendingCar, 'formattedAddress', results[0].formatted_address);
                                    } else {
                                        that.pendingCar.formattedAddress = 'See on map';
                                    }
                                }
                            });
                        }
                    }
                });

            },

            cancelBooking(){
                var that = this;
                $.ajax({
                    url: 'https://www.reservauto.net/WCF/LSI/LSIBookingService.asmx/CancelBooking',
                    type: 'GET',
                    data: {CustomerID: "\"" + this.userData.CustomerID + "\"", VehicleID: "\"" + that.pendingCar.Id + "\""},
                    dataType: 'jsonp',
                    crossdomain: true,
                    contentType: 'application/json; charset=utf-8',
                    success: function(data) {

                        if(that.pendingCar.carMarker) that.pendingCar.carMarker.setMap(null);

                        if(data){
                            var key;
                            for (key in that.pendingCar) {
                                if (that.pendingCar.hasOwnProperty(key)) {
                                    that.pendingCar[key] = null;
                                }
                            }
                        }

                        that.refreshValidCars();

                        Materialize.toast('Reservation Cancelled', 4000) // 4000 is the duration of the toast
                    }
                });
            },
            showHelp(help){
                this.tutorialInfo = help;
                $('#tutorialModal').modal('open');
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

    #myListener{
      max-width: 500px;
      margin: auto;
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

  #infoCntr{
    height: 40%;
    padding: 10px;
    width:100%;
    display: inline-block;
    text-align: center;
    background-color: ;
  }

  #info{
    margin: 0 auto;
    max-width: 500px;
  }

  #mapCntr{
    height: 500px;
  }

    .fill-height-or-more {
      display: -webkit-box;
      display: -webkit-flex;
      display: -moz-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -webkit-flex-direction: column;
      -moz-box-orient: vertical;
      -moz-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
    }

    .fill-height-or-more > div,
    .fill-height-or-more > nav{
      -webkit-box-flex: 1;
      -webkit-flex: 1;
      -moz-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      display: -webkit-box;
      display: -webkit-flex;
      display: -moz-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-pack: center;
      -webkit-justify-content: center;
      -moz-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -webkit-flex-direction: column;
      -moz-box-orient: vertical;
      -moz-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
    }

  #manualReserve{
    margin-top: 8px;
  }
    .fixed-action-btn{
      left: 24px;
    }

  #loaderCntr{
    height: 0px;
    z-index: 10000;
    margin: auto;
    width: 50px;
  }
    .preloader-wrapper{
      top: 50%;
      position: absolute;
      margin: auto;
    }

  .background img{
    width: 100%;
  }

  .collapsible-body{
    background-color: white;
  }
  .ap-footer{
    display: none;
  }
  .ap-suggestion{
    text-align: left;
  }

  nav .brand-logo {
    font-size: 1.8rem;
  }

  input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  margin: 14.8px 0;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4.4px;
  cursor: pointer;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px rgba(13, 13, 13, 0);
  background: #b2b2b2;
  border-radius: 1.3px;
  border: 0.2px solid #000001;
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 0px 0px 1px #000000, 0px 0px 0px #0d0d0d;
  border: 0px solid #000000;
  height: 34px;
  width: 15px;
  border-radius: 50px;
  background: #00a98b;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -15px;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: #cecece;
}
input[type=range]::-moz-range-track {
  width: 100%;
  height: 4.4px;
  cursor: pointer;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px rgba(13, 13, 13, 0);
  background: #b2b2b2;
  border-radius: 1.3px;
  border: 0.2px solid #000001;
}
input[type=range]::-moz-range-thumb {
  box-shadow: 0px 0px 1px #000000, 0px 0px 0px #0d0d0d;
  border: 0px solid #000000;
  height: 34px;
  width: 15px;
  border-radius: 50px;
  background: #00a98b;
  cursor: pointer;
}
input[type=range]::-ms-track {
  width: 100%;
  height: 4.4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: #969696;
  border: 0.2px solid #000001;
  border-radius: 2.6px;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px rgba(13, 13, 13, 0);
}
input[type=range]::-ms-fill-upper {
  background: #b2b2b2;
  border: 0.2px solid #000001;
  border-radius: 2.6px;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px rgba(13, 13, 13, 0);
}
input[type=range]::-ms-thumb {
  box-shadow: 0px 0px 1px #000000, 0px 0px 0px #0d0d0d;
  border: 0px solid #000000;
  height: 34px;
  width: 15px;
  border-radius: 50px;
  background: #00a98b;
  cursor: pointer;
  height: 4.4px;
}
input[type=range]:focus::-ms-fill-lower {
  background: #b2b2b2;
}
input[type=range]:focus::-ms-fill-upper {
  background: #cecece;
}


</style>
