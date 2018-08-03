const ipc = require('electron').ipcRenderer
const { dialog } = require('electron').remote
const fs = require('fs')
const SerialPort = require('serialport')
const Vue = require('vue/dist/vue.min.js')

const SI = require('./scripts/SI.js')

var currentCard = null
var port
var app = new Vue({
    el: '#content',
    data: {
        courses: [],
        courseNames: [],
        currentCourse: '',
        leadingTimes: {},
        menuVisible: true,
        welcome: true,
        error: null,
        port: false,
        fail: false,
        success: false,
        time: '',
    },
    functions: {
        readableTimeElapsed: function (timeRaw) {
            var timeMinutes = (timeRaw - (timeRaw % 60)) / 60
            var timeSeconds = timeRaw % 60
            if (timeSeconds <= 9 && timeSeconds >= 0) timeSeconds = '0' + timeSeconds
            if (timeMinutes <= 9 && timeMinutes >= 0) timeMinutes = '0' + timeMinutes
            return timeMinutes + ':' + timeSeconds
        },
    },
})

function downloadBaudMenuToggle () {
    if (document.getElementById('baud-dropdown').getAttribute('class') === 'hidden') document.getElementById('baud-dropdown').setAttribute('class', '')
    else document.getElementById('baud-dropdown').setAttribute('class', 'hidden')
}

function downloadChangeBaud (value) {
    document.getElementById('baud-button-content').innerText = value
    downloadBaudMenuToggle()
}

function downloadPortMenuToggle () {
    if (document.getElementById('port-dropdown').getAttribute('class') === 'hidden') {
        var dropdownData = ''
        SerialPort.list(function (error, ports) {
            if (error == null) {
                if (ports.length < 1) {
                    document.getElementById('port-dropdown').innerHTML = '<li onClick=\'downloadChangePort("No Ports Connected")\'>No Ports Connected</li>'
                    document.getElementById('port-dropdown').setAttribute('class', '')
                }
                else {
                    for (port of ports) {
                        dropdownData = dropdownData + `<li onClick="downloadChangePort('${port.comName}')" >  ${port.comName} </li>`
                    }
                    document.getElementById('port-dropdown').innerHTML = dropdownData
                    document.getElementById('port-dropdown').setAttribute('class', '')
                }
            }
        })
    }
    else {
        document.getElementById('port-dropdown').setAttribute('class', 'hidden')
    }
}

function downloadChangePort (value) {
    if (value === 'No Ports Connected') document.getElementById('port-button-content').innerText = ' - '
    else document.getElementById('port-button-content').innerText = value
    downloadPortMenuToggle()
}

function connectPort () {
    if (document.getElementById('connect-button').innerText === 'Connect') {
        var portName = document.getElementById('port-button-content').innerText
        var portBaud = parseInt(document.getElementById('baud-button-content').innerText)
        if (portName !== '-' && portName !== 'Select a Port') {
            currentBuffer = Buffer.from([])
            port = new SerialPort(portName, {
                baudRate: portBaud,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
            })
            port.on('open', function () {
                document.getElementById('connect-button').innerText = 'Disconnect'
                app.port = false
            })
            port.on('data', function (data) {
                var packet = packetData(data)
                if (packet) {
                    processRecievedData(packet, port)
                }
            })
            port.on('error', function (error) {
                port.close()
            })
            port.on('close', function () {
                document.getElementById('connect-button').innerText = 'Connect'
            })
        }
    }
    else {
        port.close()
        document.getElementById('connect-button').innerText = 'Connect'
    }
}

function packetData (incomingData) {
    currentBuffer = Buffer.concat([currentBuffer, incomingData])
    const correctDelimiters = currentBuffer[currentBuffer.length - 1] == 0x03 && currentBuffer[0] == 0x02
    const correctLength = (currentBuffer.length === 12 || currentBuffer.length === 136 || currentBuffer.length === 137)
    if (correctDelimiters && correctLength) {
        var toReturn = currentBuffer
        currentBuffer = Buffer.from([])
        return toReturn
    }
    else {
        return null
    }
}

function readableTimeElapsed (timeRaw) {
    var timeMinutes = (timeRaw - (timeRaw % 60)) / 60
    var timeSeconds = timeRaw % 60
    if (timeSeconds <= 9 && timeSeconds >= 0) timeSeconds = '0' + timeSeconds
    if (timeMinutes <= 9 && timeMinutes >= 0) timeMinutes = '0' + timeMinutes
    return timeMinutes + ':' + timeSeconds
}

function processRecievedData (packet, port) {
    var inserted = SI.inserted(packet)
    if (inserted) {
        currentCard = inserted
        port.write(currentCard.readData)
    }
    else if (currentCard) {
        if (currentCard.dataRecieved(packet)) {
            var processedData = currentCard.processData(packet, port)
            if (processedData) {
                app.fail = false
                app.success = false
                if (checkCourse(processedData.controls, app.courses[app.currentCourse])) {
                    app.time = readableTimeElapsed(processedData.totalTime)
                    app.success = true
                    if (processedData.totalTime < app.leadingTimes[app.currentCourse] || app.leadingTimes[app.currentCourse] == 0) app.leadingTimes[app.currentCourse] = processedData.totalTime
                    app.$forceUpdate()
                }
                else {
                    app.fail = true
                }
            }
        }
    }
}

function importCourses () {
    dialog.showOpenDialog({
        title: 'Import Courses',
        filters: [
            { name: 'JSON', extensions: ['JSON'] },
            { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
    }, function (paths) {
        try {
            fs.readFile(paths[0], function (error, data) {
                if (!error) {
                    app.courseNames = Object.keys(JSON.parse(fs.readFileSync(paths[0], 'utf8')))
                    app.currentCourse = app.courseNames[0]
                    app.courses = JSON.parse(fs.readFileSync(paths[0], 'utf8'))
                    app.welcome = false
                    app.port = true
                    for (course of app.courseNames) app.leadingTimes[course.toString()] = 0
                }
                else {
                    app.error = 'Error: File format is invalid'
                }
            })
        }
        catch (error) {
            app.error = ''
        }
    })
}

function checkCourse (cardList, courseList) {
    var cardListCounter = 0
    var courseListCounter = 0
    while (cardListCounter < cardList.length && courseListCounter < courseList.length) {
        if (cardList[cardListCounter].code != courseList[courseListCounter]) {
            var tempCardListCounter = cardListCounter
            var match = false
            while (tempCardListCounter < cardList.length) {
                if (cardList[tempCardListCounter].code == courseList[courseListCounter]) {
                    cardListCounter = tempCardListCounter
                    match = true
                    break
                }
                else {
                    tempCardListCounter = tempCardListCounter + 1
                }
            }
            if (match == false) {
                return false
            }
        }
        cardListCounter = cardListCounter + 1
        courseListCounter = courseListCounter + 1
    }

    return courseListCounter == courseList.length
}
