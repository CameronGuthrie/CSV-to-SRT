// Import required libraries
const fs = require('fs');
const csv = require('csv-parser');

// File paths
const CSV_FILE_PATH = process.env.CSV;
const SRT_FILE_PATH = process.env.SRT || 'output.srt';

// Hold subtitle data
let subtitles = [];

// How long should they stay on the screen?
const subLength = process.env.LEN || '00:00:04';

// Parse the CSV file
fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (row) => {
        subtitles.push({
            timestamp: row.timestamp,
            heading: row.heading,
            text: row.text
        });
    })
    .on('end', () => {
        // Convert the CSV data to SRT format and write it to disk
        const srtContent = convertToSrtFormat(subtitles);
        fs.writeFileSync(SRT_FILE_PATH, srtContent, 'utf8');
        console.log('SRT file has been created successfully.');
    });

// Function to take in two timestamps and add them
function formatTime(timestamp1, timestamp2) {
    // Split the timestamps into components
    let [hours1, minutes1, seconds1] = timestamp1.split(':').map(Number);
    let [hours2, minutes2, seconds2] = timestamp2.split(':').map(Number);

    // Convert everything to seconds for easy addition
    let timeInSeconds1 = hours1 * 3600 + minutes1 * 60 + seconds1;
    let timeInSeconds2 = hours2 * 3600 + minutes2 * 60 + seconds2;
    let totalSeconds = timeInSeconds1 + timeInSeconds2;

    // Convert the result back into hours, minutes, and seconds
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
    let seconds = totalSeconds - (hours * 3600) - (minutes * 60);

    // Pad with zeroes if necessary
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
}

/**
 *  Function to compare timestamps
 */
function compareTimeStamps(timeStamp1, timeStamp2) {
    // Split the timestamps into components
    let [hours1, minutes1, seconds1] = timeStamp1.split(':').map(Number);
    let [hours2, minutes2, seconds2] = timeStamp2.split(':').map(Number);

    // Convert everything to seconds for easy comparison
    let timeInSeconds1 = hours1 * 3600 + minutes1 * 60 + seconds1;
    let timeInSeconds2 = hours2 * 3600 + minutes2 * 60 + seconds2;

    // Compare the times in seconds and return the result
    return timeInSeconds1 >= timeInSeconds2
}
  
/**
 * Function to convert an array of subtitle objects into SRT format
 */
function convertToSrtFormat(subtitles) {
    return subtitles.map((subtitle, index) => {
        subTime = formatTime(subtitle.timestamp, subLength)

        const endTime = subtitles[index + 1] ? (compareTimeStamps(subTime, subtitles[index + 1].timestamp) ? subtitles[index + 1].timestamp : subTime ) : subTime;

        return `${index + 1}\n${subtitle.timestamp}:00 --> ${endTime}:00\n${subtitle.heading}\n${subtitle.text}\n`;
    }).join('\n');
}
