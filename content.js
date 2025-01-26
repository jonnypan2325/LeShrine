// Content script to replace blocked ad containers with LeBron images
const lebronImageUrl = chrome.runtime.getURL("/media/image/blockedByJames.jpg");
const lebronAudioUrl = chrome.runtime.getURL("/media/audio/blockedByJames.mp3");
console.log("LeBron image URL loaded:", lebronImageUrl);
console.log("LeBron audio URL loaded:", lebronAudioUrl);

// List of false-positive words to exclude
const truePositiveWords = ["advertisement","-ads", "-ads-", "-ad"]

let audioQueue = []; // Queues up the audo to play after interaction
let playingAudios = []; // Stores all audios that are currently playing

let deactivateAudio = false; // Disables audio playback
let lastKnownScrollY = 0; // Track last known scroll position
let scrollListenerActive = false; // Tracks whether the scroll listener is active
let lastPlayedTimestamp = 0; // Timestamp of the last audio playback
let userHasClicked = false; // Tracks if the user has clicked on the webpage

const AUDIO_PLAY_BUFFER = 600; // Buffer between plays

// Since Chrome doesn't allow automatic audio playback, I have implemented an audio queue 
// Queues up audio whenever an ad is blocked
// Clears the queue when the user interacts with the webpage (scrolls or clicks)

// Function to dynamically add the scroll listener
function activateScrollListener() {
    if (!scrollListenerActive) {
        console.log("Activating scroll listener.");
        document.addEventListener("scroll", detectUserScroll);
        scrollListenerActive = true;
    }
}

// Function to dynamically remove the scroll listener
function deactivateScrollListener() {
    if (scrollListenerActive) {
        console.log("Deactivating scroll listener.");
        document.removeEventListener("scroll", detectUserScroll);
        scrollListenerActive = false;
    }
}

// Function to queue the LeBron audio
function queueLebronAudio() {
    if (deactivateAudio) {
        console.log("Audio is deactivated. Skipping queue.");
        return;
    }

    const audio = new Audio(lebronAudioUrl);
    console.log("Queuing audio for playback.");
    audioQueue.push(audio);

    if(userHasClicked){
        activateScrollListener(); // Activates when an audio is queued
    }
   
}

// Function to process one audio from the queue
function playNextAudio() {
    const currentTime = Date.now();
    if (audioQueue.length === 0) {
        console.log("No audio to play.");
        return;
    }

    if (currentTime - lastPlayedTimestamp < AUDIO_PLAY_BUFFER) {
        console.log("Audio playback delayed to respect buffer.");
        return;
    }

    const audio = audioQueue.shift();
    lastPlayedTimestamp = currentTime; // Update the last playback timestamp

    console.log("Playing audio from the queue. Remaining queue length:", audioQueue.length);
    playingAudios.push(audio); //Adds audio to list of currently playing audios

    audio.play()
        .then(() => {
            console.log("Audio started playing successfully.");
            // Wait for the audio to finish playing
            audio.addEventListener("ended", () => {
                console.log("Audio finished playing.");
                const index = playingAudios.indexOf(audio);
                if (index !== -1) {
                    playingAudios.splice(index, 1); // Remove from the list when it ends
                }
            });
        })
        .catch((error) => {
            console.error("Audio playback failed:", error);

            // Requeue the audio if playback is blocked
            if (error.name === "NotAllowedError" || error.name === "NotSupportedError") {
                console.log("Requeuing blocked audio.");
                audioQueue.unshift(audio);
            }
        });
    // Deactivate the scroll listener if the queue is empty
    if (audioQueue.length === 0) {
        deactivateScrollListener();
    }
}

// Function to detect user-initiated scrolling
function detectUserScroll() {
    const currentScrollY = window.scrollY;

    // Check if the scroll was initiated by the mouse
    if (currentScrollY !== lastKnownScrollY) {
        console.log("User-initiated scroll detected.");
        playNextAudio();
    } else {
        console.log("Non-user scroll detected, ignoring.");
    }

    lastKnownScrollY = currentScrollY; // Update the last known scroll position
}

// Function to replace an empty ad container with a LeBron image
function replaceWithLebronImage(element) {
    // Skip if the element has already been replaced
    if (element.dataset.replaced === "true") return;

    console.log("Replacing blocked ad container with LeBron image:", element);

    // Create a LeBron image
    const img = document.createElement("img");
    img.src = lebronImageUrl;
    img.alt = "LeBron James";
    img.style.width = "100%"; // Fit the container
    img.style.height = "100%"; // Fit the container
    img.style.objectFit = "cover"; // Ensure proper scaling

    // Mark the container as replaced
    element.dataset.replaced = "true";

    // Clear any existing content in the container and insert the image
    element.innerHTML = "";
    element.appendChild(img);

    //Queue LeBron audio
    if(!deactivateAudio) {
        queueLebronAudio();
    }
  

    // Remove the LeBron image after 5 seconds
    setTimeout(() => {
        if (element.contains(img)) {
            console.log("Removing LeBron image from:", element);
            element.remove(); // Clear the container
        }
    }, 5000); // 5 seconds
}

// Function to dynamically build a selector for true-positive words
function buildSelectorFromTruePositives() {
    return truePositiveWords
        .map(word => `[class*='${word}'], iframe[src*='${word}'], [data-content*='${word}']`) // Build individual selectors
        .join(", "); // Combine into a single selector
}

// Function to check if an iframe contains "advertisement" in data-content or other attributes
function isIframeAdvert(element) {
    if (element.tagName.toLowerCase() === "iframe" || element.dataset.content?.toLowerCase().includes("advertisement")) {
        return true;
    }
    return false;
}

// Function to find and replace leftover ad containers on page load
function replaceBlockedAds() {
    const truePositiveSelector = buildSelectorFromTruePositives(); // Build the selector
    const adContainers = document.querySelectorAll(`.ad, .ad-container, ${truePositiveSelector}, iframe, [data-content*="Advertisement"]`);

    adContainers.forEach((element) => {
        // Skip invalid elements based on false-positive logic
        if (
            (!element.querySelector("img") && element.offsetHeight > 0 && element.offsetWidth > 0) ||
            isIframeAdvert(element)
        ) {
            replaceWithLebronImage(element);
        }
    });
}

// Function to handle ESC key press to disable audio
function handleEscapeKey(event) {
    if (event.key === "Escape") {
        console.log("ESC key pressed. Disabling audio.");
        audioQueue.forEach(audio => audio.pause()); // Pause all audios
        playingAudios.forEach(audio => audio.pause());  // Stop all currently playing audios
        playingAudios = []; // Clear the list of currently playing audios
        audioQueue = []; // Clear the queue
        deactivateScrollListener(); // Stop listening for scroll events
        deactivateAudio = true;
    }
}

// Listener to detect the first user click
function handleUserClick() {
    if (!userHasClicked) {
        console.log("User clicked on the webpage. Activating scroll listener.");
        activateScrollListener(); // Activate the scroll listener
        userHasClicked = true; // Mark that the user has clicked
    }
}


// Observe changes and dynamically replace new ad containers
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Dynamically build a true-positive selector
                const truePositiveSelector = buildSelectorFromTruePositives();

                // Check if the new element matches ad selectors or is an iframe ad
                if (
                    node.matches(`.ad, .ad-container, ${truePositiveSelector}, iframe, [data-content*="Advertisement"]`) ||
                    isIframeAdvert(node)
                ) {
                    replaceWithLebronImage(node);
                }
            }
        });
    });
});

// Start observing the document body for changes
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// Replace any existing ad containers on page load
replaceBlockedAds();



// Add a listener for the ESC key to disable audio
document.addEventListener("keydown", handleEscapeKey);
document.addEventListener("click", handleUserClick);

