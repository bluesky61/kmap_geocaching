var initMenu = function(koMap) {
    if($(window).width() < 1000) {
        $(".functionMenu").hide();
        $("#openMenu").hide();
        $("#terrain").hide();
        koMap.dMap.removeOverlayMapTypeId(daum.maps.MapTypeId.TERRAIN);
        koMap.terrainOn = false;
        $.cookie('foundDisplay', '0');
        $.cookie('placedDisplay', '0');
        
        $("#daumdropdown").replaceWith('<button type="button" class="btn btn-success  btn-sm" id="daum">다음</button>');
    }
    $("#openMenu").click(function(){ 
        $(".functionMenu").toggle();
    });
    $("#loginButton").click(function(){
        $("#loginBar").toggle();
    }); 
    $("#login").click( function(){
        $("#loginBar").hide();
        checkLogin(); // trigger "#ajaxResult"
    });
            
    $("#terrain").click(function(){
        koMap.terrainOnOff();
    });
    
    if(Number($.cookie('foundDisplay')))
        $("#viewFound").prop( "checked", true );
    if(Number($.cookie('placedDisplay')))
        $("#viewPlaced").prop( "checked", true );

    $("#viewSettingButton").click(function(){
        var oldFound = Number($.cookie('foundDisplay'));
        var oldPlaced = Number($.cookie('placedDisplay'));

        var newFound = $("#viewFound").is(':checked');
        var newPlaced = $("#viewPlaced").is(':checked');
        var whichmap = ($(window).width() > 1000) ? "ALL" : "daum";
        
        if(oldFound == false && newFound == true) {
            koMap.showFoundMarkers(whichmap);
            koMap.isFoundDisplay = true;
            $.cookie('foundDisplay', '1');

        } else if(oldFound == true && newFound == false) {
            koMap.hideFoundMarkers(whichmap);
            koMap.isFoundDisplay = false;
            $.cookie('foundDisplay', '0');
        }
        
        if(oldPlaced == false && newPlaced == true) {
            koMap.showPlacedMarkers(whichmap);
            koMap.isPlacedDisplay = true;
            $.cookie('placedDisplay', '1');
        } else if(oldPlaced == true && newPlaced == false) {
            koMap.hidePlacedMarkers(whichmap);
            koMap.isPlacedDisplay = false;
            $.cookie('placedDisplay', '0');
        }
    });          
};

