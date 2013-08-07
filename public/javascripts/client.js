$(function() {
	var SERVER = 'localhost:3000';
	var Piano = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(window.TEMPORARY, 5*1024*1024, initFS, errorHandler);
	function initFS(fs) {
		createDir(fs.root, 'sounds/piano/'.split('/'));
		fs.root.getDirectory('sounds', {}, function(dirEntry){
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
 			}, errorHandler);
		}, errorHandler);
	}
	function errorHandler(err){
		var msg = 'An error occured: ';
		switch (err.code) { 
			case FileError.NOT_FOUND_ERR: 
			msg += 'File or directory not found'; 
			break;

			case FileError.NOT_READABLE_ERR: 
			msg += 'File or directory not readable'; 
			break;

			case FileError.PATH_EXISTS_ERR: 
			msg += 'File or directory already exists'; 
			break;

			case FileError.TYPE_MISMATCH_ERR: 
			msg += 'Invalid filetype'; 
			break;

			default:
			msg += 'Unknown Error'; 
			break;
		};
		console.log(msg);
	};
	function createDir(rootDir, folders) {
		rootDir.getDirectory(folders[0], {create: true}, function(dirEntry) {
			if (folders.length) {
				createDir(dirEntry, folders.slice(1));
			}
		}, errorHandler);
	};

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