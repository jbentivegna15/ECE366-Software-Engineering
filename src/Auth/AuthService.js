import decode from 'jwt-decode';
import { Redirect } from 'react-router-dom';
import auth0 from 'auth0-js';
import axios from 'axios';
import {APICONST, CALLBACKCONST} from '../urlConst';
const ID_TOKEN_KEY = 'id_token';
const ACCESS_TOKEN_KEY = 'access_token';

const CLIENT_ID = 'CtS7hL_GmQPa6DLR-I2ZQIbiPfmu97G1';
const CLIENT_DOMAIN = 'tied.auth0.com';
const REDIRECT = CALLBACKCONST;
const SCOPE = 'openid profile';
const AUDIENCE = 'https://tied.auth0.com/userinfo';


var auth = new auth0.WebAuth({
  clientID: CLIENT_ID,
  domain: CLIENT_DOMAIN,
  scope: SCOPE
});

export function login() {
  auth.authorize({
    responseType: 'token id_token',
    redirectUri: REDIRECT,
    //audience: AUDIENCE,
    scope: SCOPE
  });

}

export function logout() {
  clearIdToken();
  clearAccessToken();
  window.location.href = "/";
}

export function requireAuth(nextState, replace) {
  if (!isLoggedIn()) {
    replace({pathname: '/'});
  }
}

export function getIdToken() {
  return localStorage.getItem(ID_TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function clearIdToken() {
  localStorage.removeItem(ID_TOKEN_KEY);
}

function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Helper function that will allow us to extract the access_token and id_token
function getParameterByName(name) {
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Get and store access_token in local storage
export function setAccessToken() {
  let accessToken = getParameterByName('access_token');
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

// Get and store id_token in local storage
export function setIdToken() {
  let idToken = getParameterByName('id_token');
  localStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function isLoggedIn() {
  const idToken = getIdToken();
  return !!idToken && !isTokenExpired(idToken);
}

export function checkUserInDB(id) {
  axios.get(`${APICONST}/users/${id}`)
                    .then((res) => {
                      console.log(res);
                      if(res == null){
                        return false;
                      } else{
                        return true;
                      }
                    })
                    .catch(err => {
                        console.error(err);
                    });
}

export function getUserIdentifier(callback) {
  var token = getAccessToken();
  var userID;
  axios.get(AUDIENCE, { headers: { Authorization: `Bearer ${token}`,'Content-type': 'application/json'}})
    .then((res) => {
      console.log(res);
      userID = res.data.sub;
      callback(userID);
    })

}

function getTokenExpirationDate(encodedToken) {
  const token = decode(encodedToken);
  if (!token.exp) { return null; }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);

  return date;
}

function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
}
