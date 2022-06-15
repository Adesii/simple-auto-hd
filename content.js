(function () {
  document.addEventListener('yt-navigate-finish', function (event) {
    if (location.pathname === '/watch') {
      setTimeout(() => {
        toggleTheaterMode();
        selectPreferredQuality();
      }, 1000)
    }
  });

  var toggleTheaterMode = function () {
    browser.storage.sync.get(['theaterMode'], function (result) {
      updateTheaterMode(result.theaterMode);
    });

    var updateTheaterMode = function (theaterMode) {
      if (theaterMode === undefined) {
        browser.storage.sync.set({ theaterMode: false }, function () { });
      }

      var sizeButton = document.getElementsByClassName('ytp-size-button')[0];
      var sizeButtonHasTheaterModeTitle = sizeButton.getAttribute('title') === 'Theater mode (t)';

      if (theaterMode && sizeButtonHasTheaterModeTitle) {
        sizeButton.click();
      } else if (!theaterMode && !sizeButtonHasTheaterModeTitle) {
        sizeButton.click();
      }
    }
  };

  var selectPreferredQuality = function () {
    var preferredQuality;
    var qualitiesArray = [
      '4320p',
      '4320p60',
      '4320p50',
      '4320p48',
      '2160p',
      '2160p60',
      '2160p50',
      '2160p48',
      '1440p',
      '1440p60',
      '1440p50',
      '1440p48',
      '1080p',
      '1080p60',
      '1080p50',
      '1080p48',
      '720p',
      '720p60',
      '720p50',
      '720p48',
      '480p',
      '360p',
      '240p',
      '144p',
      'Auto'
    ];
    try {
      browser.storage.sync.get(['preferredQuality'], function (result) {
        updateQuality(result.preferredQuality);
      });

    } catch (error) {
      console.log(error);
      updateQuality();
    }

    var updateQuality = function (preferredQuality) {
      if (preferredQuality === undefined) {
        preferredQuality = 'best-available';
        chrome.storage.sync.set({ preferredQuality: preferredQuality }, function () { });
      }

      var settingsButton = document.getElementsByClassName('ytp-settings-button')[0];

      settingsButton.click();

      var buttons = document.getElementsByClassName('ytp-menuitem-label');

      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].innerHTML === 'Quality') {
          buttons[i].click();
        }
      }

      var targetItem;

      if (preferredQuality === 'best-available') {
        targetItem = document.querySelector('.ytp-quality-menu .ytp-menuitem-label');
      } else {
        var targetItems = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label');

        var loopCounter = 0;

        function findTargetItem() {
          for (var i = 0; i < targetItems.length; i++) {
            var potentialTargetItem = targetItems[i].childNodes[0].childNodes[0];

            var quality = potentialTargetItem.innerHTML.split(' ')[0];

            if (quality === preferredQuality) {
              targetItem = potentialTargetItem;
            }
          }

          if (targetItem === undefined && loopCounter < 10) {
            var key = qualitiesArray.indexOf(preferredQuality);
            preferredQuality = qualitiesArray[key + 1];

            loopCounter++;
            //targetItem = findTargetItem();
            //console.log(targetItem);
            return findTargetItem();
          }
          /* loopCounter = 0;
          if (targetItem === undefined && loopCounter < 10) {
            var key = qualitiesArray.indexOf(preferredQuality);
            preferredQuality = qualitiesArray[key - 1];

            loopCounter++;

            return findTargetItem();
          } */

          return targetItem;
        }

        targetItem = findTargetItem();
      }

      targetItem.click();

      var tooltip = document.querySelector(".ytp-tooltip");
      var parent = tooltip.parentElement;
      parent.removeChild(tooltip);
      function ReenableTooltipAfterDelay(tooltipelement, parent) {
        setTimeout(function () {
          parent.appendChild(tooltipelement);
        }, 4000);

      }

      ReenableTooltipAfterDelay(tooltip, parent);


    }
  };

  browser.storage.onChanged.addListener(function (changes, namespace) {
    for (key in changes) {
      if (key === 'theaterMode') {
        toggleTheaterMode();
      } else if (key === 'preferredQuality') {
        selectPreferredQuality();
      }
    }
  });
})();

