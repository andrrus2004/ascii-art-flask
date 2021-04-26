let using

function validValues(id, value) {
    if (id === 'login') {
        if (using['login'][value] !== undefined) {
            return 'login-using-error'
        } else {
            return true;
        }
    } else if (id === 'email') {
        let patt1 = new RegExp("@");
        let patt2 = new RegExp("[.]");
        if (!(patt1.test(value) && patt2.test(value))) {
            return 'email-error';
        } else if (using['email'][value] !== undefined) {
            return 'email-using-error'
        } else {
            return true;
        }
    } else if (id === 'pas1') {
        let pas2 = document.getElementById('pas2');
        if (value !== '' && $(pas2).val() !== '') {
            if ($(pas2).val() !== value) {
                return 'password-error';
            } else {
                return true;
            }
        }
    } else if (id === 'pas2') {
        let pas1 = document.getElementById('pas1');
        if (value !== '' && $(pas1).val() !== '') {
            if ($(pas1).val() !== value) {
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
    if (id === 'name' || id === 'surname') {
        return true;
    }
    if ($(input).val() === '') {
        lab.text('Это поле необходимо заполнить');
        fal.css('display', 'block');
        succes = false;
    } else {
        lab.text('');
        fal.css('display', 'none');
        let result = validValues(id, $(input).val());
        if (result === 'login-using-error') {
            lab.text('Пользователь с таким логином уже существует');
            fal.css('display', 'block');
            succes = false
        } else if (result === 'email-error') {
            lab.text('Введён некорректный email');
            fal.css('display', 'block');
            succes = false
        } else if (result === 'email-using-error') {
            lab.text('Пользователь с таким email уже существует');
            fal.css('display', 'block');
            succes = false
        } else if (result === 'password-error') {
            $(findErrorLab('pas1')).text('Пароли не совпадают');
            $(findFal('pas1')).css('display', 'block');
            $(findErrorLab('pas2')).text('Пароли не совпадают');
            $(findFal('pas2')).css('display', 'block');
            succes = false
        } else if (result === true) {
            if (id === 'pas1' || id === 'pas2') {
                $(findErrorLab('pas1')).text('');
                $(findFal('pas1')).css('display', 'none');
                $(findErrorLab('pas2')).text('');
                $(findFal('pas2')).css('display', 'none');
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
        console.log(succes)
    });
    return succes;
}

$(document).ready(function() {
    $.ajax({
        url: '/get-using',
        type: 'GET'
    }).done(function(data){
        // console.log(data);
        using = data;
        console.log(using);
    });
    $("input").change(function() {
        validationValue(this);
    });
    $('#reg_btn').on('click', function() {
        console.log(validation())
        if (validation()) {
            $.ajax({
                url: '/new-user',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    login: $('#login').val(),
                    password: $('#pas1').val(),
                    email: $('#email').val(),
                    name: $('#name').val(),
                    surname: $('#surname').val()
                })
            }).done(function(data){
                window.location.href = '/profile';
                // $('#answer1').html(data);
            });
        }
    });
})

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