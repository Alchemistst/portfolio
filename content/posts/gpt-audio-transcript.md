---
title: "[NDN] Transcript audio to text using OpenAI Whisper"
date: 2024-06-30T00:57:02+02:00
draft: false
toc: false
images:
tags:
  - Nightly Dev Notes
---

Hi there 👽!

In this article I wanted to do a quick demonstration on how to integrate with **OpenAI Whipser** model to transcript an audio file, using **Typescript** and **ffmpeg**.

In my [repo](https://github.com/Alchemistst/gpt-audio-transcript) you have the full code of the script that I made for this article, as well as instructions on how to use it as is.

Let's get started!

## OpenAI integration
I decided to integrate with OpenAI using a HTTP client (axios in this case) directly.
The way you have to structure the request is not too complicated, but you must pay attention to a couple of details:
1. It has to be a POST operation to `https://api.openai.com/v1/audio/transcriptions`
2. The body *Content Type* has to be of type `multipart/form-data` and has to have the following fields:
    * `model`: which specifies the model to use.
    * `file`: expects a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) of your audio.
    * `language`: not required, but I had the best results when sending it. Must follow the [ISO-639](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) standard.
3. As authorization headers, you must pass your OpenAI API key.
Here's the code for just the OpenAI integration:
```Typescript
 const formData = new FormData();
  formData.append(
    "file",
    new Blob([await fs.promises.readFile(filePath)]),
    filePath.replace(outputDirectory, "")
  );
  formData.append("model", "whisper-1");
  formData.append("language", language);

  try {
    const response = await axios.post(speechToTextAPI, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data.text;
  } catch (error) {
    console.error(`Error transcribing ${filePath}:`, error);
    return null;
  }
```

This is by no means an exhaustive description of all the API's capabilities. Find more info of all its potential [here](https://platform.openai.com/docs/guides/speech-to-text).


## Audio file processing
Okay, so we already know how to integrate with OpenAI to send our audio and get its transcription. But now we need a way to get the audio from our computer, load it to the script, and then get the results. Easy, right?

Well... There are a couple of caveats. 

First, the aforementioned endpoint **can only process chunks of 5 min of audio**, so if we want to transcript a longer audio, we'll need to chop the audio first in chunks no longer than 5 min. 

For this task I decided to use `fluent-ffmpeg`, a Typescrypt wrapper for ffmpeg, to process audio. The problem here is that, the way ffmpeg chops and process de audio in parallel, doesn't ensure the order of the chops will be maintained. 

Plus, as soon as each chop is loaded, it will call OpenAI to get its transcription, and this is also an *asynchronous operation*, meaning that some requests may take more time than others, messing even more with the order of the chops.

In order to get a coherent transcription, we have to get a reference to the order in which the chops need to be, then send that to OpenAI without loosing these references, so that when we get all the responses from all the audio chops, we can place them back together in the original order and the transcription makes sense.

So, this was my solution:
```Typescript
const inputFileName = path.basename(filePath, path.extname(filePath));
  Ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
      console.error("Error getting metadata:", err);
      return;
    }

    const totalDuration = metadata.format.duration ?? 0;
    const numberOfSegments = Math.ceil(totalDuration / duration);

    let transcript = new Map<number, string>();

    const finishCallback = () => {
      const outputFileName = path.join(outputDir, `${inputFileName}.txt`);
      let output = "";
      for (let i = 0; i < numberOfSegments; i++) {
        output = `${output} ${transcript.get(i)}`;
      }
      fs.writeFileSync(outputFileName, output);
      console.log("Transcript saved to " + outputFileName);
    };

    let finishCount = 0;
    for (let i = 0; i < numberOfSegments; i++) {
      const startTime = i * duration;
      const outputFileName = path.join(
        outputDir,
        `${inputFileName}_part_${i + 1}.mp3`
      );
      Ffmpeg(filePath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputFileName)
        .on("end", async () => {
          const partialTranscript = await sendToSpeechToText(outputFileName);
          if (partialTranscript) {
            transcript.set(i, partialTranscript);
          }
          finishCount++;
          if (finishCount === numberOfSegments) {
            finishCallback();
          }
        })
        .on("error", (err) => {
          console.error("Error processing segment:", err);
        })
        .run();
    }
  });
```
To solve the problem of asynchronicity (if that's even word), we calculate first the `numberOfSegments` the audio is going to result. Then, the audio gets chopped in that many segments, and every time a chop is processed, we store its position `i` and its transcription in the `transcript` map. 

After all this, we increase the `finishCount` variable, and if it is less than the `numberOfSegments` that means that we are still waiting for some of the audio files to get processed.
But, if `finishCount` it's equal to `numberOfSegments`, that means that all the chops where processed and we are ready to put everything together.

And that's what we do in `finishCallback()`, we access all the keys in order, joining all the partial transcripts. 

Hooray! We have our transcript! 🥳

## Conclusion
As you have seen, interacting with OpenAI API and process audio wasn't that difficult, was it? 

For sure this script has a lot of room for optimization. For instance, chopping the audio with this method creates little artifacts on the audio files, that show on the transcript as a result, due to being cut off in the middle of a sentence or word. This could be fixed trying to align the chops with silences in the audio (still not perfect, but might be an improvement).

In any case, I hope you have found this post useful or inspiring to go out there and get coding.

For now, this is all.
Signing out...
