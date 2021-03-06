let login;
let names;

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

function load_settings() {
    $.ajax({
        url: '/get-settings',
        type: 'GET',
    }).done(function (data) {
        $('#lines_count').val(data['line_count']);
        $('#font_size').val(data['font_size']);
        if (data["groups"].includes("let_num")) {
            $('#let_num').attr('checked', true);
        } else {
            $('#let_num').attr('checked', false);
        }
        if (data["groups"].includes("punctuation")) {
            $('#punctuation').attr('checked', true);
        } else {
            $('#punctuation').attr('checked', false);
        }
        if (data["groups"].includes("special")) {
            $('#special').attr('checked', true);
        } else {
            $('#special').attr('checked', false);
        }
    });
}

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
        var formData = new FormData();
        formData.append('img-file', $("#imageInput")[0].files[0]);
        $.ajax({
            url: '/load-image',
            type: 'POST',
            contentType: false,
			processData: false,
			dataType : 'json',
            data: formData
        }).done(function (data) {});
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
            load_settings();
        });
        $('#convert-image').removeClass('hide');
        $('#detail-settings').removeClass('hide');
        $('#black-ch').addClass('text-white bg-primary border-primary');
        $('#black-card').addClass('border-primary');
        $('#black-btn').prop('disabled', true);
        $('#colored-ch').removeClass('text-white bg-primary border-primary');
        $('#colored-card').removeClass('border-primary');
        $('#colored-btn').prop('disabled', false);
        $(window).scrollTop(0);
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
            load_settings();
        });
        $('#convert-image').removeClass('hide');
        $('#detail-settings').removeClass('hide');
        $('#colored-ch').addClass('text-white bg-primary border-primary');
        $('#colored-card').addClass('border-primary');
        $('#colored-btn').prop('disabled', true);
        $('#black-ch').removeClass('text-white bg-primary border-primary');
        $('#black-card').removeClass('border-primary');
        $('#black-btn').prop('disabled', false);
        $(window).scrollTop(0);
    });
});

$("#settings-form").submit(function() {
    var groups_input = Array()
    if ($('#let_num').is(':checked')) {
        groups_input.push('let_num');
    }
    if ($('#punctuation').is(':checked')) {
        groups_input.push('punctuation');
    }
    if ($('#special').is(':checked')) {
        groups_input.push('special');
    }
    $.ajax({
        url: '/settings',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            font_size: $("#font_size").val(),
            line_count: $("#lines_count").val(),
            auto_size: false,
            groups: groups_input
        })
    }).done(function (data) {
        $.ajax({
            url: '/get-ascii',
            type: 'GET',
        }).done(function (data) {
            if (data['color'] === 'coloured') {
                document.getElementById('ascii-text').innerHTML = "";
                $('#ascii-text').append(data['ascii']);
                $('#ascii-text').css("background-color", 'black');
            } else if (data['color'] === 'black') {
                $('#ascii-text').text(data['ascii']);
                $('#ascii-text').css("background-color", 'white');
            }
            var font = data['font_size'].toString() + 'pt';
            $('#ascii-text').css("font-size", font);
            $(window).scrollTop(0);
        });
    });
    return false;
});

$('#let_num').click(function() {
    if (!($('#let_num').is(':checked') || $('#punctuation').is(':checked') || $('#special').is(':checked'))) {
        $('#save-settings').prop('disabled', true);
        $('#modal-btn').prop('disabled', true);
    } else {
        if (login !== 'false') {
            $('#modal-btn').prop('disabled', false);
        }
        $('#save-settings').prop('disabled', false);
    }
});

$('#punctuation').click(function() {
    if (!($('#let_num').is(':checked') || $('#punctuation').is(':checked') || $('#special').is(':checked'))) {
        $('#save-settings').prop('disabled', true);
        $('#modal-btn').prop('disabled', true);
    } else {
        if (login !== 'false') {
            $('#modal-btn').prop('disabled', false);
        }
        $('#save-settings').prop('disabled', false);
    }
});

$('#special').click(function() {
    if (!($('#let_num').is(':checked') || $('#punctuation').is(':checked') || $('#special').is(':checked'))) {
        $('#save-settings').prop('disabled', true);
        $('#modal-btn').prop('disabled', true);
    } else {
        if (login !== 'false') {
            $('#modal-btn').prop('disabled', false);
        }
        $('#save-settings').prop('disabled', false);
    }
});

$('#registration-btn').click(function() {
    window.location.href = '/registration';
});

$('#login-btn').click(function() {
    if (login !== 'false') {
        window.location.href = '/profile';
    } else {
        window.location.href = '/login';
    }
});

$('#save-template').click(function() {
    $.ajax({
            url: '/get-temp-names',
            type: 'GET',
        }).done(function (data) {
            names = Array(data);
            val = $('#temp-name').val();
            if (val === '') {
                $('#temp-name-error').text('?????????????? ???????????????? ???????????? ??????????????');
                return false;
            } else if (names[0][val] !== undefined) {
                $('#temp-name-error').text('???????????? ?? ?????????? ?????????????????? ?????? ????????????????????');
                return false;
            } else {
                $('#temp-name-error').text('');
            }
        let groups_input = Array();
        if ($('#let_num').is(':checked')) {
            groups_input.push('let_num');
        }
        if ($('#punctuation').is(':checked')) {
            groups_input.push('punctuation');
        }
        if ($('#special').is(':checked')) {
            groups_input.push('special');
        }
        $.ajax({
            url: '/new-template',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: val,
                font_size: $("#font_size").val(),
                line_count: $("#lines_count").val(),
                auto_size: false,
                groups: groups_input
            })
        }).done(function (data) {
            $('#back-btn').click();
        });
    });
});

$('#img-save').click(function() {
    $(window).scrollTop(0);
    html2canvas(document.querySelector("#ascii-text")).then(canvas => {
        var download = document.getElementById('download');
        download.href = canvas.toDataURL();
        download.download='ascii-image.png';
        download.click()
    });
});

$('.dropdown-item').click(function() {
    $.ajax({
            url: '/load-template',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: $(this).text()
            })
        }).done(function (data) {
            load_settings();
            $.ajax({
            url: '/get-ascii',
            type: 'GET',
        }).done(function (data) {
            if (data['color'] === 'coloured') {
                document.getElementById('ascii-text').innerHTML = "";
                $('#ascii-text').append(data['ascii']);
                $('#ascii-text').css("background-color", 'black');
                $('#colored-ch').addClass('text-white bg-primary border-primary');
                $('#colored-card').addClass('border-primary');
                $('#colored-btn').prop('disabled', true);
                $('#black-ch').removeClass('text-white bg-primary border-primary');
                $('#black-card').removeClass('border-primary');
                $('#black-btn').prop('disabled', false);
            } else if (data['color'] === 'black') {
                $('#ascii-text').text(data['ascii']);
                $('#ascii-text').css("background-color", 'white');
                $('#black-ch').addClass('text-white bg-primary border-primary');
                $('#black-card').addClass('border-primary');
                $('#black-btn').prop('disabled', true);
                $('#colored-ch').removeClass('text-white bg-primary border-primary');
                $('#colored-card').removeClass('border-primary');
                $('#colored-btn').prop('disabled', false);
            }
            var font = data['font_size'].toString() + 'pt';
            $('#ascii-text').css("font-size", font);
            $(window).scrollTop(0);
        });
    });
});

$('.to-top').click(function() {
    $(window).scrollTop(0);
});

$(document).ready(function() {
    $.ajax({
            url: '/get-login',
            type: 'GET',
        }).done(function (data) {
            login = data;
            if (login !== 'false') {
                $('#modal-btn').prop('disabled', false);
                $('#select-btn').prop('disabled', false);
                $('#login-btn').html(login);
            } else {
                $('#modal-btn').prop('disabled', true);
                $('#select-btn').prop('disabled', true);
                $('#login-btn').html('????????');
            }
        });
});
