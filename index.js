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

		window.open("dashboard.html", "_self");

	}

});

$(document).ready(function() {

	$(".card").delay(500).fadeIn(1500);

})

$(".input-group button").on("click", function() {

	$(this).blur();

});

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

		$("form > button").attr("disabled", "true");
		$("#username, #password").removeClass("is-invalid");
		$(".invalid").removeClass("invalid");
		var username = $("input[name='team']:checked").val();
		login = true;
		$.ajax({

			method: "GET",
			url: "https://vexta.herokuapp.com/login?username=" + $("#username").val()

		}).done(function(jqxhr) {

			firebase.auth().signInWithEmailAndPassword(jqxhr, $("#password").val()).then(function() {

				if ($("#remember").is(":checked")) {

					firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

				} else {

					firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

				}
				$("form > button").html("Success!");
				setTimeout(function() { window.open("dashboard.html", "_self") }, 2000);

			}).catch(function(error) {

				if (error.code == "auth/wrong-password") {

					$("#password").addClass("is-invalid");

				} else {

					$(".invalid-feedback").html("An error occurred while logging in: " + error.message);
					$(".invalid-feedback").addClass("invalid");

				}
				login = false;
				$("button").removeAttr("disabled");
				$("#username").addClass("is-invalid");

			});

		}).fail(function(jqxhr) {

			login = false;
			$("button").removeAttr("disabled");
			$("#username").addClass("is-invalid");

		});

	}

}

$("input[type=radio]").click(function() {

	$(".custom-control-input, custom-control-label").removeClass("is-invalid");

});

$("#password").on("input", function() {

	if ($("#password").val().length >= 6) {

		$("#password").removeClass("is-invalid");

	}

});