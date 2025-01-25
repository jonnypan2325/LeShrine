// Content script to replace ads with LeBron images
const lebronImageUrl = "https://s3-prod.crainscleveland.com/s3fs-public/The%20Block_i.jpg"; 

// Function to replace an ad element with a LeBron image
function replaceWithLebronImage(element) {
    const img = document.createElement("img");
    img.src = lebronImageUrl;
    img.alt = "LeBron James";
    img.style.width = element.offsetWidth + "px"; // Match ad size
    img.style.height = element.offsetHeight + "px"; // Match ad size
    img.style.objectFit = "cover"; // Ensure proper fit
    element.replaceWith(img);
}

// Observe DOM for changes to dynamically replace ads
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Replace ads dynamically
                if (node.matches("img, iframe, .ad, [class*='ad']")) {
                    replaceWithLebronImage(node);
                }
            }
        });
    });
});

// Start observing the document body
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// Initial replacement for existing ads on page load
document.querySelectorAll("img, iframe, .ad, [class*='ad']").forEach((element) => {
    replaceWithLebronImage(element);
});
