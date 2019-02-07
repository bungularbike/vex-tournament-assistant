var config = {

	apiKey: "AIzaSyBjXpDzkRRDPcdnJpBd-aI525jZPVlYid4",
    authDomain: "vex-tournament-assistant.firebaseapp.com",
    databaseURL: "https://vex-tournament-assistant.firebaseio.com",
    projectId: "vex-tournament-assistant",
    storageBucket: "vex-tournament-assistant.appspot.com",
    messagingSenderId: "752437058811"

};
firebase.initializeApp(config);

$(function () {

	$('[data-toggle="tooltip"]').tooltip();

})

var login = false;
firebase.auth().onAuthStateChanged(function(account) {

	if (account && !login) {

		window.open("teams.html", "_self");

	}

});

$(document).ready(function() {

	$(".card").delay(500).fadeIn(1500);

})

$(".input-group button").on("click", function() {

	$(this).blur();

});

/*
document.getElementsByTagName("form")[0].onsubmit = function(event) {

	event.preventDefault();
	if ($("#username").val().length < 4) {

		$("#username").addClass("is-invalid");
		if ($("#password").val().length < 6) {

			$("#password").addClass("is-invalid");

		}

	} else if ($("#password").val().length < 6) {

		$("#username").removeClass("is-invalid");
		$("#password").addClass("is-invalid");

	} else {

		$("button").attr("disabled", "true");
		$("#username, #password").removeClass("is-invalid");
		var team = $("input[name='team']:checked").val();
		login = true;
		firebase.auth().signInWithEmailAndPassword($("#username").val() + "@hkis.edu.hk", $("#password").val()).then(function() {

			firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
			$(".background:nth-child(" + teams.indexOf(team) + ")").animate({ height: "100%" }, 800);
    		$(".background:not(:nth-child(" + teams.indexOf(team) + "))").animate({ height: "0%" }, 800);
			setTimeout(function() { window.open("teams.html", "_self") }, 1600);

		}).catch(function(error) {

			login = false;
			$("button").removeAttr("disabled");
			if (error.code == "auth/wrong-password") {

				$("#password").addClass("is-invalid");

			} else if (error.code == "auth/user-not-found") {

				$("#username").addClass("is-invalid");

			} else {

				alert("An error occurred (" + error.code + "): " + error.message);

			}

		});

	}

}
*/

$("input[type=radio]").click(function() {

	$(".custom-control-input, custom-control-label").removeClass("is-invalid");

});

$("#password").on("input", function() {

	if ($("#password").val().length >= 6) {

		$("#password").removeClass("is-invalid");

	}

});