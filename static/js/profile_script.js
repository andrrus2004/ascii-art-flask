let login_password;

$('#log_btn').click(function() {
    $.ajax({
        url: '/log-out',
        type: 'POST',
    }).done(function(data){
        window.location.href = '/';
    });
})

$('#registration-btn').click(function() {
    window.location.href = '/registration';
});
$('#login-btn').click(function() {
    window.location.href = '/login';
});
