# Post Filter Userscript

This script is a post filter for **eRepublik** game. 
It works by filtering out and removing any post from the game's news feed that contains certain predefined words. 
The script also removes any auto-generated posts, as these are often uninteresting or unnecessary.

## Installation
1. Install **Tampermonkey** extension for your browser:

    [Chrome, Brave](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
    
    [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
    
    [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)
    
    [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
    
    [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)

2. Once **Tampermonkey** is installed, click [here](post_filter.userscript.js) to install the eRepublik Post Filter script.

3. **Tampermonkey** should automatically detect the script and open the installation page. 
Click Install to finish installing the script.

## Configuration
The script uses an array of banned words to filter posts. You can modify this array to suit your needs.

1. To add or remove words from the array, click on the **Tampermonkey** extension icon in your browser, 
and then click Dashboard.
2. In the dashboard, you will see a list of installed scripts. Find **eRepublik Post Filter** 
and click on the edit (pencil) icon next to it.
3. In the editor, look for the _bannedWords_ array near the top of the script. 
You can add or remove words from this array. Remember to keep the words surrounded by quotes, 
and separate multiple words with commas.
```javascript
// Example

const bannedWords = [
  "wordle",
  "Congratulations, you entered the Top 100", // Add new words like this
  "Releasethe Krakken" // And like this
]; 
```

## Feedback & Support
If you have any feedback, suggestions for improvements, or need help with the script, 
you're welcome to join our [Telegram chat](https://t.me/+2dQbYxlfJjdkOGMy).


## Donate
[Click](https://www.erepublik.com/en/economy/donate-money/4690052)
