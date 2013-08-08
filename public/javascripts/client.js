$(function() {
	var SERVER = 'localhost:3000';

	var Instruments = {
		'Piano': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
	}

	window.lookupTable = {};

	function onError(e) {
		console.log('Error:', e);
	}

	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

	function getFile(url, id) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';

		xhr.onload = function(e) {
			window.requestFileSystem(TEMPORARY, 1024*1024*5, function(fs) {
				fs.root.getFile(id + ".mp3", {create: true}, function(fileEntry) {
					fileEntry.createWriter(function(writer) {
						writer.onwrite = function (e) {
							console.log(readDirectoryContents(fs));
							console.log(fileEntry.toURL());
						}
						writer.onerror = function (e) {
							onError(e);
						}

						var blob = new Blob([xhr.response], {type: 'audio/mp3'});

						writer.write(blob);
					}, onError);
				}, onError);
			}, onError);
		}

		xhr.send();
	}

	function readDirectoryContents(fs) {
		fs.root.getDirectory('sounds/', {create: false}, function(dirEntry){
			var dirReader = dirEntry.createReader();
  			dirReader.readEntries(function(entries) {
  				for(var i = 0; i < entries.length; i++) {
    				var entry = entries[i];
      				if (entry.isDirectory){
      					console.log('Directory: ' + entry.fullPath);
        			}
    				else if (entry.isFile){
						console.log('File: ' + entry.fullPath);
					}
    			}
 			}, onError);
		}, onError);
	}	

	// Create multilevel directory
	function createDir(rootDir, folders) {
		rootDir.getDirectory(folders[0], {create: true}, function(dirEntry) {
			if (folders.length) {
				createDir(dirEntry, folders.slice(1));
			}
		}, onError);
	};

	getFile('sounds/piano/A4', 'A4');

	var Keys = {
		'a': 97,
		's': 115,
		'd': 100,
		'f': 102,
		'j': 106,
		'k': 107,
		'l': 108,
		'semi': 186
	};
	$(window).keydown(function(e) {
		var keyCode = (e.keyCode ? e.keyCode : e.which);
		if ((keyCode < 97) && (keyCode >= 65)) keyCode += 32;
		for (key in Keys) {
			if (Keys[key] === keyCode) {
				var classKey = key; // added so setTimeout works
				if ($("." + classKey).hasClass("smooth-move")) $("." + classKey).removeClass("smooth-move");
				$("." + classKey).addClass("key-shadow");
				setTimeout(function() {
					$("." + classKey).addClass("smooth-move").removeClass("key-shadow");
				}, 500);
			}
		}
	});
});