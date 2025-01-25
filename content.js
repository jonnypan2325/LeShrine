// Content script to replace blocked ad containers with LeBron images
const lebronImageUrl = chrome.runtime.getURL("/media/image/blockedByJames.jpg");
const lebronAudioUrl = chrome.runtime.getURL("/media/audio/blockedByJames.mp3");
console.log("LeBron image URL loaded:", lebronImageUrl);
console.log("LeBron audio URL loaded:", lebronAudioUrl);

// List of false-positive words to exclude
const truePositiveWords = ["advertisement","-ads", "-ads-", "-ad"]

let audioQueue = []; // Queues up the audo to play after interaction

// Since Chrome doesn't allow automatic audio playback, I have implemented an audio queue 
// Queues up audio whenever an ad is blocked
// Clears the queue when the user interacts with the webpage (scrolls or clicks)

// Function to queue the LeBron audio
function queueLebronAudio() {
    const audio = new Audio(lebronAudioUrl);
    console.log("Queuing audio for playback.");
    audioQueue.push(audio);

    // Dynamically add scroll listener if queue is not empty
    if (audioQueue.length === 1) {
        console.log("Audio queue is not empty. Activating click listener.");
        document.addEventListener("click", handleUserInteraction);
    }
}

// Function to process the audio queue immediately on user interaction
function handleUserInteraction() {
    console.log("User interaction detected. Processing audio queue...");

    // Play all queued audio directly in this interaction handler
    while (audioQueue.length > 0) {
        const audio = audioQueue.shift();
        console.log("Playing from audio queue. Queue length:", audioQueue.length);
        audio.play()
            .then(() => console.log("Audio played successfully."))
            .catch((error) => console.error("Audio playback failed:", error));
    }

    // Remove the scroll listener if the queue is empty
    if (audioQueue.length === 0) {
        console.log("Audio queue is empty. Removing scroll listener.");
        document.removeEventListener("click", handleUserInteraction);
    }
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
    queueLebronAudio();

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




