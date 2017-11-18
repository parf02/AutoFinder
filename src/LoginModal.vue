<template>
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
</template>

<script>
    export default {
        name: 'LoginModal',
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
            }
        },
        watch: {
            // whenever car changes. open modal
            pendingCar: function () {
                if(this.pendingCar.Id !== null){
                    $('.modal').modal('open');
                }
            }
        },
        computed: {
        },
        mounted() {
            this.loadLoginCreds();
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
            loginSuccessAction: function(data){

                this.saveLoginCreds(data);
                this.form_login.loggedIn = true;
                this.userData = data.data[0];

                //show main app
                this.close('loginReq');
                this.initUserPosition();
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

  #infoCntr{
    height: 40%;
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

</style>
