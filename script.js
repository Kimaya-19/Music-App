console.log('Let\'s write JavaScript');
let currentSong = new Audio();
let currFolder;
const play = document.querySelector("#play");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}
// Function to fetch songs from a folder
async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(` 'Your Current App Running Local Host Address URL'${currFolder}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        let songs = Array.from(as)
            .map(element => element.href.split(`/${currFolder}/`).pop())
            .filter(href => href.endsWith(".mp3"));

        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = songs.map(song => `
            <li>
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Kimaya</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="playNow">
                </div>
            </li>
        `).join("");
        // Attach event listener to each song
        Array.from(songUL.getElementsByTagName("li")).forEach(li => {
            li.addEventListener("click", () => {
                playMusic(li.querySelector(".info div:first-child").textContent.trim());
            });
        });
        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}
// Function to play music
const playMusic = (track) => {
    currentSong.src = `/${currFolder}/` + track;
    if (currentSong.paused) {
        currentSong.play();
        play.src = "pause.svg";
    } else {
        currentSong.pause();
        play.src = "play.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
// Function to display albums
async function displayAlbums() {
    try {
        let response = await fetch(`/songs/`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        Array.from(anchors).forEach(async e => {
            if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0];
                let infoResponse = await fetch(`/songs/${folder}/info.json`);
                if (!infoResponse.ok) {
                    throw new Error(`HTTP error! Status: ${infoResponse.status}`);
                }
                let infoData = await infoResponse.json();

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                        <img src="play.svg" alt="Play">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${infoData.title}</h2>
                        <p>${infoData.description}</p>
                    </div>
                `;
            }
        });
        // Attach event listeners to cards
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async () => {
                await getSongs(`songs/${card.dataset.folder}`);
            });
        });

    } catch (error) {
        console.error('Error fetching album data:', error);
    }
}
// Main function
async function main() {
    try {
        let songs = await getSongs("songs/cs");
        playMusic(songs[0]);
        await displayAlbums();
        // Event listener for play/pause button
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "pause.svg";
            } else {
                currentSong.pause();
                play.src = "play.svg";
            }
        });
        // Event listener for previous button
        previous.addEventListener("click", () => {
            let index = songs.indexOf(currentSong.src.split("/").pop());
            if (index > 0) {
                playMusic(songs[index - 1]);
            }
        });
        // Event listener for next button
        next.addEventListener("click", () => {
            let index = songs.indexOf(currentSong.src.split("/").pop());
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
            }
        });
        // Timeupdate event listener
        currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
        });
        // Seekbar event listener
        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = `${percent}%`;
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        });
        // Event listener for hamburger menu
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        });
        // Event listener for close button
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-150%";
        });
        // Event listener for volume control
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
        });
    } catch (error) {
        console.error('Error in main:', error);
    }
    document.querySelector(".volume>img").addEventListener("click",e=>{
console.log(e.target)
if(e.target.src.includes("volume.svg")){
    e.target.src=e.target.src.replaceAll("volume.svg","mute.svg")
    currentSong.volume=0
    document.querySelector(".range").getElementsByTagName("input")[0].value=0
}
else{
    e.target.src=e.target.src.replaceAll("mute.svg","volume.svg")
    currentSong.volume=0.1
        document.querySelector(".range").getElementsByTagName("input")[0].value=10
}
    })
}

// Start the application
main();
