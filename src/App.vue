<template>
  <div>
    <div id="fake-nav"> <a href="#register" v-on:click="open('register', $event)">Register</a>
      <a href="#login" v-on:click="open('login', $event)">Login</a>
    </div>
    <div class="user-modal-container" id="login-modal" v-on:click="close" :class="{active: active !== null}">
      <div class="user-modal">
        <ul class="form-switcher">
          <li v-on:click="flip('register', $event)"><a href="" id="register-form" :class="{active: active === 'register'}">Register</a>
          </li>
          <li v-on:click="flip('login', $event)"><a href="" id="login-form" :class="{active: active === 'login'}">Login</a>
          </li>
        </ul>
        <div class="form-register" id="form-register" :class="{active: active === 'register'}">
          <p>
            To use this service, you must be registered with Automobile from Communauto. Registration can only be
            done via their website. Use the Register link to be redirected to their website.
          </p>
          <input type="submit" v-on:click="submit('register', $event)" v-model="registerSubmit" id="registerSubmit">
          <div class="links"> <a href="" v-on:click="flip('login', $event)">Already have an account?</a>
          </div>
        </div>
        <div class="form-login" id="form-login" :class="{active: active === 'login'}">
          <div class="error-message" v-text="loginError"></div>
          <input type="text" name="user" placeholder="Email or Username" v-model="loginUser" v-on:keyup="submit('login', $event)">
          <input type="password" name="password" placeholder="Password" v-model="loginPassword" v-on:keyup="submit('login', $event)">
          <input type="submit" v-on:click="submit('login', $event)" v-model="loginSubmit" id="loginSubmit" :class="{disabled: form_login.submitted}">
          <div class="links"> <a href="" v-on:click="flip('password', $event)">Forgot your password?</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    export default{
        name: 'app',
        data() {
            return{
                active: null,

                form_login: {
                    sumbitted: false
                },

                form_register: {
                },

                // Submit button text
                registerSubmit: 'Register',
                passwordSubmit: 'Reset Password',
                loginSubmit: 'Login',

                // Modal text fields
                loginUser: '',
                loginPassword: '',

                // Modal error messages
                loginError: ''
            }
        },
        mounted(){
            this.open('login');
        },
        methods: {
            open: function (which, e) {
                if(e){
                    e.preventDefault();
                }
                if (this.active !== null) {
                  this.active = null;
                }

                this.active = which;
            },
            close: function (e) {
                e.preventDefault();
                if (e.target === this.$el) {
                    this.active = null;
                }
            },
            flip: function (which, e) {
                e.preventDefault();
                if(which === 'password'){
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
                    case 'login':
                        this.form_login.sumbitted = true;
                        data.user = this.loginUser;
                        data.password = this.loginPassword;
                        this.$set('loginSubmit', 'Logging In...');
                        break;
                }

                // TODO: submit our `data` variable
            }
        }
    };
</script>

<style>
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
