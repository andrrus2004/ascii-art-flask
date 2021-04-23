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
    if (myFile.length !== 0 && !myFile[0]['type'].includes('image')) {
        $('.files').addClass('error');
        inputError = true;
    } else {
        if (inputError) {
        $('.files').removeClass('error');
        inputError = false;
        }
        console.log('Всё ок!');
        console.log(myFile)
        var formData = new FormData();
        formData.append('img-file', $("#imageInput")[0].files[0]);
        $.ajax({
            url: '/load-image',
            type: 'POST',
            contentType: false,
			processData: false,
			dataType : 'json',
            data: formData
        }).done(function (data) {
            console.log(data);
        });
        $('.color-settings').removeClass('hide');
        $('#load-image').addClass('hide');
    }
});

$('#black-btn').click(function() {
    $.ajax({
        url: '/settings',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            color: 'black'
        })
    }).done(function (data) {
        $.ajax({
            url: '/get-ascii',
            type: 'GET',
        }).done(function (data) {
            $('#ascii-text').text(data['ascii']);
            var font = data['font_size'].toString() + 'pt';
            $('#ascii-text').css("font-size", font);
            $('#ascii-text').css("background-color", 'white');
        });
        $('#convert-image').removeClass('hide');
        $('#black-ch').addClass('text-white bg-primary border-primary');
        $('#black-card').addClass('border-primary');
        $('#black-btn').prop('disabled', true);
        $('#colored-ch').removeClass('text-white bg-primary border-primary');
        $('#colored-card').removeClass('border-primary');
        $('#colored-btn').prop('disabled', false);
    });
});

$('#colored-btn').click(function() {
    $.ajax({
        url: '/settings',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            color: 'coloured'
        })
    }).done(function (data) {
        $.ajax({
            url: '/get-ascii',
            type: 'GET',
        }).done(function (data) {
            document.getElementById('ascii-text').innerHTML = "";
            $('#ascii-text').append(data['ascii']);
            var font = data['font_size'].toString() + 'pt';
            $('#ascii-text').css("font-size", font);
            $('#ascii-text').css("background-color", 'black');
        });
        $('#convert-image').removeClass('hide');
        $('#colored-ch').addClass('text-white bg-primary border-primary');
        $('#colored-card').addClass('border-primary');
        $('#colored-btn').prop('disabled', true);
        $('#black-ch').removeClass('text-white bg-primary border-primary');
        $('#black-card').removeClass('border-primary');
        $('#black-btn').prop('disabled', false);
    });
});

$(document).ready(function() {
    html2canvas(document.querySelector("#ascii-text")).then(canvas => {
        console.log(canvas.toDataURL());
    });
});
