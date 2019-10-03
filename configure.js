var config = {

	apiKey: "AIzaSyBjXpDzkRRDPcdnJpBd-aI525jZPVlYid4",
    authDomain: "vex-tournament-assistant.firebaseapp.com",
    databaseURL: "https://vex-tournament-assistant.firebaseio.com",
    projectId: "vex-tournament-assistant",
    storageBucket: "vex-tournament-assistant.appspot.com",
    messagingSenderId: "752437058811"

};
firebase.initializeApp(config);

var team = "";
var division = "";
var country = "";
var manual = [];
var sku = "";

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

			team = data.team;
			if (!data.verified) {

				window.open("settings.html", "_self");

			} else {

				$.ajax({

					url: "https://api.vexdb.io/v1/get_teams?team=" + data.team,
					dataType: "json"

				}).done(function(data) {

					if (data.size == 0) {

						alert("An error occurred while getting team information");

					} else {

						var team = data.result[0];
						$("tbody").prepend("<tr id = 'team_" + team.number + "'><th scope = 'row'>" + team.number + "</th><td>" + team.team_name + "</td><td>" + team.organisation + "</td><td>" + (team.city == "" || team.city == team.country ? "" : team.city + ", ") + (team.region == "" ? "" : team.region + ", ") + team.country + "</td><td><button class = 'btn btn-danger btn-sm' onclick = 'removeTeam(\"" + team.number + "\")'>Remove</button></td></tr>");
						manual[0] = team.number;
						var country = team.country;
						$("#addteam input, button").removeAttr("disabled");
						var params = new URLSearchParams(window.location.search);
						if (!params.has("sku")) {

							$(".container-fluid").html("<div class = 'mt-5 alert alert-danger'>Invalid event SKU.</div>")

						} else {

							sku = params.get("sku");
							getEvent(sku);

						}

					}

				});

			}

		}).fail(function(error) {

			alert("An error occurred while getting user information: " + error.responseText);

		});

	}

});

$("#cancel").click(function() {

	$("#cancel").attr("disabled", "true");
	window.open("dashboard.html", "_self");

});

var event = {};

function getEvent(sku) {

	$.ajax({

		url: "http://api.vexdb.io/v1/get_events?sku=" + sku,
		dataType: "json"

	}).done(function(jqxhr) {

		if (jqxhr.result.length != 1) {

			$("#loading").html("<div class = 'mt-5 alert alert-danger'>No event found.</div>");
			return false;

		} else {

			$("#loading").remove();
			var dates = "";
			var start = new Date(jqxhr.result[0].start);
			var end = new Date(jqxhr.result[0].end);
			dates = (start.getMonth() + 1) + "/" + start.getDate() + "/" + (start.getFullYear() - 2000);
			if (dates != (end.getMonth() + 1) + "/" + (end.getDate() - 1) + "/" + (end.getFullYear() - 2000)) {

				dates += " - " + (end.getMonth() + 1) + "/" + (end.getDate() - 1) + "/" + (end.getFullYear() - 2000);

			}
			$(".container-fluid").append("<div class = 'alert alert-secondary mt-4' id = 'info'></div>");
			$("#info").html("<p class = 'mb-0'><b>" + jqxhr.result[0].name + "</b></p><p class = 'mb-0'>" + dates + "</p><p class = 'mb-0'>" + jqxhr.result[0].loc_city +  ", " + jqxhr.result[0].loc_country + "</p>");
			$("#info").append("<p class = 'mb-0'>SKU: " + jqxhr.result[0].sku + "</p>");
			if (jqxhr.result[0].divisions.length > 1) {

				var options = "<option selected disabled>Division...</option>";
				for (var i = 0; i < jqxhr.result[0].divisions.length; i++) {

					options += "<option value = '" + jqxhr.result[0].divisions[i] + "'>" + jqxhr.result[0].divisions[i] + "</option>";

				}
				$(".container-fluid").append("<p>Multiple divisions detected. Select which division to configure for this event: </p><p id = 'divisionstatus'><select class = 'custom-select' id = 'division'>" + options + "</select><button class = 'btn btn-info ml-2' onclick = 'selectDivision()'>Select</button>");

			} else {

				division = jqxhr.result[0].divisions[0];
				$(".container-fluid").append("<p>Using default division: \"" + jqxhr.result[0].divisions[0] + "\".</p><p id = 'teamstatus'>Checking for team list...</p>");
				event.division = division;
				checkTeams(sku);

			}
			event.name = jqxhr.result[0].name;
			event.sku = jqxhr.result[0].sku;
			event.location = jqxhr.result[0].loc_city +  ", " + jqxhr.result[0].loc_country;
			event.dates = dates;

		}

	}).fail(function(jqxhr) {

		$("#loading").html("<div class = 'mt-5 alert alert-danger'>An error occurred: " + jqxhr.responseText + "</div>");

	});

}

function selectDivision() {

	if ($("#division").val() != null) {

		division = $("#division").val();
		$("#divisionstatus").html("Using division: \"" + $("#division").val() + "\".</p><p id = 'teamstatus'>Checking for team list...</p>");
		event.division = division;
		checkTeams(sku);

	}

}

function addTeam() {

	if (manual.indexOf($("#addteam input").val()) == -1) {

		$("#addteam input").removeClass("is-invalid");
		$("#addteam input, button").attr("disabled", "true");
		$.ajax({

			url: "http://api.vexdb.io/v1/get_teams?team=" + $("#addteam input").val(),
			dataType: "json"

		}).done(function(jqxhr) {

			if (jqxhr.result.length == 0) {

				$("#addteam input").addClass("is-invalid");
				$("#addteam input, button").removeAttr("disabled");
				$("#addteam input").focus();

			} else {

				$("#addteam input").val("");
				$("#addteam input, button").removeAttr("disabled");
				var _team = jqxhr.result[0];
				manual[manual.length] = _team.number;
				$("tbody").append("<tr id = 'team_" + _team.number + "'><th scope = 'row'>" + _team.number + "</th><td>" + _team.team_name + "</td><td>" + _team.organisation + "</td><td>" + (_team.city == "" || _team.city == _team.country ? "" : _team.city + ", ") + (_team.region == "" ? "" : _team.region + ", ") + _team.country + "</td><td><button class = 'btn btn-danger btn-sm' onclick = 'removeTeam(\"" + _team.number + "\")'>Remove</button></td></tr>");
				$("#addteam input").focus();
				$("#teamcount").html(manual.length);
				window.scrollTo(0, document.body.scrollHeight);

			}

		}).fail(function(jqxhr) {

			$("#addteam input").addClass("is-invalid");
			$("#addteam input, button").removeAttr("disabled");
			$("#addteam input").focus();

		});

	}

}

function removeTeam(team) {

	manual.splice(manual.indexOf(team), 1);
	$("#team_" + team).remove();
	$("#teamcount").html(manual.length);

}

function autoAdd() {

	$("#automatic").html("Automatically adding teams. Please wait...");
	$("#manual").insertAfter("#teamstatus");
	$("#manual").removeClass("d-none");
	$("#team_" + team).remove();
	manual = [];
	$.ajax({

		url: "http://api.vexdb.io/v1/get_teams?sku=" + sku,
		dataType: "json"

	}).done(function(jqxhr) {

		var teams = jqxhr.result;
		for (var i = 0; i < teams.length; i++) {

			var _team = teams[i];
			$("tbody").append("<tr id = 'team_" + _team.number + "'><th scope = 'row'>" + _team.number + "</th><td>" + _team.team_name + "</td><td>" + _team.organisation + "</td><td>" + (_team.city == "" || _team.city == _team.country ? "" : _team.city + ", ") + (_team.region == "" ? "" : _team.region + ", ") + _team.country + "</td><td><button class = 'btn btn-danger btn-sm' onclick = 'removeTeam(\"" + _team.number + "\")'>Remove</button></tr>");
			manual[manual.length] = _team.number;

		}
		$(".container-fluid").append("<p>Teams: <span id = 'teamcount'>" + manual.length + "</p><p><button class = 'btn btn-primary' onclick = 'confirmTeams()'>Done</button>");
		$("html, body").animate({ scrollTop: $(document).height() }, 500);

	});

}

function manualAdd() {

	$("#automatic").html("Manually adding teams.");
	$("#manual").insertAfter("#teamstatus");
	$("#manual").removeClass("d-none");
	$(".container-fluid").append("<p><form id = 'addteam'><div class = 'input-group mt-5'><input class = 'form-control' placeholder = 'Add Team by Number' required><div class = 'input-group-append'><button class = 'btn btn-info'>Add</button></div></div></form></p><p>Teams: <span id = 'teamcount'>1</p><p><button class = 'btn btn-primary' onclick = 'confirmTeams()'>Done</button>");
	$("#addteam").submit(function(event) {

		event.preventDefault();
		addTeam();

	});
	$("#addteam input").focus();

}

function checkTeams(sku) {

	$.ajax({

		url: "http://api.vexdb.io/v1/get_teams?sku=" + sku,
		dataType: "json"

	}).done(function(jqxhr) {

		if (jqxhr.result.length == 0) {

			$("#teamstatus").html("<p>No teams found. You will have to manually enter team numbers.</p>");
			$("#manual").insertAfter("#teamstatus");
			$("#manual").removeClass("d-none");
			$(".container-fluid").append("<p><form id = 'addteam'><div class = 'input-group mt-5'><input class = 'form-control' placeholder = 'Add Team by Number' required><div class = 'input-group-append'><button class = 'btn btn-info'>Add</button></div></div></form></p><p>Teams: <span id = 'teamcount'>1</p><p><button class = 'btn btn-primary' onclick = 'confirmTeams()'>Done</button>");
			$("#addteam").submit(function(event) {

				event.preventDefault();
				addTeam();

			});
			$("#addteam input").focus();

		} else {

			$("#teamstatus").html("<p>Team list found. Would you like to automatically add teams?</p><p id = 'automatic'><button class = 'btn btn-info' onclick = 'autoAdd()'>Yes</button><button class = 'btn btn-secondary ml-2' onclick = 'manualAdd()'>Manual Team Entry</button></p>");

		}

	}).fail(function(jqxhr) {

		alert("An error occurred: " + jqxhr.responseText);

	});

}

function confirmTeams() {

	if (manual.length > 0) {

		$("#addteam input, button").attr("disabled", "true");
		$(".container-fluid").append("<p id = 'result'>Uploading data. This may take some time...</p>");
		firebase.auth().currentUser.getIdToken().then(function(token) {

			$.ajax({

				method: "POST",
				url: "https://vexta.herokuapp.com/addevent",
				contentType: "application/json",
				data: JSON.stringify({

					event: event,
					teams: manual,
					token: token

				})

			}).done(function(jqxhr) {

				$("#result").addClass("mt-5 mb-0");
				$("#result").html("<div class = 'alert alert-success'>Event uploaded and is now processing. Redirecting you to the dashboard...</div>");
				window.scrollTo(0, document.body.scrollHeight);
				setTimeout(function() { window.open("dashboard.html", "_self") }, 2000);

			}).fail(function(jqxhr) {

				alert("An error occurred: " + jqxhr.responseText);

			});

		}).catch(function(error) {

			alert("An error occurred: " + error.message);

		});
	
	}

}