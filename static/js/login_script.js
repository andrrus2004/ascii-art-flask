let login_email_password;

function validValues(id, value) {
    if (id === 'login') {
        if (login_email_password[value] === undefined) {
            return 'login-error';
        } else {
            return true;
        }
    } else if (id === 'pas') {
        let pas = document.getElementById('pas');
        if (value !== '' && $(pas).val() !== '') {
            if ($('#pas').val() !== login_email_password[$('#login').val()]) {
                return 'password-error';
            } else {
                return true;
            }
        }
    }
}

function validationValue(input) {
    let succes = true;
    const id = $(input).attr('id');
    const lab = $(findErrorLab(id));
    const fal = $(findFal(id));
    if ($(input).val() === '') {
        lab.text('Это поле необходимо заполнить');
        fal.css('display', 'block');
        succes = false;
    } else {
        lab.text('');
        fal.css('display', 'none');
        let result = validValues(id, $(input).val());
        if (result === 'login-error') {
            lab.text('Такого логина или email не существует');
            fal.css('display', 'block');
            succes = false
        } else if (result === 'password-error') {
            $(findErrorLab('pas')).text('Неправильный пароль');
            $(findFal('pas')).css('display', 'block');
            succes = false
        } else if (result === true) {
            if (id === 'pas') {
                $(findErrorLab('pas')).text('');
                $(findFal('pas')).css('display', 'none');
            } else {
                lab.text('');
                fal.css('display', 'none');
            }
        } else {
            lab.text('');
            fal.css('display', 'none');
        }
    }
    return succes
}

function validation($form) {
    let succes = true;
    $('input').each(function() {
        let result = validationValue(this);
        if (result === false) {
            succes = result;
        }
    });
    return succes;
}

function quick_validation(input) {
    let succes = true;
    const id = $(input).attr('id');
    const lab = $(findErrorLab(id));
    const fal = $(findFal(id));
    if ($(input).val() === '') {
        lab.text('Это поле необходимо заполнить');
        fal.css('display', 'block');
        succes = false;
    } else {
        lab.text('');
        fal.css('display', 'none');
        succes = true;
    }
    return succes;
}

$(document).ready(function() {
    $.ajax({
        url: '/get_login_password',
        type: 'GET'
    }).done(function(data){
        login_email_password = data;
    });
    $('#log_btn').on('click', function() {
        console.log(validation());
        if (validation()) {
            $.post({
                url: '/log-in',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    login: $('#login').val()
                })
            }).done(function (data) {
                window.location.href = '/profile';
            });
        }
    });
});

$("input").change(function() {
    quick_validation(this);
});

$('#registration-btn').click(function() {
    window.location.href = '/registration';
});
$('#login-btn').click(function() {
    window.location.href = '/login';
});

function findFal(id) {
    const arr = Array.from(document.getElementsByClassName("fal"));
    return arr.filter(element => element.dataset.for === id)[0];
}

function findErrorLab(id) {
    const arr = Array.from(document.querySelectorAll('.text-error p'));
    return arr.filter(element => element.dataset.for === id)[0];
}