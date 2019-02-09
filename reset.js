var config = {

	apiKey: "AIzaSyBjXpDzkRRDPcdnJpBd-aI525jZPVlYid4",
    authDomain: "vex-tournament-assistant.firebaseapp.com",
    databaseURL: "https://vex-tournament-assistant.firebaseio.com",
    projectId: "vex-tournament-assistant",
    storageBucket: "vex-tournament-assistant.appspot.com",
    messagingSenderId: "752437058811"

};
firebase.initializeApp(config);

firebase.auth().signOut();

var params = new URLSearchParams(window.location.search);
var username = "";
var code = "";

if (!params.has("username") || !params.has("code")) {

	$("form").remove();
	$(".card-body").append("<div class = 'alert alert-danger'>Invalid reset password link.</div>");

} else {

	username = params.get("username");
	$("#username").val(username);
	code = params.get("code");

}

$("form").submit(function() {

	event.preventDefault();
	if ($("#password").val().length < 6) {

		$("#password").addClass("is-invalid");

	} else {

		$("#password").removeClass("is-invalid");
		$("#password, form button").attr("disabled", "true");
		$("form button").html("Loading...");
		$(".alert").remove();
		$.ajax({

			method: "POST",
			url: "https://vexta.herokuapp.com/resetpassword",
			contentType: "application/json",
			data: JSON.stringify({

				username: username,
				code: code,
				password: $("#password").val()

			})

		}).done(function() {

			$("form button").html("Success!");
			setTimeout(function() { window.open("index.html", "_self") }, 2000);

		}).fail(function(jqxhr) {

			$("#password, form button").removeAttr("disabled");
			$("form button").html("Reset Password");
			$(".card-body").append("<div class = 'alert alert-danger mt-3 mb-0'>An error occurred: " + jqxhr.responseText + "</div>");

		});

	}

});