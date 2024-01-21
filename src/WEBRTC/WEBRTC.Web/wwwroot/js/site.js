const mediaStreamConstraints = {
    video: true,
    audio: true
};

// Video element where stream will be placed.
const localVideo = document.getElementById('localVideo');

//Video and Audio On/ Off
const muteButton = document.getElementById("muteButton");
const cameraButton = document.getElementById("cameraButton");

let mute = true;
let camera = true;

// Local stream that will be reproduced on the video.
let localStream;

// Handles success by adding the MediaStream to the video element.
function gotLocalMediaStream(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
}

muteButton.addEventListener("click", event => {
    if (mute) {
        mute = false;
        muteButton.textContent = "Mute yourself";
        localStream.getAudioTracks().forEach(track => {
                track.enabled = true;
            })
    } else {
        mute = true;
        muteButton.textContent = "Unmute yourself";
        localStream.getAudiotracks().foreach(track => {
                track.enabled = false;
            })
    }
})

cameraButton.addEventListener("click", event => {
    if (camera) {
        camera = false;
        cameraButton.textContent = "Turn on camera";
        localStream.getVideoTracks().forEach(track => {
                track.enabled = false;
            })

    } else {
        camera = true;
        cameraButton.textContent = "Turn off camera";
        localStream.getVideoTracks().forEach(track => {
                track.enabled = true;
            })
    }


})

// Handles error by logging a message to the console with the error message.
function handleLocalMediaStreamError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

// Initializes media stream.
navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);



