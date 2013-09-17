$(function() {
    var SERVER = 'localhost:3000';

    var log = console.log.bind(console);

    var Instruments = {
        'Piano': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
    }

    window.lookupTable = {};

    function printTable() {
        console.log(window.lookupTable);
    }

    var FileCacher = {
        requestFileSystem: window.requestFileSystem || window.webkitRequestFileSystem,
        init: function () {
            this.requestFileSystem.call(window, window.TEMPORARY, 5*1024*1024, this.onInitFs, this.errorHandler);
        },
        onInitFs: function(fs) {
            var self = FileCacher;
            for (instrument in Instruments) {
                var keys = Instruments[instrument],
                    dirPath = "sounds/" + instrument.toLowerCase() + "/";
                self.createDir(fs.root, dirPath.split("/"));
                for (key in keys) {
                    var url = "sounds/" + instrument + "/" + keys[key];
                    self.getFile(fs, url, dirPath, keys[key], printTable);
                }
            }
        },
        getFile: function(fs, url, dirPath, id, callback) {
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
                    }, this.errorHandler);
                }, this.errorHandler);
            }

            xhr.send();
        },
        createDir: function (rootDir, folders) {
            var self = this;
            rootDir.getDirectory(folders[0], {create: true}, function(dirEntry) {
                if (folders.length) {
                    self.createDir(dirEntry, folders.slice(1));
                }
            }, self.errorHandler);
        },
        readDirectoryContents: function(fs) {
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
                }, this.errorHandler);
            }, this.errorHandler);
        },
        errorHandler: function (e) {
            log("Filesystem error: ", e);
        }
    }

    FileCacher.init();

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