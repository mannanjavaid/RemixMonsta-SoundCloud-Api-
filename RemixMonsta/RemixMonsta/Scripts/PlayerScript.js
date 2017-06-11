var DEFAULT_PAGE_SIZE = 100;
var one_day = 1000 * 60 * 60 * 24;
var playList = [];
var randomPlayList = [];
var trackList = [];
var randomTrackList = [];
var searchList = [];
var currentTrack;
var player;
var listRefreshTime;
var isSearch = false;
var isRandomPlay = false;
var isPlaylist = false;
var isRandomPlayList = false;

SC.initialize({
    client_id: '4af6a761ec1726ad9b2e0e2397fe898a'
});
if (localStorage.getItem('playlist')) {
    playList = JSON.parse(localStorage.getItem("playlist"));
}

getTrack("House", DEFAULT_PAGE_SIZE);
console.log(trackList);
var date = new Date().getTime();
var current = new Date(date);
var difference_ms = new Date() - current;

// Convert back to days and return
var difference = Math.round(difference_ms / one_day);



// this fuction check if song already in playlist
function checkIfTrackAlreadyInPlayList(track) {
    if (playList == null) { return false; }
    var index = getIndexFromPlayListByid(track.id);
    if (index >= 0)
        return true;
    else
        return false;

}


// get tack from play list  by id
function getTrackFromPlayListByid(id) {
    var track;
    for (var i = 0; i < playList.length; i++) {
        if (playList[i].id == id) {
            track = playList[i];
            break;
        }
    }
    return track;


}


// this function return  index from given list
function getIndexFromListByid(trackList, id) {
    var index = -1;
    for (var i = 0; i < trackList.length; i++) {
        if (trackList[i].id == id) {
            index = i;
            break;
        }
    }
    return index;
}


// this function return  index from play list
function getIndexFromPlayListByid(id) {
    var index = -1;
    for (var i = 0; i < playList.length; i++) {
        if (playList[i].id == id) {
            index = i;
            break;
        }
    }
    return index;
}

//remove song from playList
function removeFromPlayList(track) {
    if (!localStorage.getItem('playListTime')) {
        localStorage.setItem("playListTime", JSON.stringify(new Date().getTime()));
    }

    var index = getIndexFromPlayListByid(track.id);
    if (index >= 0) {
        playList.splice(index, 1);
        localStorage.setItem("playlist", JSON.stringify(playList));
        $('.playlist-songs .track-' + track.id).remove();
        $('#' + track.id + ' .genre').toggleClass("selected-genre");
		$('#' + track.id + ' .genre .text').text("Add to playlist");
        updatePlayListCountAndTime();
    }
}


//  add song to playList
function addToPlayList(track) {
    if (!localStorage.getItem('playListTime')) {
        localStorage.setItem("playListTime", new Date().getTime());

    }
    if (playList == null) { playList = []; }
    playList.push(track);
    localStorage.setItem("playlist", JSON.stringify(playList));
	$('#' + track.id + ' .genre .text').text("Added");
    $('#' + track.id + ' .genre').toggleClass("selected-genre");
    $('.playlist-songs').append(getplayListTrackHtml(track));
    updatePlayListCountAndTime();
}


// this function return playlist track in html format
function getplayListTrackHtml(track) {

    var title = track.title;
    if (track.title.length > 26) {
        title = track.title.substring(0, 26) + '...';

    }
    var info = '<div class="song-info track-' + track.id + '"><img src="' + track.artwork_url + '" width="70" height="70" class="album-covers" align="left" />' +
		'<div class="album-cover-overlay hide-overlay"><img width=22 alt="play" src="Images/play.svg" ></div>'+
        '<div class="info"><span class="song-title">' + title + '</span><span class="song-duration">'+moment.utc(track.duration).format('mm:ss')+ '</span></div>' +
        '<div class="stats"><span class="now-playing">Now playing <span class="rectangle-1"></span><span class="rectangle-2"></span><span class="rectangle-3"></span></span><span class="genre">Remove</span></div></div >';

    return info;

}

// this function update playlist count an duration
function updatePlayListCountAndTime() {
    var duration = 0;
    for (var i = 0; i < playList.length; i++) {
        duration += playList[i].duration;
    }
    $('.playlist-count').text(playList.length +' tracks');
    $('.playlist-time').text(moment.utc(duration).format('m')+ ' mins');

}


// this function load play list on page load
function loadPlayList() {
    for (var i = 0; i < playList.length; i++) {
        $('.playlist-songs').append(getplayListTrackHtml(playList[i]));
    }
    updatePlayListCountAndTime();
}

// this function play previous song
function playPrevSong() {
    if (player == null) { return }

    // for playlist
    if (isPlaylist) {

        var list = playList;
        if (isRandomPlayList) {
            list = randomPlayList;
        }
        var currentIndex = getIndexFromListByid(list, currentTrack.id);
        // player.dispose();
        if (list.length > currentIndex - 1) {
            playSong(list[currentIndex - 1]);
        } else {
            playSong(list[0]);
        }


    }
    // for tracklist
    else {
        var list = trackList;
        if (isRandomPlay) {
            list = randomTrackList;
        }
        var currentIndex = getIndexFromListByid(list, currentTrack.id);
        //  player.dispose();
        if (list.length > currentIndex - 1) {
            playSong(list[currentIndex - 1]);
        } else {
            playSong(list[0]);
        }
    }
}

// this function plays next song
function playNextSong() {
    if (player == null) { return }

    // for playlist
    if (isPlaylist) {

        var list = playList;
        if (isRandomPlayList) {
            list = randomPlayList;
        }
        var currentIndex = getIndexFromListByid(list, currentTrack.id);
        //   player.dispose();
        if (list.length > currentIndex + 1) {
            playSong(list[currentIndex + 1]);
        } else {
            playSong(list[0]);
        }


    }
    // for tracklist
    else {
        var list = trackList;
        if (isRandomPlay) {
            list = randomTrackList;
        }
        var currentIndex = getIndexFromListByid(list, currentTrack.id);
        // player.dispose();
        if (list.length > currentIndex + 1) {
            playSong(list[currentIndex + 1]);
        } else {
            playSong(list[0]);
        }
    }

}

// play random playlist songs
function toggleRandomPlayList() {
    if (isRandomPlayList) {
        isRandomPlayList = false;
		$('.shuffle-big img').attr('src','Images/random_play.svg');

    } else {
		$('.shuffle-big img').attr('src','Images/random_play_selected.svg');
        isRandomPlayList = true;
        randomPlayList = playList.slice();
        randomPlayList.sort(function (a, b) { return 0.5 - Math.random() });
		if(randomPlayList.length>0){
			isPlaylist = false;
            isSearch = false;
			playSong(randomPlayList[0]);
		}
    }
}



// play random songs
function toggleRandomTracks() {
    if (isRandomPlay) {
        isRandomPlay = false;
		$('.controlls .random_song').attr('src','Images/random_play.svg');

    } else {
        isRandomPlay = true;
		$('.controlls .random_song').attr('src','Images/random_play_selected.svg');
        randomTrackList = trackList.slice();
        randomTrackList.sort(function (a, b) { return 0.5 - Math.random() });

		
    }
}


//play specefic song
function playSong(track, repeat = true) {
    if (player != null) {
        player.dispose();
    }
    var trackId = track.id;

    SC.stream("/tracks/" + trackId).then(function (sound) {
        player = sound;
        if (sound.options.protocols[0] === 'rtmp') {
            sound.options.protocols.splice(0, 1);
        }
        sound.play();
        $(".track_volume").css('width', ((sound.getVolume() / 1) * 100) + '%');
        sound.on("time", function () {
            $(".timeline").css('width', ((sound.currentTime() / sound.options.duration) * 100) + '%');
            $(".timeline_big").css('width', ((sound.currentTime() / sound.options.duration) * 100) + '%');

            $(".footer .current-time").text(moment.utc(sound.currentTime()).format('mm:ss'));
        });

        sound.on("finish", function () {
            if (repeat) {
                playNextSong();
            }
        });




        sound.on("pause", function () {
            $(".controlls .play_song").attr("src", "Images/play.svg");
        });


        sound.on("play-resume", function () {
            $(".controlls .play_song").attr("src", "Images/pause.svg");
        });


        sound.on("play-start", function () {
            $(".controlls .play_song").attr("src", "Images/pause.svg");	
			if(currentTrack !=null){
				$("#"+currentTrack.id).toggleClass("selected-song");
				$("#"+currentTrack.id+" .add-playlist").toggle();
				$("#"+currentTrack.id+" .now-playing").toggle();
				$(".track-"+currentTrack.id).toggleClass("selected-song");
				$(".track-"+currentTrack.id+" .genre").toggle();
				$(".track-"+currentTrack.id+" .now-playing").toggle();
				
				
			}
            currentTrack = track;
			if(currentTrack !=null){
				$("#"+currentTrack.id).toggleClass("selected-song");
				$("#"+currentTrack.id+" .add-playlist").toggle();
				$("#"+currentTrack.id+" .now-playing").toggle();
				$(".track-"+currentTrack.id).toggleClass("selected-song");
				$(".track-"+currentTrack.id+" .genre").toggle();
				$(".track-"+currentTrack.id+" .now-playing").toggle();
			}
            var title = track.title;
            if (track.title.length > 50) {
                title = track.title.substring(0, 50) + '...';
            }
			$('.footer .album-cover').removeClass("default-album-cover");
            $('.footer .album-cover').attr("src", track.artwork_url);
            $('.footer .song-title').text(title);
            $('.footer .total-time').text(moment.utc(sound.options.duration).format('mm:ss'));

        });

        $(".controlls .volume-line").click(function (e) {

            var x = e.pageX - $(this).offset().left;
            var width = $(this).width();
            var maxVolume = 1;
            sound.setVolume((x / width) * maxVolume);
            $(".track_volume").css('width', ((sound.getVolume() / 1) * 100) + '%');
            

        });


        $(".song-timeline").click(function (e) {
            var x = e.pageX - $(this).offset().left;
            var width = $(this).width();
            var duration = sound.options.duration;
            sound.seek((x / width) * duration);
        });
    });
}



// get tracks for specefix gener
function getTrack(genre, pageSize) {
    var array = [];
    if (genre == 'Latest 25') {
        genre = '';
    }
    SC.get('/tracks', {
        q: 'remix', genres: genre, created_at: {
            from: moment().subtract(7, 'days').format('YYYY-MM-DD  00:00:01'),
            to: moment().format('YYYY-MM-DD  00:00:01')
        }, limit: pageSize
    }).then(function (tracks) {

        tracks.sort(function (a, b) {
            a = new Date(a.created_at);
            b = new Date(b.created_at);
            return a > b ? -1 : a < b ? 1 : 0;
        });
        listRefreshTime = new Date().getTime();
        var length = tracks.length;
        if (length > 25) {
            length = 25;
        }


        for (var i = 0; i < length; i++) {
            trackList.push(tracks[i]);
            var title = tracks[i].title;
            if (tracks[i].title.length > 40) {
                title = tracks[i].title.substring(0, 40) + '...';
            }
            var selectedClass = 'selected-genre';
			var text = 'Added';
            var result = getTrackFromPlayListByid(tracks[i].id);
            if (result == null) {
                selectedClass = '';
				var text = 'Add to playlist';
            }
            var songRow = ' <div id="' + tracks[i].id + '" class="row song"> <div class="col-lg-1 song-number">' + trackList.length + '</div>' +
                '<div class="col-lg-7 song-info" > <img src="' + tracks[i].artwork_url + '" width="48" height="48" class="album-cover">' +
				'<div class="album-cover-overlay hide-overlay"><img width=16 alt="play" src="Images/play.svg" ></div>'+
                '<span class="song-title">' + title + '</span> </div>' +
                '<div class="col-lg-3 add-playlist"> <div class="genre ' + selectedClass + '"><span class="text">' + text + '</span><img class="genre-image" src="Images/tick.svg" width="17" height="13"> </div></div>' +
                '<div class="col-lg-3 now-playing">Now playing <span class="rectangle-1"></span><span class="rectangle-2"></span><span class="rectangle-3"></span></div>'+
				'<div class="col-lg-2 play-count"><span><img style="margin-right: 5px;margin-bottom: 2px;" width="8px" src="Images/small-play.svg"></span><span>' + tracks[i].likes_count + ' / ' + tracks[i].playback_count + '</span> </div></div>'

            $('.trackList').append(songRow);
        }
    });

}



function getTrackForSearchResult(query) {
    query = query + ' remix';
    var array = [];
    SC.get('/tracks', {
        q: query
    }).then(function (tracks) {
        searchList = [];
        $('.search_result').text("");
        for (var i = 0; i < tracks.length; i++) {
            searchList.push(tracks[i]);
            var index = i;
            var title = tracks[i].title;
            if (tracks[i].title.length > 40) {
                title = tracks[i].title.substring(0, 40) + '...';
            }
            var selectedClass = 'selected-genre';
            var result = getTrackFromPlayListByid(tracks[i].id);
            if (result == null) {
                selectedClass = '';
            }
            var songRow = ' <div id="' + tracks[i].id + '" class="row song"> <div class="col-lg-1 song-number">' + ++index + '</div>' +
                '<div class="col-lg-7 song-info" > <img src="' + tracks[i].artwork_url + '" width="48" height="48" class="album-cover">' +
				'<div class="album-cover-overlay hide-overlay"><img width=16 alt="play" src="Images/play.svg" ></div>'+
                '<span class="song-title">' + title + '</span> </div>' +
                '<div class="col-lg-3 add-playlist"> <div class="genre ' + selectedClass + '"><span class="text">Add to playlist</span><img class="genre-image" src="Images/ tick.svg" width="17" height="13"> </div></div>' +
                '<div class="col-lg-3 now-playing">Now playing <span class="rectangle-1"></span><span class="rectangle-2"></span><span class="rectangle-3"></span></div>'+               
			   '<div class="col-lg-2 play-count"><span><img style="margin-right: 5px;margin-bottom: 2px;" width="8px" src="Images/small-play.svg"></span><span>' + tracks[i].likes_count + ' /' + tracks[i].playback_count + '</span> </div></div>'

            $('.search_result').append(songRow);
        }
    });
}












