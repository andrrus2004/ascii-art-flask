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