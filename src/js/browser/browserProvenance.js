/**
 * captures user actions (provenance) in the Chrome browser.
 * part of the 'browser controller'.
 */

// Pseudo code
// function onTabCreation(newTab) {
//     addNode(newTab);
// }

// function onTabUpdate(tab) {
//     if ('loading') {
			// if (non-redireciton) addNode(tab);
			// else {update existing node}; // redirection
		// }
//     if (title updated) send the new title to historyMapPage.js through an event;
//     if (favIconUrl updated) send the new favIconUrl to historyMapPage.js through an event;
// }

// function addNode(tab) {
//     create a new node with  the information from 'tab';
//     send the new 'node' to historyMapPage.js through an event;
// }

sm.provenance.browser = function() {
	const module = {};

	var nodeId = 0; // can't use tab.id as node id because new url can be opened in the existing tab
	var tab2node = {}; // the Id of the latest node for a given tab
	var tabUrl = {}; // the latest url of a given tabId
	var isTabCompleted = {}; // whether a tab completes loading (for redirection detection).

    // not recording any chrome-specific url
	const ignoredUrls = [
        'chrome://',
        'chrome-extension://',
        'chrome-devtools://',
        'view-source:',
        // 'google.co.uk/url',
        // 'google.com/url',
        'localhost://'
    ],
    bookmarkTypes = [ 'auto_bookmark' ],
    typedTypes = [ 'typed', 'generated', 'keyword', 'keyword_generated' ];

    const dispatch = d3.dispatch('nodeCreated','titleUpdated','favUpdated', 'typeUpdated','urlUpdated');

    onTabUpdate();
	onTabCreation();

	function onTabCreation() {
		chrome.tabs.onCreated.addListener( function(tab) {

			// console.log('newTabEvent -', 'tabId:'+tab.id, ', parent:'+tab.openerTabId, ', url:'+tab.url); // for testing

			if(!isIgnoredTab(tab)) {
				console.log('newTab -', 'tabId:'+tab.id, ', parent:'+tab.openerTabId, ', url:'+tab.url, tab); // for testing

				// tab.title = 'id ' + tab.id + ' - ' + tab.title || tab.url;

				addNode(tab, tab.openerTabId);
				isTabCompleted[tab.id] = false;
			}
		});
	}

    function onTabUpdate() {
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

			if(!isIgnoredTab(tab)) {
				// console.log('tabUpdate - ','tabid:'+tabId, ', parent:'+tab.openerTabId, ', title:'+tab.title, ' changeInfo:', changeInfo); // for testing

				console.log('tab update',tabId,changeInfo,tab);
				// console.log('isComplete',isTabCompleted[tabId],', tab2node',tab2node[tabId]);

				// 'changeInfo' information:
				// - status: 'loading': if (tabCompleted) {create a new node} else {update exisiting node}
				if (changeInfo.status == 'loading' && tab.url != tabUrl[tabId]) {
					// console.log('urlChange -','tabId:'+tabId, ', parent:'+tab.openerTabId,', url:'+tab.url,); // for testing

					if (tab2node[tabId] !== undefined && !isTabCompleted[tabId]) { // redirection
						const titleUpdate = {
							id: tab2node[tab.id],
							text: tab.title || tab.url
						};
						dispatch.titleUpdated(titleUpdate);

						const urlUpdate = {
							id: tab2node[tab.id],
							url: tab.url
						};
						dispatch.urlUpdated(urlUpdate);

						tabUrl[tabId] = tab.url;
					}
					else { // not redirection
						addNode(tab, tab.id);
					}
				}

				// - title: 'page title', {update node title}
				if (changeInfo.title) {

					const titleUpdate = {
						id: tab2node[tab.id],
						text: tab.title
					};

					dispatch.titleUpdated(titleUpdate);
				}

				// - favIconUrl: url, {udpate node favIcon}
				if (changeInfo.favIconUrl) {
					const favUpdate = {
						id: tab2node[tab.id],
						favUrl: tab.favIconUrl,
					};

					dispatch.favUpdated(favUpdate);
				}

				// - status: 'complete', {do nothing}
				if (changeInfo.status == 'complete') {
					isTabCompleted[tabId] = true;
				}
			}
        });
    }

	function addNode(tab,parent) {

		// console.log('addding new node',tab,parent);

		const title = tab.title || tab.url;
		const time = new Date();
		const node = {
			id: nodeId,
			tabId: tab.id,
			time: time,
			url: tab.url,
			text: title,
			favIconUrl: tab.favIconUrl,
			parentTabId:parent,
			from: tab2node[parent]
		};

		tab2node[tab.id] = nodeId;
		tabUrl[tab.id] = tab.url;
		isTabCompleted[tab.id] = false;

		dispatch.nodeCreated(node);

		nodeId++;

		// Update with visit type
		if (tab.url) {
			chrome.history.getVisits({ url: tab.url }, results => {
				// The latest one contains information about the just completely loaded page
				const type = results && results.length ? _.last(results).transition : undefined;

				const typeUpdate = {
					id: tab2node[tab.id],
					type: type
				};

				dispatch.typeUpdated(typeUpdate);
			});
		}
		// else { // when the url is empty
		// 	console.warn('tab.url', tab.url);
		// }
	}

	/* Additional Functions for Checking */

    function isIgnoredTab(tab) {
        return ignoredUrls.some(url => tab.url.includes(url));
    }

    d3.rebind(module, dispatch, 'on'); // what's this?
    return module;
};