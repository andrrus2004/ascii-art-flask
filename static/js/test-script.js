html2canvas(document.querySelector("#capture")).then(canvas => {
    console.log(canvas.toDataURL());
    document.body.appendChild(canvas);
});
