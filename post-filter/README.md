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

2. Once **Tampermonkey** is installed, click [here](https://raw.githubusercontent.com/driversti/erepX/main/post-filter/post_filter.userscript.js) to install the eRepublik Post Filter script.

3. **Tampermonkey** should automatically detect the script and open the installation page. 
Click **Install** to finish installing the script.

_Note._ In case **Tampermonkey** doesn't recognize the script automatically, 
you can install it manually by following these steps:

- Right-click on the link to the script and choose "**Save Link As...**" to download the script to your computer.

- Open **Tampermonkey** in your browser and click on the **Dashboard**.

- In the dashboard, click on the **+** tab to create a new script.

- Delete any content in the editor, then open the script file you downloaded in a text editor such as **Notepad** or **TextEdit**.

- Copy all of the content from the script file, then go back to **Tampermonkey** and paste it into the editor.

- Click **File > Save** or press **CTRL+S** to save the script. 
- Now the script is installed and should appear in your list of userscripts in **Tampermonkey**.

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
