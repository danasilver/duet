exports.serve = function(req, res) {
	var soundid = req.params.soundid;
	var instrument = req.params.instrument;
	res.sendfile('./public/sounds/' + instrument + "/" + soundid + ".mp3");
}