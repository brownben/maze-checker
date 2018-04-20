// Set Original Icon
document.getElementById('icon-min').setAttribute('style', 'display:inline')
document.getElementById('icon-max').setAttribute('style', 'display:none')

// Close Window Listener
document.getElementById('close').addEventListener('click', function () {
    window.close()
})

// Maximise Listener
document.getElementById('maximize').addEventListener('click', function () {
    ipc.send('window', 'maximize')
})

// Minimize Listener
document.getElementById('minimize').addEventListener('click', function () {
    ipc.send('window', 'minimize')
})

// Change Icon once window has been updated
ipc.on('window', function (event, arg) {
    if (arg === 'minimized') {
        document.getElementById('icon-min').setAttribute('style', 'display:inline')
        document.getElementById('icon-max').setAttribute('style', 'display:none')
    }
    else if (arg === 'maximized') {
        document.getElementById('icon-min').setAttribute('style', 'display:none')
        document.getElementById('icon-max').setAttribute('style', 'display:inline')
    }
})

ipc.on('toggle-menu', function (event, arg) {
    if (app.menuVisible == false) app.menuVisible = true
    else app.menuVisible = false
})
