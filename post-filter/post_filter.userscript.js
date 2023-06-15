// ==UserScript==
// @name         eRepublik Post Filter
// @version      1.0
// @description  try to take over the world!
// @author       driversti https://www.erepublik.com/en/citizen/profile/4690052
// @updateURL    https://raw.githubusercontent.com/driversti/erepX/main/post-filter/post_filter.userscript.js
// @downloadURL  https://raw.githubusercontent.com/driversti/erepX/main/post-filter/post_filter.userscript.js
// @match        https://www.erepublik.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erepublik.com
// @grant        none
// ==/UserScript==


(function () {
  'use strict';

  const bannedWords = [
    "wordle","Congratulations, you entered the Top 100"
  ]; // Add the words you want to filter out.

  function filterPosts() {
    $(".postContainer").each(function () {
      if ($(this).hasClass('autoPost')) {
        $(this).remove(); // Remove the auto post from the DOM
      } else {
        let postContent = $(this).find(".contentMessage").text().toLowerCase(); // get the post content and make it lower case
        for (let word of bannedWords) {
          if (postContent.includes(word.toLowerCase())) {
            $(this).remove(); // Remove the post from the DOM if it includes any banned word
            break;
          }
        }
      }
    });
  }

  $(window).on("load", function () {
    filterPosts(); // Initial filtering

    let observer = new MutationObserver(filterPosts);

    // configuration of the observer:
    let config = {childList: true, subtree: true};

    // pass in the target node, as well as the observer options
    let targetNode = document.querySelector(".postsWrapper");
    if (targetNode) {
      observer.observe(targetNode, config);
    } else {
      console.log("Could not find target node for MutationObserver");
    }
  });
})();
