var initMenu = function() {
    if($(window).width() < 1000) {
        $(".functionMenu").hide();
    }
    $("#openMenu").click(function(){ 
        $(".functionMenu").toggle();
    });
    $("#loginButton").click(function(){
        $("#loginBar").toggle();
    }); 
    
};


