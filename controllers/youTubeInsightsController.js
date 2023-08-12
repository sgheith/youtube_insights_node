const fs = require('fs');
const sanitize = require('sanitize-filename');
const ytdl = require('ytdl-core-discord');
const openai = require('../config/openaiConfig')

const genarateYouTubeInsights = async (link, not_english) => {

    const filePath = await youtubeAudioDownloader(link)

    console.log(filePath)

}

const youtubeAudioDownloader = async (link) => {

    // Verify a valid youtube link
    if (!link.includes('youtube.com')) {
        console.log('Invalid YouTube link!');
        return false;
    }

    try {


        // Obtain video information
        const info = await ytdl.getInfo(link);

        // Just download the audio
        const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });

        // Save as <video_title>.mp3, sanitize to make sure the title doesn't have illegal characters
        const outputFilePath = `./${sanitize(info.videoDetails.title)}.mp3`;
        
        console.log('Downloading the audio stream ...');

        // Create download streem
        const stream = ytdl.downloadFromInfo(info, { filter: 'audioonly' });

        // Open output file stream
        const writeStream = fs.createWriteStream(outputFilePath);

        // Connect the two streams
        stream.pipe(writeStream);

        // Create a new Promise function to listen on the finish and error events
        return new Promise((resolve, reject) => {

            // Listen on finish event 
            writeStream.on('finish', () => {

                console.log('\nDownload complete!');

                // Promised resolved (success)
                resolve(outputFilePath);
            });

            // Listen on finish event 
            writeStream.on('error', (error) => {

                console.error('Error downloading the file!', error);

                // Promised rejected (error)
                reject(error);
            });

        });

    } catch (error) {
        console.error('Error:', error.message);
        return false;
    }
}


module.exports = { genarateYouTubeInsights }