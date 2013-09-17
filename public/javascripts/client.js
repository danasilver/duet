$(function() {
    var SERVER = 'localhost:3000';

    var Instruments = {
        'Piano': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
    }

    window.lookupTable = {};

    // Filesystem
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

    window.requestFileSystem(window.TEMPORARY, 5*1024*1024, onInitFs, onError);

    function onInitFs(fs) {
        for (instrument in Instruments) {
            var keys = Instruments[instrument],
                dirPath = "sounds/" + instrument.toLowerCase() + "/";
            createDir(fs.root, dirPath.split("/"));
            for (key in keys) {
                var url = "sounds/" + instrument + "/" + keys[key];
                getFile(fs, url, dirPath, keys[key], printTable);
            }
        }
    }

    function getFile(fs, url, dirPath, id, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function(e) {
            fs.root.getFile(dirPath + id + ".mp3", {create: true}, function(fileEntry) {
                fileEntry.createWriter(function(writer) {
                    writer.onwrite = function (e) {
                        window.lookupTable[id] = fileEntry.toURL();
                        callback();
                    }
                    writer.onerror = function (e) {
                        onError(e);
                    }

                    var blob = new Blob([xhr.response], {type: 'audio/mp3'});

                    writer.write(blob);
                }, onError);
            }, onError);
        }

        xhr.send();
    }

    function printTable() {
        console.log(window.lookupTable);
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

    function createDir(rootDir, folders) {
        rootDir.getDirectory(folders[0], {create: true}, function(dirEntry) {
            if (folders.length) {
                createDir(dirEntry, folders.slice(1));
            }
        }, onError);
    };

    function onError(e) {
        console.log('Error:', e);
    }

    //getFile('sounds/piano/A4', 'A4');

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