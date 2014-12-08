'use strict';

var unlock = function() {
    // private members
    var checkUnlock = function() {
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
                        $.get('/pumpPour', function(res) {
                        });
                        unlocked2 = true;
                        whiskey++;
                        unlocked1 = unlocked2 = false;
                }
        }
        $("#subHeading").append("<div>" + whiskey + " unlocks: 1 - " + unlocked1 + " 2 - " + unlocked2 + "</div>");
    } 
    


    return {
        // public members
        checkUnlock: checkUnlock
    };
}();
