function mockup_get() {
  var form = new FormData();
  form.append("email", SITE_HOSTERS[0]);

  var settings = {
    "url": HOST_URL_TPLANET_DAEMON + "/mockup/get",
    "method": "POST",
    "timeout": 0,
    "processData": false,
    "mimeType": "multipart/form-data",
    "contentType": false,
    "data": form
  };
    
  $.ajax(settings).done(function (response) {
    try {
      console.log(response)
      const obj = JSON.parse(response);
      if (obj.result != false && $.isEmptyObject(obj.description) === false) {
        const data = obj.description;
        exChange(data);
      }
    } catch(e) {console.log(e);}
  });
}

function exChange(data) {
  $('#Tbanner_image').attr("src",`${HOST_URL_TPLANET_DAEMON}${data['banner-image']}`)
  $('#t_planet_img').attr("src",`${HOST_URL_TPLANET_DAEMON}${data['t-planet-img']}`)
  $('#csr_img').attr("src",` ${HOST_URL_TPLANET_DAEMON}${data['csr-img']}`)
  $('#sdg_img').attr("src",` ${HOST_URL_TPLANET_DAEMON}${data['sdg-img']}`)
  $('#twins_img').attr("src",` ${HOST_URL_TPLANET_DAEMON}${data['twins-img']}`)
  $('#textarea1').text(`${data['t-planet-description']}`)
  $('#textarea2').text(`${data['csr-description']}`)
  $('#textarea3').text(`${data['sdg-description']}`)
  $('#textarea4').text(`${data['twins-description']}`)
}

$(document).ready (function () {
  mockup_get();
})
