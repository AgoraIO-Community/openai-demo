# Agora x OpenAI Demo

This repository contains a front-end example of a web application that connects users with a conversational AI using Agora's real-time communication technology.

## Overview

This project demonstrates how to create a user interface for interacting with an AI agent through voice communication. It utilizes Agora's SDK to handle the audio streaming between the user and the AI.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed the latest version of [Node.js and npm](https://nodejs.org/)
* You have an Agora account and App ID

## Installation

To install openai-demo, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/AgoraIO-Community/openai-demo
   ```

2. Navigate to the project directory:

   ```bash
   cd openai-demo
   ```

3. Install the dependencies:

   ```bash
    npm install
   ```

## Usage

To run the application locally:

```bash
npm run dev
```

## Token Generator Endpoint

```txt
/api/token.json
```

Body needs to contain channel, role, uid, expireTime.

Example:

```json
{
  "channel": "test",
  "role": "user",
  "uid": "123",
  "expireTime": 45 // minimum for testing
}
```

## Start AI Agent

```text
/api/ai/start.json
```

Body needs to contain channel, uid for the agent.

Example:

```json
{
  "channel": "test",
  "uid": "123"
}
```

The response will contain clientId and credential, that need to be used in the stop AI agent request.

## Stop AI Agent

```text
/api/ai/stop.json
```

Body needs to contain channel, uid, clientId, credential

Example:

```json
{
  "channel": "test",
  "uid": "123",
  "clientId": "34321",
  "credential": "12321"
}
```

The request needs to have "X-Client-ID" header set to the clientId returned from the start AI agent request.

## Notes on Astro with Agora

This project is configured to use in `astro.config.mjs` to run on the server. Astro files are rendered by the server and do not have interactivity client side. However you can use any client side framework to create a interactive experience.

For this project we chose to use React with Agora React SDK. Since it's a video call, the main experience is meant to be interactive, so by using the `client:only="react"` directive, we make sure that the entire video call experience is rendered by React.

The `index.astro` file is the entry point of the app, where the user clicks the "Start Call" button to be redirected to the channel page. The `[channelName].astro` file is the channel page, where the video call takes place. In there we have the React rendered video call component, and from this point it can be treated as a regular React app.

The endpoints are defined in `src/pages/api/` and run on the server.
