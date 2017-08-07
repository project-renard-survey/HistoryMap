SenseMap
========

Chrome extension to supporting sensemaking through analytic provenance. SENSEMAP stands for SENSEMaking with Analytic Provenance. Have a look of this paper if you want to find out more about 'analytic provenance': https://kaixu.me/2015/03/16/analytic-provenance-for-sensemaking-a-research-agenda-cga-2015/


Install
-------

There are two ways to install the sensemap in Chrome. It can be installed from the Chrome app shop, and there is a simple user guide here: http://vis4sense.github.io/sensemap/#guide. The second way is to install from the source in github. There are two branches: master and rebuild. 'master' has the same feature set as the chrome store one, whereas the 'rebuild' has a minimal set of functions. The instructions here will allow you to install either: https://developer.chrome.com/extensions/getstarted#unpacked

Testing
-------

The testing is runing in version 0.1.1 using the Jasmine library (https://jasmine.github.io/). This is a free video tutorial about how to use Jasmine: https://www.udacity.com/course/javascript-testing--ud549

We followed this example to make it work with Chrome Extension: https://gist.github.com/stevenqzhang/333fd0b2bca201aabaa40c7b63a74296

To run the test, go the SenseMap ‘Options’ page, and click the ‘jasmine test page’ link. The spec runner page is ‘tests.html’.

