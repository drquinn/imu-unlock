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
                        unlocked2 = true;
                        setTimeout(resetUnlock, 2000);
                }
        }
        $("#subHeading").append(
            "<div>Drinks Poured: " + whiskey + "<br /><br />" +
            "<span id='unlock1' class='glyphicon glyphicon-ok' aria-hidden='true'></span>" +
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<span id='unlock2' class='glyphicon glyphicon-ok' aria-hidden='true'></span>" +
            "</div>");
        if(unlocked1) {
            $("#unlock1").css("color", "green");
        }
        if(unlocked2) {
            $("#unlock2").css("color", "green");
        }

    } 
    var resetUnlock = function() {
        $.get('/pumpPour', function(res) {
        });
        whiskey++;
        unlocked1 = unlocked2 = false;
    }

    


    return {
        // public members
        checkUnlock: checkUnlock
    };
}();
