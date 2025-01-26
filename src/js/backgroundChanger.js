// backgroundChanger.js
document.addEventListener("DOMContentLoaded", () => {
    const backgrounds = {
        Sunday: "media/image/leJrSmith.jpg",
        Monday: "media/image/leJrSmith.jpg",
        Tuesday: "media/image/leTuesday.jpg",
        Wednesday: "media/image/leJrSmith.jpg",
        Thursday: "media/image/leJrSmith.jpg",
        Friday: "media/image/leJrSmith.jpg",
        Saturday: "media/image/leJrSmith.jpg"
    };

    const today = new Date();
    const dayName = today.toLocaleString('en-US', { weekday: 'long' });
    document.body.classList.add(dayName.toLowerCase()); // Apply day as class
});
