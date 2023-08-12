const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');
const ytdl = require('ytdl-core-discord');
const openai = require('../config/openaiConfig')

const genarateYouTubeInsights = async (req, res) => {

  const filePath = await youtubeAudioDownloader(req.body.link)

  //console.log(filePath)

  const transcriptFilename = await generateTranscription(filePath, req.body.not_english)

  //console.log(transcriptFilename)

  //transcriptFilename = 'transcript-Do We Have Free Will  Robert Sapolsky & Andrew Huberman.txt'
  //transcriptFilename = 'transcript-Three-Layer Architecture Pattern  Spring Boot Application Three-Layer Architecture.txt'
  const insights = await generateInsights(transcriptFilename)

  //console.log(insights)

  res.status(200).json({
    insights: insights
  })
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

  //console.log(transcript.data.text)

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

const generateInsights = async (transcript_filename) => {

  // Validates Transcript file exists
  if (!fileExists(transcript_filename)) {
    console.log('Transcript file does not exist!');
    return
  }

  let transcript_text = '';

  // Read transcript text from the file
  try {

    const data = fs.readFileSync(transcript_filename, 'utf8');

    transcript_text = data.toString();

  } catch (error) {

    console.error('Error reading file:', error);

    return
  }

  system_prompt = `You are the insightful AI assistant. 
                      Please analyze the following YouTube content and provide important keywords and main topics covered.

                      YouTube Content: ${transcript_text}
    `

  prompt = `Please generate the output EXACTLY in this JSON format:
                      {
                          "keywords": [
                              "First Keyword",
                      …
                              "Last Keyword"
                          ],
                          "topics": [
                              {
                                  "title": "First Topic Title",
                                  "description": "First Topic Description"
                              },
                      …
                              {
                                  "title": "Last Topic Title",
                                  "description": "Last Topic Description"
                              }
                          ]
                      }
    `

  //console.log(prompt)

  messages = [
    { 'role': 'system', 'content': system_prompt },
    { 'role': 'user', 'content': prompt }
  ]

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 1,
    max_tokens: 2048,
  })

  console.log(response.data.choices[0].message.content)

  insights = response.data.choices[0].message.content

  return JSON.parse(insights)
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