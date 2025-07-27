import fetch from 'isomorphic-fetch';

const token = window.localStorage.getItem('token');

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json; charset=utf-8',
  Authorization: `Bearer ${token}`,
  OPTIONS: '',
};

export function post(url, data) {
  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  }).then((response) => response);
}

export function get(url) {
  return fetch(url, {
    method: 'GET',
    headers,
  }).then((response) => response.json());
}
