var is_live_now;

$(document).ready(function () {
  // clipboard
  var clipboard = new ClipboardJS(".btn");
  clipboard.on("success", function (e) {
    alert("Copied to clipboard");
  });

  // live now status
  if ($("#live_status").text() === "active") {
    is_live_now = true;
  } else {
    is_live_now = false;
  }

  if (is_live_now === true) {
    pool_viewers();
    pool_comments();
  }

  $(".startBroadcast").on("click", function () {
    $.ajax({
      type: "get",
      url: "/start_broadcast",
      beforeSend: function (xhr) {
        showLoading();
      },
      success: function (response) {
        $("#status_live").text("Running");
        $("#msg_live").val(response.message);
        hideLoading();

        $("#stopBroadcast").prop("disabled", false);
        $("#startBroadcast").prop("disabled", true);
        is_live_now = true;

        Swal.fire(
          "You're Live!",
          "Live Streaming is Starting...!",
          "success"
        ).then(function () {
          window.location = "/";
        });
        pool_viewers();
      },
      error: function (response) {
        showPopupExpiredKeyError();
        hideLoading();
      },
    });
  });

  $("#stopBroadcast").on("click", function () {
    $.ajax({
      type: "get",
      url: "/stop_broadcast",
      beforeSend: function (xhr) {
        showLoading();
      },
      success: function (response) {
        $("#status_live").text("Stopped");
        $("#msg_live").val(response.message);
        hideLoading();

        $("#stopBroadcast").prop("disabled", true);
        $("#startBroadcast").prop("disabled", false);

        is_live_now = false;

        Swal.fire(
          "You're Off!",
          "Live Streaming is Stopping...!",
          "success"
        ).then(function () {
          window.location = "/";
        });
      },
      error: function (response) {
        showPopupExpiredKeyError();
        hideLoading();
      },
    });
  });

  $("#sendMessage").on("click", function () {
    let message = $("#text_message").val();
    if (message.length >= 1) {
      $(this).attr("disabled", true);
      $.ajax({
        type: "GET",
        url: "/v1/live/comments/" + message,
        success: function (response) {
          $("#text_message").val("");
          $("#sendMessage").attr("disabled", false);
        },
      });
    }
  });
});

function showPopupExpiredKeyError() {
  Swal.fire(
    "Streamkey is already used",
    "Restart the server to create a new stream key",
    "error"
  );
}

function showLoading() {
  $(".preloader").show();
}

function hideLoading() {
  $(".preloader").fadeOut();
}

function pool_viewers() {
  $.ajax({
    type: "GET",
    url: "/v1/live/viewers",
    dataType: "json",
    success: function (response) {
      $("#viewers_count").text(response.count);
    },
    complete: function () {
      if (is_live_now) {
        setTimeout(pool_viewers, 10000);
      }
    },
  });
}

function pool_comments() {
  $.ajax({
    type: "GET",
    url: "/v1/live/comments",
    dataType: "json",
    success: function (response) {
      console.log(response);
      $(".chat-list").empty();

      const reversed_comments = response.comments.reverse();
      if (reversed_comments.length === 0) {
        $(".chat-list").append(`
        <li>
              No recent comments
            </li>
        `);
      } else {
        reversed_comments.forEach((e) => {
          $(".chat-list").append(
            `
          <li>
            <div class="chat-content ">
              <h5>${e.user.username}</h5>
              <div class="box bg-light-info">${e.text}</div>
            </div>
          </li>`
          );
        });
      }
    },
    complete: function () {
      if (is_live_now) {
        setTimeout(pool_comments, 1000);
      }
    },
  });
}
