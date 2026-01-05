function jump(event) {
    const button = event.target;
    button.style.left = Math.random() * document.body.clientWidth + 'px';
    button.style.top = Math.random() * document.body.clientHeight + 'px';
}

const jsConfetti = new JSConfetti();
function celebrate() {
    jsConfetti.addConfetti();
}
