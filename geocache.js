//----------------------------------
// geocache.js - define Geocache and GeocacheDB
// 
//		programed by Min Heo (heomin61@gmail.com)
//			2016-04-19		version 0.1 
// ---------------------------------
// constructor
function GeocacheDB(){
    this.geocacheDB = new Array();
    this.GPXOwner = null;
    this.minlat = 0;
    this.maxlat = 0;
    this.minlon = 0;
    this.maxlon = 0;
}

GeocacheDB.prototype.getAllFromDB = function(Memberid) {
    var gDB = this;
    var form_data = {
        memberid: Memberid
    };

    $.ajax({
        type: "POST",
        url: "getAllDB_sql.php",
        dataType: "json",
        data: form_data,
        cache: false,
        success: function(data) {
            gDB.geocacheDB = data;
            $("#ajaxResult").val("getAllDBComplete");
            $("#ajaxResult").change();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.statusText);
            alert(xhr.responseText);
            alert(xhr.status);
            alert(thrownError);
            alert("There's somthing woring");
        }
    });
}

