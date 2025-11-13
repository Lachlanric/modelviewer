function updateCameraFrame(jpegBlob) {
  var reader = new FileReader();
  reader.readAsDataURL(jpegBlob);
  reader.onloadend = function () {
    var base64data = reader.result;
    console.log(base64data);
    document.querySelector("img#camera-feed").src = base64data;
  };
}

// Default camera image
document.querySelector("img#camera-feed").src = "img/no-data.png";
