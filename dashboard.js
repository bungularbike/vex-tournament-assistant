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
						$(".jumbotron .float-right").html("<p><strong>" + team.team_name + "<br>" + team.program + " " + team.grade + "<br>" + team.organisation + "<br>" + (team.city == "" || team.city == team.country ? "" : team.city + ", ") + (team.region == "" ? "" : team.region + ", ") + team.country + "</strong></p>");

					}

				}).fail(function(jqxhr) {

					alert("An error occurred while getting team information: " + jqxhr.responseText);

				});

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