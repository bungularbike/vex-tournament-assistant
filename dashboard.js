var config = {

	apiKey: "AIzaSyBjXpDzkRRDPcdnJpBd-aI525jZPVlYid4",
    authDomain: "vex-tournament-assistant.firebaseapp.com",
    databaseURL: "https://vex-tournament-assistant.firebaseio.com",
    projectId: "vex-tournament-assistant",
    storageBucket: "vex-tournament-assistant.appspot.com",
    messagingSenderId: "752437058811"

};
firebase.initializeApp(config);

var username = "";
var uid = "";
var email = "";
var team = "";
var country = "";
var skus = [];
var token = "";

var login = false;
firebase.auth().onAuthStateChanged(function(account) {

	if (!account && !login) {

		window.open("index.html", "_self");

	} else {

		$.ajax({

			method: "GET",
			url: "https://vexta.herokuapp.com/user?uid=" + account.uid,
			dataType: "json"

		}).done(function(data) {

			$("#user").html(data.username);
			$(".jumbotron span").html(", " + data.team);
			username = data.username;
			uid = data.uid;
			email = data.email;
			team = data.team;
			if (!data.verified) {

				window.open("settings.html", "_self");

			} else {

				firebase.auth().currentUser.getIdToken().then(function(t) {

					token = t;

				}).catch(function(error) {

					alert("An error occurred: " + error.message);

				});
				if (data.events >= 3) {

					$(".jumbotron button").attr("disabled", "true");

				}
				$.ajax({

					url: "https://api.vexdb.io/v1/get_teams?team=" + data.team,
					dataType: "json"

				}).done(function(data) {

					if (data.size == 0) {

						alert("An error occurred while getting team information");

					} else {

						var team = data.result[0];
						$(".jumbotron .float-right").html("<p><strong>" + team.team_name + "<br>" + team.program + " " + team.grade + "<br>" + team.organisation + "<br>" + (team.city == "" || team.city == team.country ? "" : team.city + ", ") + (team.region == "" ? "" : team.region + ", ") + team.country + "</strong></p>");
						country = team.country;

					}

				}).fail(function(jqxhr) {

					alert("An error occurred while getting team information: " + jqxhr.responseText);

				});
				getEvents();
				getUserEvents();

			}

		}).fail(function(error) {

			alert("An error occurred while getting user information: " + error.responseText);

		});

	}

});

function signout() {

	$("#user").removeClass("dropdown-toggle");
	$("#user").html("Signing out...");
	login = true;
	firebase.auth().signOut().then(function() {

		setTimeout(function() { window.open("index.html", "_self") }, 2000);

	}).catch(function(error) {

		login = false;
		alert("An error occurred while signing out: " + error.message);

	});

}

function getEvents() {

	$.ajax({

		url: "http://api.vexdb.io/v1/get_events?season=current&team=" + team,
		dataType: "json"

	}).done(function(jqxhr) {

		if (jqxhr.size == 0) {

			$(".modal-body > p").html("<form id = 'custom'><div class = 'input-group'><input type = 'text' class = 'form-control' placeholder = 'Enter event SKU'><div class = 'input-group-append'><button class = 'btn btn-outline-dark'>Add</button></div></div></form>");

		} else {

			$(".modal-body > p").remove();
			for (var i = 0; i < jqxhr.result.length; i++) {

				if (skus.indexOf(jqxhr.result[i].sku) != -1) {

					continue;

				}
				$(".list-group").append("<a href = '#' class = 'list-group-item list-group-item-action' id = 'event_" + jqxhr.result[i].sku + "' onclick = 'loadEvent(\"" + jqxhr.result[i].sku + "\")'>" + jqxhr.result[i].name + "</a>");

			}
			$(".list-group").append("<li class = 'list-group-item'><form id = 'custom'><div class = 'input-group'><input type = 'text' class = 'form-control' placeholder = 'Or enter custom event SKU' required><div class = 'input-group-append'><button class = 'btn btn-outline-dark'>Add</button></div></div></form></li>");

		}
		$("#custom").submit(function() {

			event.preventDefault();
			loadEvent();

		});

	});

}

function loadEvent(sku) {

	var custom = false;
	var event = "";
	if (sku == undefined) {

		custom = true;
		event = $("#custom input").val();
		$("#custom input, #custom button").attr("disabled", "true");
		$("li:last-child").addClass("active");

	} else {

		event = sku;

	}
	if (skus.indexOf(event) != -1) {

		$(".list-group-item input").addClass("is-invalid");
		$("#custom input, #custom button").removeAttr("disabled");
		alert("You have already added this event.");
		return false;

	}
	$("#custom input").removeClass("is-invalid");
	$("#event").attr("style", "display: block !important");
	$("#event").html("<hr><p class = 'mb-0'>Loading...</p>");
	$(".list-group-item.active").removeClass("active");
	$("#event_" + sku).addClass("active");
	$.ajax({

		url: "http://api.vexdb.io/v1/get_events?sku=" + event,
		dataType: "json"

	}).done(function(jqxhr) {

		if (jqxhr.result.length != 1) {

			$("#custom input").addClass("is-invalid");
			$("#custom input, #custom button").removeAttr("disabled");
			$("#event").attr("display", "none !important");
			return false;

		}
		$("#event p").html("<strong>" + jqxhr.result[0].name + "</strong>");
		$("#custom input, #custom button").removeAttr("disabled");
		var dates = "";
		var start = new Date(jqxhr.result[0].start);
		var end = new Date(jqxhr.result[0].end);
		dates = (start.getMonth() + 1) + "/" + start.getDate() + "/" + (start.getFullYear() - 2000);
		if (dates != (end.getMonth() + 1) + "/" + (end.getDate() - 1) + "/" + (end.getFullYear() - 2000)) {

			dates += " - " + (end.getMonth() + 1) + "/" + (end.getDate() - 1) + "/" + (end.getFullYear() - 2000);

		}
		$("#event").append("<p class = 'mb-0'>" + dates + "</p><p class = 'mb-0'>" + jqxhr.result[0].loc_city + (jqxhr.result[0].loc_country == country ? "" : ", " + jqxhr.result[0].loc_country) + "</p>");
		if (jqxhr.result[0].divisions.length > 1) {

			$("#event").append("<p class = 'mb-0 text-info'>Multi-division event</p>");

		}
		$("#event").append("<p>SKU: " + jqxhr.result[0].sku + "</p><p class = 'mb-0'><button class = 'btn btn-primary' onclick = 'configure(\"" + event + "\")'>Proceed to Event Configuration Wizard</button></p>");

	}).fail(function(jqxhr) {

		if (custom) {

			$(".list-group-item input").addClass("is-invalid");
			$(".list-group-item input, .list-group-item button").removeAttr("disabled");

		} else {

			alert("An error occurred: " + jqxhr.responseText);

		}

	});

}

function configure(sku) {

	window.open("configure.html?sku=" + sku, "_self");

}

function getUserEvents() {

	$.ajax({

		method: "GET",
		url: "https://vexta.herokuapp.com/getevents?username=" + username,
		dataType: "json"

	}).done(function(jqxhr) {

		if (jqxhr.events.length != 0) {

			for (var i = 0; i < jqxhr.events.length; i++) {

				var event = jqxhr.events[i];
				if (event.status == 0) {

					continue;

				} else {

					$(".welcome").remove();
					$(".card-deck").removeClass("d-none");

				}
				var action = "";
				if (event.status == 1) {

					action = "<button class = 'btn btn-info' disabled>Processing</button>";

				} else if (event.status == 2) {

					action = "<button class = 'btn btn-info'>Select</button>";

				} else if (event.status == 3) {

					action = "<button class = 'btn btn-primary'>Selected</button>";

				}
				skus[skus.length] = event.sku;
				$(".card-deck").append("<div class = 'card'><img src = '" + event.map + "' class = 'card-img-top'><div class = 'card-body text-center'><h5 class = 'card-title'>" + event.name + "</h5><p class = 'card-text'>" + event.dates + "<br>" + event.location + "<br>" + event.sku + "</p></div><div class = 'card-footer'>" + action + "<br><button class = 'btn btn-sm btn-danger mt-2' onclick = 'removeEvent(\"" + event.sku + "\")'>Remove</button></div></div>");

			}

		}

	}).fail(function(jqxhr) {

		alert("An error occurred: " + jqxhr.responseText);

	});

}

function removeEvent(sku) {

	if (confirm("Are you sure you want to remove this event? All data associated with it will be deleted from your account.\n\nTHIS ACTION CANNOT BE UNDONE.")) {

		$.ajax({

			method: "DELETE",
			url: "https://vexta.herokuapp.com/deleteevent?token=" + token + "&sku=" + sku

		}).done(function(jqxhr) {

			window.location.reload();

		}).fail(function(jqxhr) {

			alert("An error occurred: " + jqxhr.responseText);

		});

	}

}