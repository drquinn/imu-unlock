/*

Generate 3D render using serial data from IMU

*/

'use strict';

var dataRollx = 0;
var dataRolly = 0;
var dataRollz = 0;
var dataRollxArray = [];
var dataRollyArray = [];
var dataRollzArray = [];
var rotationMax = 0.5;
var accuracy = 2;
var unlocked1 = false;
var unlocked2 = false;
var whiskey = 0;
var serverIP;

var socket;

$.get('/getIP', function(res) {
    serverIP = res;
    socket = io.connect(serverIP + ':5000');
    console.log('socket connected to: ' + serverIP);
    runSocket();

    unlock.add();
});

var orderOfMag = (3.14159260/180);

function filterNoise(dataRoll, dataRollArray) {
        dataRollArray.push(dataRoll);
        if (Math.abs(dataRollArray[1]) - Math.abs(dataRollArray[0]) > rotationMax){
            dataRoll = dataRollArray[0];
            console.log("NOISE - " + dataRollArray[1] + " - " + dataRollArray[0]);
        }
        if (dataRollArray.length > 1) {
            dataRollArray.shift();
        }
}

function runSocket() {
        socket.on('serial_update', function(data) {
            if (data.charAt(0) === 'O') {
                console.log(data);
                var dataArray = data.split(/ /);

                // set x
                dataRollx = (dataArray[1] *= orderOfMag).toFixed(accuracy);
                filterNoise(dataRollx, dataRollxArray);
                
                // set y
                dataRolly = (dataArray[2] *= orderOfMag).toFixed(accuracy);
                filterNoise(dataRolly, dataRollyArray);

                // set z
                dataRollz = (dataArray[3] *= orderOfMag).toFixed(accuracy);
                filterNoise(dataRollz, dataRollzArray);

                console.log(dataRollx + "," + dataRolly + "," + dataRollz);
                $("#subHeading").replaceWith("<div id='subHeading'>" + data + "</div>");


                var desiredAngle = -90 / 180 * 3.14;
                var rotationCheck = dataRollx - desiredAngle;
                var desiredAngle2 = 90 / 180 * 3.14;
                var rotationCheck2 = dataRollx - desiredAngle2;

                console.log(rotationCheck);
                if (Math.abs(rotationCheck) < 0.2 || unlocked1 === true) {
                        console.log("UNLOCKED - 1");
                        unlocked1 = true;
                        console.log(rotationCheck2);
                        if (Math.abs(rotationCheck2) < 0.2) {
                                console.log("UNLOCKED - 2");
                                unlocked2 = true;
                                whiskey++;
                                unlocked1 = unlocked2 = false;
                        }
                }


                $("#subHeading").append("<div>" + whiskey + " unlocks: 1 - " + unlocked1 + " 2 - " + unlocked2 + "</div>");
            }
        });
}
var container, stats;
var camera, scene, renderer;
var cube, plane;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'POUR ME A WHISKEY';
    info.setAttribute('id', 'pourHeading');
    container.appendChild( info );

    $("#pourHeading").append("<div id='subHeading'></div>");


    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 150;
    camera.position.z = 500;

    scene = new THREE.Scene();

    // Cube

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

    // Plane

    var geometry = new THREE.PlaneBufferGeometry( 400, 200 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    var material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0, overdraw: 0.5 } );

    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );


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
        stats.update();
}

function render() {
    //plane.rotation.y = cube.rotation.y += ( targetRotation - cube.rotation.y ) * 0.05;
    cube.rotation.x = -dataRollx;
    cube.rotation.y = -dataRollz;
    cube.rotation.z = -dataRolly;
    renderer.render( scene, camera );

}

