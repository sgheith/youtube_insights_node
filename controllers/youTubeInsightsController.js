const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');
const ytdl = require('ytdl-core-discord');
const openai = require('../config/openaiConfig')

const genarateYouTubeInsights = async (link, not_english) => {

    const filePath = await youtubeAudioDownloader(link)

    console.log(filePath)

    const transcriptFilename = await generateTranscription(filePath, not_english)

    console.log(transcriptFilename)
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

const generateTranscription = async (audio_file, not_english = false) => {

    // Verify the audio file exists
    if (!fileExists(audio_file)) {
      console.log('Audio file does not exist!');
      return
    }
  
    transcript = ''
  
    // Translate or Transcript
    if (not_english) {
      transcript = await openai.createTranslation(
        fs.createReadStream(audio_file),
        "whisper-1"
      );
    }
    else {
      transcript = await openai.createTranscription(
        fs.createReadStream(audio_file),
        "whisper-1"
      );
    }
  
    console.log(transcript.data.text)
  
    const { name, ext } = path.parse(audio_file);
    const transcriptFilename = `transcript-${name}.txt`;
    const transcriptText = transcript.data.text;
  
    try {
      fs.writeFileSync(transcriptFilename, transcriptText);
      console.log('Transcript file written successfully!');
    } catch (error) {
      console.error('Error writing transcript file:', error);
    }
  
    return transcriptFilename
  }

  function fileExists(filePath) {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

module.exports = { genarateYouTubeInsights }