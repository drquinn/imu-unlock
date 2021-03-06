/*

Generate 3D render using serial data from IMU

*/

'use strict';

// Declare required variables
var dataRollx = 0;
var dataRolly = 0;
var dataRollz = 0;

// filter vars
var dataRollxArrayA = [];
var dataRollyArrayA = [];
var dataRollzArrayA = [];
var dataRollxArrayB = [];
var dataRollyArrayB = [];
var dataRollzArrayB = [];
var gain = 32;
var c1 = 2.0;
var c2 = -0.57;
var c3 = 2.57;
var c4 = -4.44;
var c5 = 3.43;
var accuracy = 2;
var orderOfMag = (Math.PI/180);
var container;
var camera, scene, renderer;
var cube, plane;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var rotationMax = 0.5;
var accuracy = 2;
var unlocked1 = false;
var unlocked2 = false;
var whiskey = 0;

//Connect to socket.io
//var serverIP = "localhost";
//var socket = io.connect(serverIP + ':5000');
//console.log('socket connected to: ' + serverIP);
var serverIP;
var socket;

$.get('/getIP', function(res) {
    serverIP = res;
    socket = io.connect(serverIP + ':5000');
    console.log('socket connected to: ' + serverIP);
    runSocket();
    init();
    animate();

});


function filterNoise(dataRoll, dataRollArrayA, dataRollArrayB) {
    dataRollArrayA[0] = dataRollArrayA[1];
    dataRollArrayA[1] = dataRollArrayA[2];
    dataRollArrayA[2] = dataRollArrayA[3];
    dataRollArrayA[3] = dataRollArrayA[4];
    dataRollArrayA[4] = (dataRoll / gain); 

    dataRollArrayB[0] = dataRollArrayB[1];
    dataRollArrayB[1] = dataRollArrayB[2];
    dataRollArrayB[2] = dataRollArrayB[3];
    dataRollArrayB[3] = dataRollArrayB[4];
    dataRollArrayB[4] = ((dataRollArrayA[0] + dataRollArrayA[4]) - 
       (c1 * dataRollArrayA[2]) + (c2 * dataRollArrayB[0]) +
       (c3 * dataRollArrayB[1]) + (c4 * dataRollArrayB[2]) +
       (c5 * dataRollArrayB[3]));

    return dataRollArrayB[4];


        //dataRollArray.push(dataRoll);
        //if (Math.abs(dataRollArray[1]) - Math.abs(dataRollArray[0]) > rotationMax){
        //    dataRoll = dataRollArray[0];
        //    console.log("NOISE - " + dataRollArray[1] + " - " + dataRollArray[0]);
        //}
        //if (dataRollArray.length > 1) {
        //    dataRollArray.shift();
        //}
}

// Start reading IMU data
function runSocket() {
        socket.on('serial_update', function(data) {
            if (data.charAt(0) === 'O') {
                console.log(data);
                var dataArray = data.split(/ /);

                // set x
                dataRollx = (dataArray[1] *= orderOfMag).toFixed(accuracy);
                //dataRollx = filterNoise(dataRollx, dataRollxArrayA, dataRollxArrayB);
                
                // set y
                dataRolly = (dataArray[2] *= orderOfMag).toFixed(accuracy);
                //dataRolly = filterNoise(dataRolly, dataRollyArrayA, dataRollxArrayB);

                // set z
                dataRollz = (dataArray[3] *= orderOfMag).toFixed(accuracy);
                //dataRollz = filterNoise(dataRollz, dataRollzArrayA, dataRollxArrayB);


                console.log(dataRollx + "," + dataRolly + "," + dataRollz);
                $("#subHeading").replaceWith("<div id='subHeading'>" + data + "</div>");

                        
                unlock.checkUnlock();

            }
        });
}

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Visualize IMU';
    info.setAttribute('id', 'pourHeading');
    container.appendChild( info );

    $("#pourHeading").append(
        "<div><span id='pumpOn'>Pump on &nbsp;&nbsp;&nbsp;&nbsp;</span><span id='pumpOff'>Pump off</span></div>" +
        "<br />" +
        "<div id='subHeading'></div>"
    );
    $("#pumpOn").click(function() {
        $.get('/pumpOn', function(res) {
        });
    });
    $("#pumpOff").click(function() {
        $.get('/pumpOff', function(res) {
        });
    });

    // Set up camera
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 150;
    camera.position.z = 500;

    scene = new THREE.Scene();

    // Create cube
    var geometry = new THREE.BoxGeometry( 200, 200, 200 );

    for ( var i = 0; i < geometry.faces.length; i += 2 ) {

        var hex = Math.random() * 0xffffff;
        geometry.faces[ i ].color.setHex( hex );
        geometry.faces[ i + 1 ].color.setHex( hex );

    }

    var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );

    cube = new THREE.Mesh( geometry, material );
    cube.position.y = 150;
    scene.add( cube );

    // Create background plane
    var geometry = new THREE.PlaneBufferGeometry( 400, 200 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    var material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0, overdraw: 0.5 } );

    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
        requestAnimationFrame( animate );
        render();
}

function render() {
    cube.rotation.x = -dataRollx;
    cube.rotation.y = -dataRollz;
    cube.rotation.z = -dataRolly;
    renderer.render( scene, camera );
}
