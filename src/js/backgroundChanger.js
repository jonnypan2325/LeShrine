// backgroundChanger.js
document.addEventListener("DOMContentLoaded", () => {
    const backgrounds = {
        Sunday: "../../media/image/backgrounds/leResting.jpg",
        Monday: "../../media/image/backgrounds/leJrSmith.jpg",
        Tuesday: "../../media/image/backgrounds/leTuesday.jpg",
        Wednesday: "../../media/image/backgrounds/leWin.jpg",
        Thursday: "../../media/image/backgrounds/leJrSmith.jpg",
        Friday: "../../media/image/backgrounds/leYes.jpg",
        Saturday: "../../media/image/backgrounds/leResting.jpg"
    };

    const today = new Date();
    const dayName = today.toLocaleString('en-US', { weekday: 'long' });
    
    //Simulate a specific day for testing
    //const dayName = "Wednesday";

    console.log(`Current day: ${dayName}`);


    // Set the background image for the day
    document.body.style.backgroundImage = `url('${backgrounds[dayName]}')`;
    console.log(`Background image set to: url('${backgrounds[dayName]}')`);
    
    // Scaling effect for background
    document.body.style.backgroundSize = "100vw 100vh"; 
    document.body.style.backgroundRepeat = "no-repeat"; 
    document.body.style.backgroundPosition = "center center";
});
