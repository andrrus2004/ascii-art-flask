$(function(){
  $(".twentytwenty-container").twentytwenty({
    // default_offset_pct: 0.5, // How much of the before image is visible when the page loads
    // orientation: 'horizontal', // Orientation of the before and after images ('horizontal' or 'vertical')
    // before_label: 'Before', // Set a custom before label
    // after_label: 'After', // Set a custom after label
    no_overlay: true, //Do not show the overlay with before and after
    click_to_move: false // Allow a user to click (or tap) anywhere on the image to move the slider to that location.
  });
});

var inputError = false;
$('#imageInput').change(function() {
  var myFile = $(this).prop('files');
  console.log(myFile);
  if (myFile.length !== 0 && !myFile[0]['type'].includes('image')) {
    $('.files').addClass('error');
    inputError = true;
  } else {
    if (inputError) {
      $('.files').removeClass('error');
      inputError = false;
    }
    console.log('Всё ок!');
    $('#submit-btn').click();
  }
});

$( document ).ready(function() {
    html2canvas(document.querySelector("#ascii-text")).then(canvas => {
    console.log(canvas.toDataURL());
});
});
