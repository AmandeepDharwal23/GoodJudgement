# GoodJudgement - Interactive Forecast Widget

An embeddable interactive forecast widget inspired by [Good Judgement Open](https://www.gjopen.com/), designed for Webflow and other websites.

## Files

| File | Purpose |
|------|---------|
| `forecast-embed-webflow.html` | **Single-file embed** - Copy/paste into Webflow's Embed element |
| `forecast-embed.js` | Standalone JS module (for non-Webflow sites) |
| `forecast-widget.html` | Local preview page (open in browser to test) |

## How to Add to Your Webflow Site

### Step 1: Open Webflow Designer
Open your page (e.g., `fixing-ontarios-infrastructure-cracks`) in the Webflow Designer.

### Step 2: Add an Embed Element
1. In the left panel, click **Add Elements** (`+` icon)
2. Scroll to **Components** and drag an **Embed** element to where you want the forecasts (e.g., after your article content)
3. The HTML Embed Code Editor will open

### Step 3: Paste the Code
1. Open `forecast-embed-webflow.html`
2. Copy the **entire** contents
3. Paste into the Webflow HTML Embed Code Editor
4. Click **Save & Close**

### Step 4: Customize Questions
Edit the `questions` array in the script to add your own questions:

```javascript
{
  id: 'unique-id',           // Unique identifier for localStorage
  question: 'Your question text here?',
  deadline: 'Before 1 Jan 2027',  // Deadline label
  options: ['Yes', 'No'],         // 2, 3, or more options
  context: 'Optional background context...'
}
```

### Step 5: Publish
Click **Publish** in Webflow to push changes live.

## Question Types Supported

- **Yes/No** - Binary forecast questions
- **Yes/No/Uncertain** - Three-option questions
- **Multiple Choice** - Up to 5+ options with colored bars

## Features

- Animated result bars (Good Judgement style)
- Vote tracking via localStorage (per-browser)
- "Change" button to update your forecast
- Mobile responsive
- Zero dependencies - pure HTML/CSS/JS
- Dark header with light body card design

## Limitations

- **No shared backend** - Votes are stored in each user's browser via localStorage. Each visitor only sees their own vote, not aggregated community data.
- To add real community aggregation, you would need to connect to a backend service (Firebase, Supabase, or a custom API).

## Local Preview

Open `forecast-widget.html` in your browser to preview all four sample questions.
