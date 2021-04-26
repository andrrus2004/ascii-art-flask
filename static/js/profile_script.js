let login;

$('#log_btn').click(function() {
    $.ajax({
        url: '/log-out',
        type: 'POST',
    }).done(function(data){
        window.location.href = '/';
    });
})

$('.use-btn').click(function() {
   console.log($(this).attr('id'));
   // $.ajax({
   //      url: '/log-out',
   //      type: 'POST',
   //  }).done(function(data){
   //      window.location.href = '/';
   //  });
});

$('.del-btn').click(function() {
   console.log($(this).attr('id'));
   $.ajax({
        url: '/del-history-element',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id: $(this).attr('id')
        })
    }).done(function(data){
        window.location.href = '/profile';
    });
});

$('.del-temp-btn').click(function() {
   console.log($(this).attr('id'));
   $.ajax({
        url: '/del-template-element',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id: $(this).attr('id')
        })
    }).done(function(data){
        window.location.href = '/profile';
    });
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

$(document).ready(function() {
    $.ajax({
            url: '/get-login',
            type: 'GET',
        }).done(function (data) {
            login = data;
            console.log(login)
            if (login !== 'false') {
                $('#login-btn').html(login);
            } else {
                $('#login-btn').html('Вход');
            }
        });
});
