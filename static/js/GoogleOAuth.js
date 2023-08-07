function eIDLogin(id_token, res) {
  setLocalStorage("jwt", id_token);
  setLocalStorage("email", res.result.emailAddresses[0].value);

  // TODO: Get path
  var url = new URL(window.location.href);
  var next = url.searchParams.get("next");

  // Oauth to eID
  var dataJSON = {};
  dataJSON.email = res.result.emailAddresses[0].value;
  dataJSON.username = res.result.names[0].displayName;
  dataJSON.token = id_token
  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/accounts/oauth/google",
    type: "POST",
    async: false,
    crossDomain: true,
    data:  dataJSON,
    success: function(returnData) {
      const obj = JSON.parse(returnData);
      setLocalStorage("jwt", obj.token);
      setLocalStorage("username", obj.username);
      console.log("Get JWT from cookie" +  getLocalStorage("jwt"));

      // TODO, redirect by next
      if (next != null) {
        window.location.replace(next);
      } else {
        // TODO, redirect by group
        group = get_group(getLocalStorage("email"));
        if (group == "100") {
          window.location.replace("/backend/admin_dashboard.html");
        } else if (group == "200" || group == "201") {
          window.location.replace("/backend/admin_agent_dashboard.html");
        } else {
          window.location.replace("/index.html");
        }
      }
    },
    error: function(xhr, ajaxOptions, thrownError){
      var elemWrongPw = document.getElementById("wrong-pw");
      if (elemWrongPw != null) {
        elemWrongPw.style.display = "block";
      }
      console.log(thrownError);
    }
  });

}

$(function () {
  $("#btnGoogleSignIn").on("click", function () {
	GoogleLogin();//Google 登入
  });
});

function GoogleClientInit() {
  gapi.load('client', function () {
  gapi.client.init({
	clientId: "1080674192413-b1vnqslm4gif3p9ntaj4ifl4i572p0bn.apps.googleusercontent.com",
	scope: "profile",//"https://www.googleapis.com/auth/userinfo.profile",
	discoveryDocs:  ["https://www.googleapis.com/discovery/v1/apis/people/v1/rest"]
    });
  });
}

function GoogleLogin() {
  let auth2 = gapi.auth2.getAuthInstance();
  auth2.signIn().then(function (GoogleUser) {
  let user_id = GoogleUser.getId();
  let AuthResponse = GoogleUser.getAuthResponse(true);
  let id_token = AuthResponse.id_token;
  gapi.client.people.people.get({
	'resourceName': 'people/me',
	'personFields': 'names,emailAddresses',
    }).then(function (res) {
      //success
	  let str = JSON.stringify(res.result);
	  console.log(", Google oauth success!, the response = " + str);
	  eIDLogin(id_token, res);
    });
  }, function (error) {
    console.log(error);
  });
}