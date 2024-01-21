const mediaStreamConstraints = {
    video: true,
    audio: true
};

// Video element where stream will be placed.
const localVideo = document.getElementById('localVideo');

//Video and Audio On/ Off
const muteButton = document.getElementById("muteButton");
const cameraButton = document.getElementById("cameraButton");

let mute = false;
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
        muteButton.textContent = "Mute";
        localStream.getAudioTracks().forEach(track => {
                track.enabled = true;
            })
    } else {
        mute = true;
        muteButton.textContent = "Unmute";
        localStream.getAudiotracks().foreach(track => {
                track.enabled = false;
            })
    }
})

cameraButton.addEventListener("click", event => {
    if (camera) {
        camera = false;
        cameraButton.textContent = "Camera On";
        localStream.getVideoTracks().forEach(track => {
                track.enabled = false;
            })

    } else {
        camera = true;
        cameraButton.textContent = "Camera Off";
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



// Set up an asynchronous communication channel that will be
// used during the peer connection setup
const signalingChannel = new SignalingChannel(remoteClientId);
signalingChannel.addEventListener('message', message => {
    // New message from remote client received
});

// Send an asynchronous message to the remote client
signalingChannel.send('Hello!');

async function makeCall() {
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
    const peerConnection = new RTCPeerConnection(configuration);
    signalingChannel.addEventListener('message', async message => {
        if (message.answer) {
            const remoteDesc = new RTCSessionDescription(message.answer);
            await peerConnection.setRemoteDescription(remoteDesc);
        }
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalingChannel.send({ 'offer': offer });
}

const peerConnection = new RTCPeerConnection(configuration);
signalingChannel.addEventListener('message', async message => {
    if (message.offer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingChannel.send({ 'answer': answer });
    }
});

// Listen for local ICE candidates on the local RTCPeerConnection
peerConnection.addEventListener('icecandidate', event => {
    if (event.candidate) {
        signalingChannel.send({ 'new-ice-candidate': event.candidate });
    }
});

// Listen for remote ICE candidates and add them to the local RTCPeerConnection
signalingChannel.addEventListener('message', async message => {
    if (message.iceCandidate) {
        try {
            await peerConnection.addIceCandidate(message.iceCandidate);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
});

// Listen for connectionstatechange on the local RTCPeerConnection
peerConnection.addEventListener('connectionstatechange', event => {
    if (peerConnection.connectionState === 'connected') {
        // Peers connected!
    }
});

localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
});

const remoteVideo = document.getElementById('remoteVideo');

peerConnection.addEventListener('track', async (event) => {
    const [remoteStream] = event.streams;
    remoteVideo.srcObject = remoteStream;
});