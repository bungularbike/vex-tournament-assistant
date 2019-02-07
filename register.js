var config = {

	apiKey: "AIzaSyBjXpDzkRRDPcdnJpBd-aI525jZPVlYid4",
    authDomain: "vex-tournament-assistant.firebaseapp.com",
    databaseURL: "https://vex-tournament-assistant.firebaseio.com",
    projectId: "vex-tournament-assistant",
    storageBucket: "vex-tournament-assistant.appspot.com",
    messagingSenderId: "752437058811"

};
firebase.initializeApp(config);

$("#team").on("keydown", function() {

	$(".is-invalid").removeClass("is-invalid");

});

var account_team = "";

$("#teamsearch").submit(function() {

	event.preventDefault();
	if ($.trim($("#team").val()) != "") {

		$("#team").attr("disabled", "true");
		$("#search").attr("disabled", "true");
		$("#search").html("Loading...");
		$.ajax({

			url: "https://api.vexdb.io/v1/get_teams?team=" + $("#team").val(),
			dataType: "json"

		}).done(function(data) {

			if (data.size == 0) {

				$("#team").removeAttr("disabled");
				$("#team").addClass("is-invalid");
				$("#search").removeAttr("disabled");
				$("#search").html("Continue");

			} else {

				var team = data.result[0];
				$("#info").attr("style", "display: inline-block !important").css("opacity", "0").delay(500).animate({ opacity: 1 });
				$("#info tr:first-child td:first-child").html(team.number);
				$("#info tr:first-child td:nth-child(2)").html(team.team_name);
				$("#info tr:first-child td:last-child").html(team.program + " " + team.grade);
				$("#info tr:last-child td:first-child").html(team.organisation);
				$("#info tr:last-child td:last-child").html((team.city == "" || team.city == team.country ? "" : team.city + ", ") + (team.region == "" ? "" : team.region + ", ") + team.country);
				$("#teamsearch").hide();
				$("#teamconfirm").attr("style", "display: block !important");
				$("#team").removeAttr("disabled");
				$("#team").val("");
				$("#search").removeAttr("disabled");
				$("#search").html("Continue");
				account_team = team.number;

			}

		});

	}

});

$("input:radio[name='teamconfirm']").change(function() {

	if ($(this).is(":checked") && $(this).val() == "no") {

		$("input:radio[name='teamconfirm']").prop("checked", false);
		$("#teamsearch").show();
		$("#teamconfirm").attr("style", "display: none !important");
		$("#info").attr("style", "display: none !important");
		$("hr.signin, hr.verify").css("opacity", "0");
		$("form.signin, div.verify").attr("style", "display: none !important");
		$(".signin").trigger("reset");
		$("#username_error").html("Username must be at least 4 characters long.");
		$("#password_error").html("Password must be at least 6 characters long.");
		$("#password_error").removeClass("invalid");
		$(".verify form").trigger("reset");

	} else if ($(this).is(":checked") && $(this).val() == "yes") {

		$("hr.signin").delay(500).animate({ opacity: 1 });
		$("form.signin").attr("style", "display: inline-block !important").css("opacity", "0").delay(500).animate({ opacity: 1 });
		$("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, "swing");

	}

});

$("form.signin").submit(function() {

	event.preventDefault();
	$("#username_error").html("Username must be at least 4 characters long.");
	$("#password_error").html("Password must be at least 6 characters long.");
	if ($("#username").val().length < 4) {

		$("#username").addClass("is-invalid");
		if ($("#password").val().length < 6) {

			$("#password").addClass("is-invalid");

		} else {

			$("#password").removeClass("is-invalid");

		}

	} else if ($("#password").val().length < 6) {

		$("#username").removeClass("is-invalid");
		$("#password").addClass("is-invalid");

	} else {

		$(".signin .is-invalid").removeClass("is-invalid");
		$(".signin .form-control, #register").attr("disabled", "true");
		$("#password_error").removeClass("invalid");
		$("#register").html("Loading...");
		$.ajax({

			method: "POST",
			url: "https://vexta.herokuapp.com/register",
			contentType: "application/json",
			data: JSON.stringify({

				email: $("#email").val(),
				username: $("#username").val(),
				password: $("#password").val(),
				team: account_team

			})

		}).done(function() {

			$(".signin .form-control").removeAttr("disabled");
			$(".signin .form-control").attr("readonly", "true");
			$("#register").remove();
			$("#address").html($("#email").val());
			$("hr.verify").delay(500).animate({ opacity: 1 });
			$("div.verify").attr("style", "display: inline-block !important").css("opacity", "0").delay(500).animate({ opacity: 1 });
			$("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, "swing");

		}).fail(function(jqxhr) {

			var error = jqxhr.responseText;
			if (error == "This e-mail address is already taken") {

				$("#email").addClass("is-invalid");
				$("#email_error").html(jqxhr.responseText);

			} else if (error == "This username is already taken") {

				$("#username").addClass("is-invalid");
				$("#username_error").html(jqxhr.responseText);

			} else {

				$("#password_error").html(jqxhr.responseText);
				$("#password_error").addClass("invalid");

			}
			$(".signin .form-control, #register").removeAttr("disabled");
			$("#register").html("Continue");

		});

	}

});

$(".verify form").submit(function() {

	event.preventDefault();
	if ($.trim($("#code").val()) != "") {

		$("#code").attr("disabled", "true");
		$("#verify").attr("disabled", "true");
		$("#verify").html("Loading...");
		$("#code").removeClass("is-invalid");
		$.ajax({

			method: "POST",
			url: "https://vexta.herokuapp.com/verify",
			contentType: "application/json",
			data: JSON.stringify({ 

				username: $("#username").val(),
				code: $("#code").val().toUpperCase()

			})

		}).done(function() {

			$("#verify").html("Success!");
			$("div.verify").append("<br><div class = 'alert alert-success mt-5 mb-0 text-center'>Your VEX Tournament Assistant account <strong>" + $("#username").val() + "</strong> has been successfully created. You will be redirected to the dashboard shortly.</div>");
			$("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, "swing");
			setTimeout(function() { window.open("dashboard.html", "_self") }, 5000);

		}).fail(function(jqxhr) {

			$("#code").addClass("is-invalid");
			$("#code").removeAttr("disabled");
			$("#verify").removeAttr("disabled");
			$("#verify").html("Verify and Register");

		});

	}

})