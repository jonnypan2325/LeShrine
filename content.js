// Content script to replace blocked ad containers with LeBron images
const lebronImageUrl = chrome.runtime.getURL("/media/image/blockedByJames.jpg");
console.log("LeBron image URL loaded:", lebronImageUrl);

// List of false-positive words to exclude
const falsePositiveWords = ["head", "heads", "header"];

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
}

// Function to check if an element is valid for replacement
function isValidAdElement(element) {
    const classList = element.className.toLowerCase(); // Get all classes in lowercase

    // Check if any false-positive word is present
    const containsFalsePositive = falsePositiveWords.some(word => classList.includes(word));

    if (containsFalsePositive) {
        // Check if there's another "ad" (not part of the false-positive list) in the class
        const matchesAd = classList.split(/\s+/).some(cls => {
            // Ensure the class contains "ad" and is not one of the false-positive words
            return cls.includes("ad") && !falsePositiveWords.some(word => cls.includes(word));
        });

        if (!matchesAd) return false; // Exclude if no valid "ad" is found
    }

    // Otherwise, allow the element for replacement
    return true;
}

// Function to find and replace leftover ad containers on page load
function replaceBlockedAds() {
    const adContainers = document.querySelectorAll(".ad, .ad-container, iframe[src*='ads'], [class*='ad']");

    adContainers.forEach((element) => {
        // Skip invalid elements based on false-positive logic
        if (!isValidAdElement(element)) return;

        // Ensure the element is empty or likely to be an ad before replacing
        if (!element.querySelector("img") && element.offsetHeight > 0 && element.offsetWidth > 0) {
            replaceWithLebronImage(element);
        }
    });
}

// Observe  changes and dynamically replace new ad containers
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the new element matches ad selectors and passes validation
                if (
                    node.matches(".ad, .ad-container, iframe[src*='ads'], [class*='ad']") &&
                    isValidAdElement(node)
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
