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

			$("#user, #delete").html(data.username);
			username = data.username;
			uid = data.uid;
			email = data.email;
			$("#number").val(data.team);
			if (!data.verified) {

				$("p.verify").remove();
				$("div.verify").attr("style", "display: block !important");
				$("#verify_address").html(data.email);
				$("nav ul:first-child").remove();

			} else {

				$("p.verify").html("Your e-mail address has been verified.");

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

function code() {

	$("div.verify .alert").remove();
	$.ajax({

		method: "GET",
		url: "https://vexta.herokuapp.com/code?username=" + username

	}).done(function() {

		$("div.verify").prepend("<div class = 'alert alert-primary my-2 d-inline-block'>Code sent.</div>");

	}).fail(function(jqxhr) {

		$("div.verify").prepend("<div class = 'alert alert-danger my-2 d-inline-block'>An error occurred while sending verification code: " + jqxhr);

	});

}

$("#verify").submit(function() {

	event.preventDefault();
	if ($.trim($("#code")) != "") {

		$("#verify .form-control, #verify button").attr("disabled", "true");
		$("#verify button").html("Loading...");
		$("#code").removeClass("is-invalid");
		$.ajax({

			method: "POST",
			url: "https://vexta.herokuapp.com/verify",
			contentType: "application/json",
			data: JSON.stringify({

				username: username,
				code: $("#code").val().toUpperCase()

			})

		}).done(function() {

			location.reload();

		}).fail(function() {

			$("#code").addClass("is-invalid");
			$("#code, #verify button").removeAttr("disabled");
			$("#verify button").html("Verify");
			$("#code").focus();

		});

	}

});

$("#username").submit(function() {

	event.preventDefault();
	if ($.trim($("#name").val()) !== "") {

		if ($("#name").val().length < 6) {

			$("#name").addClass("is-invalid");

		} else {

			$("#name").removeClass("is-invalid");
			$("#name, #username button").attr("disabled", "true");
			$("#username button").html("Loading...");
			$.ajax({

				method: "POST",
				url: "https://vexta.herokuapp.com/changeusername",
				contentType: "application/json",
				data: JSON.stringify({

					uid: uid,
					username: $("#name").val()

				})

			}).done(function() {

				$("#username button").html("Success!");
				setTimeout(function() { location.reload() }, 2000);

			}).fail(function(jqxhr) {

				$("#name, #username button").attr("disabled", "true");
				$("#username button").html("Change");
				alert("An error occurred while changing username: " + jqxhr.responseText);

			})

		}

	}

});

$("#team").submit(function() {

	event.preventDefault();
	if ($.trim($("#number").val()) !== "") {

		$("#number").removeClass("is-invalid");
		$("#number, #team button").attr("disabled", "true");
		$("#team button").html("Loading...");
		$.ajax({

			url: "https://api.vexdb.io/v1/get_teams?team=" + $("#number").val(),
			dataType: "json"

		}).done(function(data) {

			if (data.size == 0) {

				$("#number").addClass("is-invalid");
				$("#number, #team button").removeAttr("disabled");
				$("#team button").html("Change");

			} else {

				$.ajax({

					method: "POST",
					url: "https://vexta.herokuapp.com/changeteam",
					contentType: "application/json",
					data: JSON.stringify({ 

						username: username,
						team: $("#number").val().toUpperCase()

					})

				}).done(function() {

					$("#team button").html("Success!");
					setTimeout(function() {

						$("#number, #team button").removeAttr("disabled");
						$("#team button").html("Change");

					}, 2000);

				}).fail(function(jqxhr) {

					alert("An error occurred while changing team number: " + jqxhr.responseText);

				});

			}

		});

	}

});

$("#email").submit(function() {

	event.preventDefault();
	if ($.trim($("#address").val()) != "") {

		$("#email .form-control, #email button").attr("disabled", "true");
		$("#email button").html("Loading...");
		$("#address").removeClass("is-invalid");
		login = true;
		$.ajax({

			method: "POST",
			url: "https://vexta.herokuapp.com/changeemail",
			contentType: "application/json",
			data: JSON.stringify({

				username: username,
				uid: uid,
				email: $("#address").val()

			})

		}).done(function() {

			$("#email button").html("Success!");
			setTimeout(function() { location.reload() }, 2000);

		}).fail(function(jqxhr) {

			login = false;
			$("#email .form-control, #email button").removeAttr("disabled");
			$("#email button").html("Change");
			if (jqxhr.responseText == "Invalid e-mail address") {

				$("#email .form-control").addClass("is-invalid");

			} else {

				alert("An error occurred while changing e-mail address: " + jqxhr.responseText);

			}

		});

	}

});

$("#reset").submit(function() {

	event.preventDefault();
	if ($("#old").val().length < 6) {

		$("#old").addClass("is-invalid");
		if ($("#new").val().length < 6) {

			$("#new").addClass("is-invalid");

		} else {

			$("#new").removeClass("is-invalid");

		}

	} else if ($("#new").val().length < 6) {

		$("#old").removeClass("is-invalid");
		$("#new").addClass("is-invalid");

	} else {

		$("#old, #new").removeClass("is-invalid");
		$("#reset .form-control, #reset button").attr("disabled", "true");
		$("#reset button").html("Loading...");
		login = true;
		var credential = firebase.auth.EmailAuthProvider.credential(email, $("#old").val());
		firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {

			firebase.auth().currentUser.updatePassword($("#new").val()).then(function() {

				$("#reset button").html("Success!");
				setTimeout(function() { location.reload() }, 2000);

			}).catch(function(error) {

				login = false;
				$("#new").addClass("is-invalid");
				$("#reset .form-control, #reset button").removeAttr("disabled");
				$("#reset button").html("Change");

			});

		}).catch(function(error) {

			login = false;
			$("#old").addClass("is-invalid");
			$("#reset .form-control, #reset button").removeAttr("disabled");
			$("#reset button").html("Change");

		});

	}

});