var USERNAME = 'Mr.X';
var socket = io();

function setUser() {
    USERNAME = decodeURIComponent(window.location.toString().split('?username=')).split(',')[1];
}

function getUser() {
    return USERNAME;
}

function packageMessage(_action, _source, _destination, _cookie, _data) {
    var object = {
        action: _action,
        source: {
            ip: _source.ip,
            port: _source.portaddr
        },
        destination: {
            ip: _destination.ip,
            port: _destination.portaddr
        },
        cookie: _cookie,
        data: _data
    };
    return object;
}