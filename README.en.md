# ReadingMarker

[中文](README.md) | English

A reading progress marker for iPhone/iPad Safari.

It is designed to solve a common problem when reading long works on mobile, especially on AO3 and FC2 blogs: if you refresh the page or switch apps by accident, the page may jump back to the top and you lose your reading position.

---

## Features

- **AO3 support**: Uses the work ID to store progress accurately.
- **FC2 support**: Works with different subdomains automatically.
- **Status indicators**:
  - **■ button**: Saves the current scroll position. Long-press to clear the saved position.
  - **▶ button**: Turns dark when a saved position exists, and stays gray when no saved position is available.
- **The UI follows your system language.**

## Requirements

1. Install [Stay for Safari](https://apps.apple.com/tw/app/stay-for-safari-%E4%BD%BF%E7%94%A8%E8%80%85%E8%85%B3%E6%9C%AC%E8%88%87%E5%BB%A3%E5%91%8A%E6%94%94%E6%88%AA%E6%93%B4%E5%85%85/id1591620171)
2. Open the Stay app, tap the **+** button in the top-right corner, choose **Import via Link**, and add this userscript URL:

    ``` text
    https://raw.githubusercontent.com/rye1014/ReadingMarker/main/reading-marker.user.js
   ```

3. Go to Settings -> Safari -> Extensions and make sure Stay is enabled

---

## Usage

1. **Tap the ■ button**: Save your current reading position.
2. **Long-press the ■ button**: Clear the saved reading position for this page.
3. **While scrolling**: Only the ■ button is shown.
4. **After scrolling stops**: Both buttons expand automatically. Tap outside the button area to collapse or expand the panel.
5. **Tap the ▶ button**: Jump back to the last saved position.

---

## Preview

<img src="images/preview.jpg" width="320" alt="Preview">

---

<details>
<summary><h2> Changelog </h2></summary>

### [v1.2.1] - 2026-06-20

- Added English localization for the userscript and README.
- Added bilingual metadata and usage instructions.

### [v1.2.0] - 2026-06-20

- Added automatic collapse while reading and auto-expand after scrolling stops.
- Clicking outside the button area now toggles the collapsed/expanded state.

### [v1.1.1] - 2026-06-07

- Fixed a bug where `isLongPressed` could remain stuck after a long-press clear action, preventing subsequent short-press marking.

### [v1.1.0] - 2026-06-07

- Added long-press support to clear the saved reading position.

### [v1.0.0] - 2026-06-07

- Initial release with support for AO3 and FC2 blogs, plus basic scroll position saving and jumping.

</details>