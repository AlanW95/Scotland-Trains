/**
 * Created by B00291854 & B00291774 on 22/03/2016.
 */

//These variables provide the core service address. The KEYS value is used to
//encode whatever your api_key and app_id are - the values supplied by TransportAPI.
var CORE_URL = "http://transportapi.com/v3/uk/";
    KEYS = "api_key=9240ca0a1ceee76123b7b55171adf634&app_id=185db2b4";
    URL = CORE_URL + "train/station/$$FROM$$/$$DATE$$/$$TIME$$/timetable.json?" + KEYS + "&calling_at=$$TO$$";

//http://transportapi.com/v3/uk/train/station/GRK/2016-04-19/22:04/timetable.json?api_key=9240ca0a1ceee76123b7b55171adf634&app_id=185db2b4&calling_at=GLC

function getDepartureList(from, to, date, time) {

    var query_url = URL.replace("$$FROM$$", from)
        .replace("$$TO$$", to)
        .replace("$$DATE$$", date)
        .replace("$$TIME$$", time);

    //Check to see if information is being collected appropriately
    //console.log(query_url);

    $.ajax({
        url: query_url,
        type: 'GET',
        async: true,
        contentType: "application/javascript",
        dataType: "jsonp",
        success: function(data) {
            showDepartures(data.departures.all);
        },
        error: function(err) {
            console.dir(err);
            /* Originally, there were a lot of errors trying to get these to work appropriately, but this was due to some
             * issues where there was two different script tags involving two different jQuery versions.
             * The following 2 if statements say if there is no data been entered into the fields for either Departure or
             * Arrival then a popupAlert will appear telling the user that they forgot to specify the chosen data required
             */
            if (!from) {
                popupAlert("Try Again", "You forgot to specify a departure station!");
             }

             if(!to) {
                popupAlert("Try Again", "You forgot to specify an arrival station!");
             }
        }
    });
}

function showDepartures(journey) {
    var jFormat,
        plat = "";
    for (console.dir(journey),
             jFormat = 0; jFormat < journey.length; jFormat += 1)
        plat += displayJourney(journey[jFormat]);
    $("#list").html(plat).listview("refresh");
}

//How the data will display
function displayJourney(journey) {
    var plat = journey.platform ? journey.platform : "Unavailable";

    //This is how the data from the feed will be displayed:
    return "<li><h1>" + journey.aimed_departure_time + " - " + journey.origin_name + " -> <br>" + journey.destination_name + "</h1><p>" + "Platform: " + plat + "</p>" + "<li><h1></li>";
}

//Function I have previously used which allows values to be returned in a two digit format.
function twoDigit(v) {
    if (v.toString().length < 2) {
        return "0" + v.toString();
    } else {
        return v.toString();
    }
}

function getTime() {
    //Collects time in HH:MM format
    var t = new Date();
    var time = twoDigit(t.getHours()) + ":" + twoDigit(t.getMinutes());
    $("#time").val(time);
}

function getDate() {
    //Collects date in a DD/MM/YYYY format
    var date = new Date();
    var date = twoDigit(date.getDate()) + "/" + twoDigit((date.getMonth() + 1)) + "/" + date.getFullYear();
    $("#date").val(date);
}

function clear() {
    //This function allows the user the clear the Departure and the Arrival fields and then reset the Date and time back to default
    $("#departurebox").val("");
    $("#arrivalbox").val("");
    getDate();
    getTime();
}

function getListViewItems() {
    var index, list = "";

    for (station in stations) {
        list += "<li id='" + stations[station] + "'>" + station + "</li>";
    }
    return list;
}

$(document).ready(function(){
    getTime(); //shows current Time
    getDate(); //shows current Date

    $("#favList").html(localStorage.getItem("favList"));

    //FOR DEPARTURE STATION
    var lvList = getListViewItems();
    $("#departure-list").html(lvList);
    $("#departure-list").trigger("listview");
    $("#departure-list").hide();
    $("#departurebox").on("keypress", function() {
        if ($(this).val().length > 2) { //characters more than 2 will display list
            $("#departure-list").show();
        }
    });
    $("#departure-list li").on("click", function() {
        var selectedItem = this;
        $("#departurebox").val(selectedItem.textContent);
        $("#departure-list").hide();
    });


    //FOR ARRIVAL STATION
    $("#arrival-list").html(lvList);
    $("#arrival-list").trigger("listview");
    $("#arrival-list").hide();
    $("#arrivalbox").on("keypress", function() {
        if ($(this).val().length > 2) { //characters more than 2 will display list
            $("#arrival-list").show();
        }
    });
    $("#arrival-list li").on("click", function() {
        var selectedItem = this;
        $("#arrivalbox").val(selectedItem.textContent);
        $("#arrival-list").hide();
    });

    /*When the clear button is clicked, the departure and arrival box will be set back to normal and
    the Date and Time will be set to current Date and Time again*/
    $("#clear").on("click", function(){
        clear();
    });

    /*Service Checker
     * When clicked, it will display any current details on Services that are being taken on in Scotland.
     */

    $("#serviceFeed").bind('click', function() { //RSS Feed supplied from http://www.journeycheck.com/scotrail/
        getFeed("http://rss.journeycheck.com/scotrail/?action=search&from=&to=&period=today&formTubeUpdateLocation=&formTubeUpdatePeriod=&savedRoute=",
            "serviceTitle", "serviceList", showFeedItems);
    });

    /* When the Submit button on the Journey Planner page is clicked it will continue to display the associated train
     * times on the appropriate Journey Options screen
     */
    $("#btnSubmit").on('click', function() {
        var date = new Date();
        date = date.getFullYear() + "-" + twoDigit((date.getMonth() + 1)) + "-" + twoDigit(date.getDate());

        var time = new Date();
        var time = twoDigit(time.getHours()) + ":" + twoDigit(time.getMinutes());

        getDepartureList(stations[$("#departurebox").val()], stations[$("#arrivalbox").val()], date, time);
        getListViewItems(lvList);
    });

    $("#backHome").on("click", function() {
        clear();
    });

    /*When the Favourites button the Rail Page has been clicked the user will be asked to enter something referring to
     * their journey information and when pressed the information will be stored for the user to use at a later date
     */

    $("#favouriteStar").on("click", function(evt) {
        var item;
        popupPrompt("Add Favourite", "Enter Journey Information:", function() {
            //Current values in fields
            var departure = $("#departurebox").val();
            var arrival = $("#arrivalbox").val();

            item = getPromptValue();
            $("#favList").append("<li><a href='#railpage' id='button1'>" + item +": "+ departure + "," + arrival + "</a></li>").listview("refresh");
            var favouriteList = $("#favList").html();
            localStorage.setItem("favList", favouriteList);
        });
    });

    $("#favList").on("click", function() {
        /* Gets what has been favourited takes the data and puts it into text and it gets split between the item being
         * put in ":" and then split between the two departures and arrivals ",". Then becomes an array where departure
         * is [0] and arrival is [1].
         */

        var splitIt = $("#button1").text().split(":");
        var splitString = (splitIt[1].slice(1)).split(",");
        $("#departurebox").val(splitString[0]);
        $("#arrivalbox").val(splitString[1]);
    });

    //This gives the user the ability to easily remove any of the favourites from the list by swiping to the right side
    $("#favList").on("swiperight", "li", function() {
        var li = $(this);
        li.animate({"margin-left": '+=' + $(window).width()}, 400, function() {
            li.remove();
        });
        localStorage.clear();
    });

    $("#gotoFav").on("click", function() {
        clear();
    });
});

//Following is used to collect the information from the RSS Feeds

function getFeed(url, titleID, listID){
    if(window.navigator.onLine) {
        $.jGFeed(url, function(feeds) {
            // Check for errors
            if(!feeds){
                // there was an error
                return false;
            } else {
                localStorage.setItem(url, JSON.stringify(feeds));
                showFeedItems(titleID, listID, feeds.title, feeds.entries);
            }
        }, 10);
    } else {
        // Get the fall-back...
        var feed = JSON.parse(localStorage.getItem(url));
        if(feed && feed.length > 0) {
            showFeedItems(titleID, listID, feeds.title, feeds.entries);
        }
    }
}

function showFeedItems(titleID, listID, title, items){
    $("#"+titleID).text(title);
    var list = $("#"+listID);
    list.empty();
    for(var index = 0; index < items.length; index += 1) {
        list.append(formatItem(items[index]));
    }
    list.listview("refresh");
}

function formatItem(item) {
    var listItem = document.createElement("li"),
        aa = document.createElement("a");
    aa.setAttribute("href", item.link);
    aa.innerText = item.title;
    listItem.innerHTML = aa.outerHTML;
    return listItem.outerHTML;
}